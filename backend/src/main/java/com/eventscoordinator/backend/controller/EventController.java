package com.eventscoordinator.backend.controller;

import com.eventscoordinator.backend.dto.EventDtos.BookRequest;
import com.eventscoordinator.backend.dto.EventDtos.EventResponse;
import com.eventscoordinator.backend.dto.EventDtos.EventUpdateRequest;
import com.eventscoordinator.backend.dto.EventDtos.SlotRequest;
import com.eventscoordinator.backend.dto.EventDtos.SlotResponse;
import com.eventscoordinator.backend.service.EventService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class EventController {
  private final EventService events;

  public EventController(EventService events) {
    this.events = events;
  }

  @GetMapping("/events")
  public List<EventResponse> browse(@RequestParam(required = false) String q) {
    return events.browse(q);
  }

  @GetMapping("/events/{id}")
  public EventResponse event(@PathVariable Long id) {
    return events.event(id);
  }

  @PutMapping("/events/{id}")
  public EventResponse update(
      @PathVariable Long id, @Valid @RequestBody EventUpdateRequest request) {
    return events.updateEvent(id, request);
  }

  @DeleteMapping("/events/{id}")
  public EventResponse cancel(@PathVariable Long id) {
    return events.cancelEvent(id);
  }

  @GetMapping("/venues/{venueId}/slots")
  public List<SlotResponse> open(@PathVariable Long venueId) {
    return events.openSlots(venueId);
  }

  @PostMapping("/venues/{venueId}/slots")
  @ResponseStatus(HttpStatus.CREATED)
  public SlotResponse add(@PathVariable Long venueId, @Valid @RequestBody SlotRequest request) {
    return events.addSlot(venueId, request);
  }

  @GetMapping("/venue/slots")
  public List<SlotResponse> mySlots() {
    return events.mySlots();
  }

  @GetMapping({"/venue/events", "/venue/bookings", "/venues/me/bookings"})
  public List<EventResponse> venueBookings() {
    return events.venueBookings();
  }

  @GetMapping({"/artist/events", "/artists/me/events"})
  public List<EventResponse> artistEvents() {
    return events.myEvents();
  }

  @PutMapping("/venue/slots/{id}")
  public SlotResponse updateSlot(@PathVariable Long id, @Valid @RequestBody SlotRequest request) {
    return events.updateSlot(id, request);
  }

  @DeleteMapping("/venue/slots/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void remove(@PathVariable Long id) {
    events.deleteSlot(id);
  }

  @PostMapping("/artist/slots/{slotId}/book")
  @ResponseStatus(HttpStatus.CREATED)
  public EventResponse book(@PathVariable Long slotId, @Valid @RequestBody BookRequest request) {
    return events.book(slotId, request);
  }

  @RequestMapping(
      path = {
        "/venue/events/{id}/approve",
        "/venue/bookings/{id}/approve",
        "/venues/me/bookings/{id}/approve",
        "/events/{id}/approve"
      },
      method = {RequestMethod.PATCH, RequestMethod.POST, RequestMethod.PUT})
  public EventResponse approve(@PathVariable Long id) {
    return events.approve(id);
  }

  @RequestMapping(
      path = {
        "/venue/events/{id}/reject",
        "/venue/bookings/{id}/reject",
        "/venues/me/bookings/{id}/reject",
        "/events/{id}/reject"
      },
      method = {RequestMethod.PATCH, RequestMethod.POST, RequestMethod.PUT})
  public EventResponse reject(@PathVariable Long id) {
    return events.reject(id);
  }
}
