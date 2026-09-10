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
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ReservationService {
  private final ReservationRepository reservations;
  private final TicketTierRepository tiers;
  private final SeatRepository seats;
  private final CurrentAccount current;
  private final CommerceMapper mapper;
  private final long minutes;

  public ReservationService(
      ReservationRepository r,
      TicketTierRepository t,
      SeatRepository s,
      CurrentAccount c,
      CommerceMapper m,
      @Value("${app.reservation.minutes}") long min) {
    reservations = r;
    tiers = t;
    seats = s;
    current = c;
    mapper = m;
    minutes = min;
  }

  @PreAuthorize("hasRole('CUSTOMER')")
  @Transactional
  public ReservationResponse reserve(ReservationRequest r) {
    releaseExpired();
    TicketTier t = tiers.findLocked(r.tierId()).orElseThrow(() -> nf("Tier"));
    if (t.getEvent().getStatus() != EventStatus.CONFIRMED)
      throw new IllegalStateException("Event is unavailable");
    Seat seat = null;
    if (r.seatId() != null) {
      if (r.quantity() != 1)
        throw new IllegalArgumentException("A seat reservation quantity must be one");
      seat = seats.findLocked(r.seatId()).orElseThrow(() -> nf("Seat"));
      if (!seat.getTier().getId().equals(t.getId()))
        throw new IllegalArgumentException("Seat belongs to another tier");
      seat.hold();
    }
    t.hold(r.quantity());
    return mapper.toResponse(
        reservations.save(
            new Reservation(
                current.get(),
                t.getEvent(),
                t,
                seat,
                r.quantity(),
                Instant.now().plus(Duration.ofMinutes(minutes)))));
  }

  @PreAuthorize("hasRole('CUSTOMER')")
  @Transactional
  public List<ReservationResponse> mine() {
    releaseExpired();
    return reservations.findByCustomerIdOrderByCreatedAtDesc(current.id()).stream()
        .map(mapper::toResponse)
        .toList();
  }

  @PreAuthorize("hasRole('CUSTOMER')")
  @Transactional
  public ReservationResponse release(Long id) {
    Reservation r = reservations.findLocked(id).orElseThrow(() -> nf("Reservation"));
    own(r);
    doRelease(r, ReservationStatus.RELEASED);
    return mapper.toResponse(r);
  }

  @Transactional(propagation = Propagation.MANDATORY)
  public void releaseExpired() {
    for (Reservation r :
        reservations.findByStatusAndExpiresAtBefore(ReservationStatus.ACTIVE, Instant.now()))
      doRelease(r, ReservationStatus.EXPIRED);
  }

  @Scheduled(fixedDelay = 60000)
  @Transactional
  public void cleanup() {
    releaseExpired();
  }

  void doRelease(Reservation r, ReservationStatus status) {
    r.release(status);
    tiers.findLocked(r.getTier().getId()).orElseThrow().release(r.getQuantity());
    if (r.getSeat() != null) seats.findLocked(r.getSeat().getId()).orElseThrow().release();
  }

  void own(Reservation r) {
    if (!r.getCustomer().getId().equals(current.id()))
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Reservation ownership required");
  }

  private ResponseStatusException nf(String x) {
    return new ResponseStatusException(HttpStatus.NOT_FOUND, x + " not found");
  }
}
