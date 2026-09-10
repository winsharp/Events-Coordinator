package com.eventscoordinator.backend.service;

import com.eventscoordinator.backend.dto.EventDtos.*;
import com.eventscoordinator.backend.mapper.EventMapper;
import com.eventscoordinator.backend.model.*;
import com.eventscoordinator.backend.repository.*;
import com.eventscoordinator.backend.security.CurrentAccount;
import java.time.Instant;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class EventService {
  private final AvailabilitySlotRepository slots;
  private final VenueRepository venues;
  private final ArtistRepository artists;
  private final EventRepository events;
  private final CurrentAccount current;
  private final EventMapper mapper;

  public EventService(
      AvailabilitySlotRepository slots,
      VenueRepository venues,
      ArtistRepository artists,
      EventRepository events,
      CurrentAccount current,
      EventMapper mapper) {
    this.slots = slots;
    this.venues = venues;
    this.artists = artists;
    this.events = events;
    this.current = current;
    this.mapper = mapper;
  }

  @Transactional(readOnly = true)
  public List<EventResponse> browse(String query) {
    var stream = events.findByStatusOrderByStartAtAsc(EventStatus.CONFIRMED).stream();
    if (query != null && !query.isBlank()) {
      String needle = query.toLowerCase(Locale.ROOT);
      stream =
          stream.filter(
              event ->
                  event.getTitle().toLowerCase(Locale.ROOT).contains(needle)
                      || event.getArtist().getStageName().toLowerCase(Locale.ROOT).contains(needle)
                      || event.getVenue().getName().toLowerCase(Locale.ROOT).contains(needle)
                      || event.getVenue().getCity().toLowerCase(Locale.ROOT).contains(needle));
    }
    return stream.map(mapper::toResponse).toList();
  }

  @Transactional(readOnly = true)
  public EventResponse event(Long id) {
    Event event = events.findById(id).orElseThrow(() -> notFound("Event"));
    if (event.getStatus() != EventStatus.CONFIRMED) throw notFound("Event");
    return mapper.toResponse(event);
  }

  @Transactional(readOnly = true)
  public List<SlotResponse> openSlots(Long venueId) {
    return slots.findByVenueIdAndStatusOrderByStartAt(venueId, SlotStatus.OPEN).stream()
        .map(mapper::toResponse)
        .toList();
  }

  @PreAuthorize("hasRole('VENUE') and @ownership.venue(#venueId)")
  @Transactional
  public SlotResponse addSlot(Long venueId, SlotRequest request) {
    validateRange(request.startAt(), request.endAt());
    Venue venue = venues.findById(venueId).orElseThrow(() -> notFound("Venue"));
    return mapper.toResponse(
        slots.save(new AvailabilitySlot(venue, request.startAt(), request.endAt())));
  }

  @PreAuthorize("hasRole('VENUE')")
  @Transactional(readOnly = true)
  public List<SlotResponse> mySlots() {
    Venue venue = venues.findByAccountId(current.id()).orElseThrow(() -> notFound("Venue profile"));
    Map<Long, Event> bySlot =
        events.findByVenueIdOrderByStartAtDesc(venue.getId()).stream()
            .collect(Collectors.toMap(event -> event.getSlot().getId(), Function.identity()));
    return slots.findByVenueIdOrderByStartAt(venue.getId()).stream()
        .map(slot -> mapper.toResponse(slot, bySlot.get(slot.getId())))
        .toList();
  }

  @PreAuthorize("hasRole('VENUE')")
  @Transactional(readOnly = true)
  public List<EventResponse> venueBookings() {
    Venue venue = venues.findByAccountId(current.id()).orElseThrow(() -> notFound("Venue profile"));
    return events.findByVenueIdOrderByStartAtDesc(venue.getId()).stream()
        .map(mapper::toResponse)
        .toList();
  }

  @PreAuthorize("hasRole('ARTIST')")
  @Transactional(readOnly = true)
  public List<EventResponse> myEvents() {
    Artist artist =
        artists.findByAccountId(current.id()).orElseThrow(() -> notFound("Artist profile"));
    return events.findByArtistIdOrderByStartAtDesc(artist.getId()).stream()
        .filter(
            event ->
                event.getStatus() == EventStatus.PENDING
                    || event.getStatus() == EventStatus.CONFIRMED)
        .map(mapper::toResponse)
        .toList();
  }

  @PreAuthorize("hasRole('VENUE')")
  @Transactional
  public SlotResponse updateSlot(Long id, SlotRequest request) {
    validateRange(request.startAt(), request.endAt());
    AvailabilitySlot slot = slots.findLocked(id).orElseThrow(() -> notFound("Slot"));
    ownVenue(slot.getVenue());
    if (slot.getStatus() != SlotStatus.OPEN)
      throw new IllegalStateException("Only open slots can be updated");
    slot.update(request.startAt(), request.endAt());
    return mapper.toResponse(slot);
  }

  @PreAuthorize("hasRole('VENUE')")
  @Transactional
  public void deleteSlot(Long id) {
    AvailabilitySlot slot = slots.findLocked(id).orElseThrow(() -> notFound("Slot"));
    ownVenue(slot.getVenue());
    slot.cancel();
  }

  @PreAuthorize("hasRole('ARTIST')")
  @Transactional
  public EventResponse book(Long slotId, BookRequest request) {
    AvailabilitySlot slot = slots.findLocked(slotId).orElseThrow(() -> notFound("Slot"));
    if (slot.getStatus() != SlotStatus.OPEN)
      throw new IllegalStateException("Slot is no longer open");
    Artist artist =
        artists.findByAccountId(current.id()).orElseThrow(() -> notFound("Artist profile"));
    slot.book();
    return mapper.toResponse(
        events.save(
            new Event(slot.getVenue(), artist, slot, request.title(), request.description())));
  }

  @PreAuthorize("hasRole('VENUE') and @ownership.venueEvent(#id)")
  @Transactional
  public EventResponse approve(Long id) {
    Event event = events.findLocked(id).orElseThrow(() -> notFound("Booking request"));
    event.approve();
    return mapper.toResponse(event);
  }

  @PreAuthorize("hasRole('VENUE') and @ownership.venueEvent(#id)")
  @Transactional
  public EventResponse reject(Long id) {
    Event event = events.findLocked(id).orElseThrow(() -> notFound("Booking request"));
    event.reject();
    event.getSlot().reject();
    return mapper.toResponse(event);
  }

  @PreAuthorize("hasRole('VENUE') and @ownership.venueEvent(#id)")
  @Transactional
  public EventResponse updateEvent(Long id, EventUpdateRequest request) {
    validateRange(request.startAt(), request.endAt());
    Event event = events.findLocked(id).orElseThrow(() -> notFound("Event"));
    event.update(request.title(), request.description(), request.startAt(), request.endAt());
    return mapper.toResponse(event);
  }

  @PreAuthorize("hasRole('VENUE') and @ownership.venueEvent(#id)")
  @Transactional
  public EventResponse cancelEvent(Long id) {
    Event event = events.findLocked(id).orElseThrow(() -> notFound("Event"));
    event.cancel();
    return mapper.toResponse(event);
  }

  private void ownVenue(Venue venue) {
    if (!venue.getAccount().getId().equals(current.id()))
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Venue ownership required");
  }

  private void validateRange(Instant start, Instant end) {
    if (!end.isAfter(start))
      throw new IllegalArgumentException("End time must be after start time");
  }

  private ResponseStatusException notFound(String resource) {
    return new ResponseStatusException(HttpStatus.NOT_FOUND, resource + " not found");
  }
}
