package com.eventscoordinator.backend.controller;

import com.eventscoordinator.backend.dto.CommerceDtos.*;
import com.eventscoordinator.backend.service.InventoryService;
import jakarta.validation.Valid;
import java.util.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events/{eventId}")
public class InventoryController {
  private final InventoryService inventory;

  public InventoryController(InventoryService i) {
    inventory = i;
  }

  @GetMapping("/tiers")
  public List<TierResponse> tiers(@PathVariable Long eventId) {
    return inventory.tiers(eventId);
  }

  @PostMapping("/tiers")
  @ResponseStatus(HttpStatus.CREATED)
  public TierResponse addTier(@PathVariable Long eventId, @Valid @RequestBody TierRequest r) {
    return inventory.addTier(eventId, r);
  }

  @PutMapping("/tiers/{tierId}")
  public TierResponse update(
      @PathVariable Long eventId, @PathVariable Long tierId, @Valid @RequestBody TierRequest r) {
    return inventory.updateTier(tierId, r);
  }

  @GetMapping("/seats")
  public List<SeatResponse> seats(@PathVariable Long eventId) {
    return inventory.seats(eventId);
  }

  @PostMapping("/seats")
  @ResponseStatus(HttpStatus.CREATED)
  public List<SeatResponse> addSeats(
      @PathVariable Long eventId, @Valid @RequestBody SeatBatchRequest r) {
    return inventory.addSeats(eventId, r);
  }
}
