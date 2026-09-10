package com.eventscoordinator.backend.service;

import com.eventscoordinator.backend.dto.CommerceDtos.*;
import com.eventscoordinator.backend.mapper.CommerceMapper;
import com.eventscoordinator.backend.model.*;
import com.eventscoordinator.backend.repository.*;
import com.eventscoordinator.backend.security.CurrentAccount;
import java.time.*;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CheckoutService {
  private final PurchaseOrderRepository orders;
  private final AccountRepository accounts;
  private final ReservationRepository reservations;
  private final IssuedTicketRepository tickets;
  private final SeatRepository seats;
  private final CurrentAccount current;
  private final CommerceMapper mapper;
  private final long usdcSeconds;

  public CheckoutService(
      PurchaseOrderRepository o,
      AccountRepository a,
      ReservationRepository r,
      IssuedTicketRepository t,
      SeatRepository s,
      CurrentAccount c,
      CommerceMapper m,
      @Value("${app.usdc.processing-seconds}") long sec) {
    orders = o;
    accounts = a;
    reservations = r;
    tickets = t;
    seats = s;
    current = c;
    mapper = m;
    usdcSeconds = sec;
  }

  @PreAuthorize("hasRole('CUSTOMER')")
  @Transactional
  public OrderResponse checkout(CheckoutRequest req) {
    Account customer = accounts.findLocked(current.id()).orElseThrow(() -> nf("Customer"));
    var existing = orders.findByCustomerIdAndIdempotencyKey(customer.getId(), req.idempotencyKey());
    if (existing.isPresent()) return mapper.toResponse(refresh(existing.get()));
    Reservation r =
        reservations.findLocked(req.reservationId()).orElseThrow(() -> nf("Reservation"));
    own(r);
    if (r.expired(Instant.now())) throw new IllegalStateException("Reservation has expired");
    if (r.getStatus() != ReservationStatus.ACTIVE)
      throw new IllegalStateException("Reservation is not active");
    OrderStatus status =
        req.paymentMethod() == PaymentMethod.USDC ? OrderStatus.PENDING : OrderStatus.PAID;
    Instant process = status == OrderStatus.PENDING ? Instant.now().plusSeconds(usdcSeconds) : null;
    PurchaseOrder o =
        orders.save(
            new PurchaseOrder(
                customer,
                r,
                req.idempotencyKey(),
                req.paymentMethod(),
                status,
                r.getUnitPrice().multiply(java.math.BigDecimal.valueOf(r.getQuantity())),
                process));
    r.convert();
    if (status == OrderStatus.PAID) {
      o.markPaid(Instant.now());
      issue(o);
    }
    return mapper.toResponse(o);
  }

  @PreAuthorize("hasRole('CUSTOMER')")
  @Transactional
  public OrderResponse status(Long id) {
    PurchaseOrder o = orders.findById(id).orElseThrow(() -> nf("Order"));
    if (!o.getCustomer().getId().equals(current.id()))
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Order ownership required");
    return mapper.toResponse(refresh(o));
  }

  @PreAuthorize("hasRole('CUSTOMER')")
  @Transactional
  public List<OrderResponse> history() {
    return orders.findByCustomerIdOrderByCreatedAtDesc(current.id()).stream()
        .map(this::refresh)
        .map(mapper::toResponse)
        .toList();
  }

  PurchaseOrder refresh(PurchaseOrder o) {
    if (o.ready(Instant.now())) {
      o.markPaid(Instant.now());
      issue(o);
    }
    return o;
  }

  void issue(PurchaseOrder o) {
    if (tickets.countByOrderId(o.getId()) > 0) return;
    Reservation r = o.getReservation();
    if (r.getSeat() != null) seats.findLocked(r.getSeat().getId()).orElseThrow().sell();
    for (int i = 0; i < r.getQuantity(); i++)
      tickets.save(new IssuedTicket(o, r.getEvent(), r.getTier(), r.getSeat(), o.getCustomer()));
  }

  void own(Reservation r) {
    if (!r.getCustomer().getId().equals(current.id()))
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Reservation ownership required");
  }

  private ResponseStatusException nf(String x) {
    return new ResponseStatusException(HttpStatus.NOT_FOUND, x + " not found");
  }
}
