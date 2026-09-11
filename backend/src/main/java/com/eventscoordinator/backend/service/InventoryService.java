package com.eventscoordinator.backend.service;

import com.eventscoordinator.backend.dto.CommerceDtos.*;
import com.eventscoordinator.backend.mapper.CommerceMapper;
import com.eventscoordinator.backend.model.*;
import com.eventscoordinator.backend.repository.*;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class InventoryService {
  private final EventRepository events;
  private final TicketTierRepository tiers;
  private final SeatRepository seats;
  private final CommerceMapper mapper;

  public InventoryService(
      EventRepository e, TicketTierRepository t, SeatRepository s, CommerceMapper m) {
    events = e;
    tiers = t;
    seats = s;
    mapper = m;
  }

  @Transactional(readOnly = true)
  public List<TierResponse> tiers(Long eventId) {
    return tiers.findByEventIdOrderByPriceAsc(eventId).stream().map(mapper::toResponse).toList();
  }

  private static final int MAX_TIERS_PER_EVENT = 4;

  @PreAuthorize("hasRole('ARTIST') and @ownership.artistEvent(#eventId)")
  @Transactional
  public TierResponse addTier(Long eventId, TierRequest r) {
    Event e = events.findById(eventId).orElseThrow(() -> nf("Event"));
    if (tiers.findByEventIdOrderByPriceAsc(eventId).size() >= MAX_TIERS_PER_EVENT) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "An event can have at most " + MAX_TIERS_PER_EVENT + " ticket types");
    }
    return mapper.toResponse(tiers.save(new TicketTier(e, r.name(), r.price(), r.quantity())));
  }

  @PreAuthorize("hasRole('ARTIST')")
  @Transactional
  public TierResponse updateTier(Long id, TierRequest r) {
    TicketTier t = tiers.findById(id).orElseThrow(() -> nf("Tier"));
    if (!t.getEvent().getArtist().getAccount().getId().equals(currentId()))
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Artist ownership required");
    t.update(r.name(), r.price(), r.quantity());
    return mapper.toResponse(t);
  }

  @Transactional(readOnly = true)
  public List<SeatResponse> seats(Long eventId) {
    return seats.findByEventIdOrderBySectionAscRowAscNumberAsc(eventId).stream()
        .map(mapper::toResponse)
        .toList();
  }

  @PreAuthorize("hasRole('VENUE') and @ownership.venueEvent(#eventId)")
  @Transactional
  public List<SeatResponse> addSeats(Long eventId, SeatBatchRequest r) {
    Event e = events.findById(eventId).orElseThrow(() -> nf("Event"));
    TicketTier t = tiers.findById(r.tierId()).orElseThrow(() -> nf("Tier"));
    if (!t.getEvent().getId().equals(eventId))
      throw new IllegalArgumentException("Tier belongs to another event");
    List<Seat> made = new ArrayList<>();
    for (int i = 0; i < r.count(); i++)
      made.add(new Seat(e, t, r.section(), r.row(), r.firstNumber() + i));
    return seats.saveAll(made).stream().map(mapper::toResponse).toList();
  }

  private Long currentId() {
    return org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal()
            instanceof com.eventscoordinator.backend.security.AccountPrincipal p
        ? p.id()
        : -1L;
  }

  private ResponseStatusException nf(String x) {
    return new ResponseStatusException(HttpStatus.NOT_FOUND, x + " not found");
  }
}
