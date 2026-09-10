package com.eventscoordinator.backend.service;

import com.eventscoordinator.backend.dto.CommerceDtos.*;
import com.eventscoordinator.backend.mapper.CommerceMapper;
import com.eventscoordinator.backend.model.*;
import com.eventscoordinator.backend.repository.*;
import com.eventscoordinator.backend.security.CurrentAccount;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TicketService {
  private final IssuedTicketRepository tickets;
  private final AccountRepository accounts;
  private final CurrentAccount current;
  private final CommerceMapper mapper;

  public TicketService(
      IssuedTicketRepository t, AccountRepository a, CurrentAccount c, CommerceMapper m) {
    tickets = t;
    accounts = a;
    current = c;
    mapper = m;
  }

  @PreAuthorize("hasRole('CUSTOMER')")
  @Transactional(readOnly = true)
  public List<TicketResponse> mine() {
    return tickets.findByOwnerIdOrderByIssuedAtDesc(current.id()).stream()
        .map(mapper::toResponse)
        .toList();
  }

  @PreAuthorize("hasRole('CUSTOMER')")
  @Transactional
  public TicketResponse transfer(Long id, TransferRequest r) {
    IssuedTicket t = tickets.findLocked(id).orElseThrow(() -> nf("Ticket"));
    if (!t.getOwner().getId().equals(current.id()))
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Ticket ownership required");
    Account recipient =
        accounts.findByEmailIgnoreCase(r.recipientEmail()).orElseThrow(() -> nf("Recipient"));
    if (recipient.getRole() != Role.CUSTOMER)
      throw new IllegalArgumentException("Recipient must be a customer");
    if (recipient.getId().equals(current.id()))
      throw new IllegalArgumentException("Cannot transfer a ticket to yourself");
    t.transfer(recipient);
    return mapper.toResponse(t);
  }

  private ResponseStatusException nf(String x) {
    return new ResponseStatusException(HttpStatus.NOT_FOUND, x + " not found");
  }
}
