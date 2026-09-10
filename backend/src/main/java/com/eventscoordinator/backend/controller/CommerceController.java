package com.eventscoordinator.backend.controller;

import com.eventscoordinator.backend.dto.CommerceDtos.*;
import com.eventscoordinator.backend.service.*;
import jakarta.validation.Valid;
import java.util.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class CommerceController {
  private final ReservationService reservations;
  private final CheckoutService checkout;
  private final TicketService tickets;

  public CommerceController(ReservationService r, CheckoutService c, TicketService t) {
    reservations = r;
    checkout = c;
    tickets = t;
  }

  @PostMapping("/reservations")
  @ResponseStatus(HttpStatus.CREATED)
  public ReservationResponse reserve(@Valid @RequestBody ReservationRequest r) {
    return reservations.reserve(r);
  }

  @GetMapping("/reservations")
  public List<ReservationResponse> reservations() {
    return reservations.mine();
  }

  @DeleteMapping("/reservations/{id}")
  public ReservationResponse release(@PathVariable Long id) {
    return reservations.release(id);
  }

  @PostMapping("/checkout")
  public OrderResponse checkout(@Valid @RequestBody CheckoutRequest r) {
    return checkout.checkout(r);
  }

  @GetMapping("/orders")
  public List<OrderResponse> orders() {
    return checkout.history();
  }

  @GetMapping("/orders/{id}/status")
  public OrderResponse status(@PathVariable Long id) {
    return checkout.status(id);
  }

  @GetMapping("/tickets")
  public List<TicketResponse> tickets() {
    return tickets.mine();
  }

  @PostMapping("/tickets/{id}/transfer")
  public TicketResponse transfer(@PathVariable Long id, @Valid @RequestBody TransferRequest r) {
    return tickets.transfer(id, r);
  }
}
