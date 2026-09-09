package com.eventscoordinator.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import com.eventscoordinator.backend.dto.AddDateRequest;
import com.eventscoordinator.backend.dto.VenueDateResponse;
import com.eventscoordinator.backend.model.Role;
import com.eventscoordinator.backend.security.AppAccountPrincipal;
import com.eventscoordinator.backend.service.VenueAvailabilityService;

@RestController
@RequestMapping("/api/venues/me/dates")
public class VenueAvailabilityController {

    private final VenueAvailabilityService service;

    public VenueAvailabilityController(VenueAvailabilityService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<VenueDateResponse> addDate(
            @Valid @RequestBody AddDateRequest request,
            @AuthenticationPrincipal AppAccountPrincipal principal) {
        requireVenueRole(principal);
        VenueDateResponse response = service.addAvailableDate(principal.getAccount().getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<VenueDateResponse>> getMyDates(
            @AuthenticationPrincipal AppAccountPrincipal principal) {
        requireVenueRole(principal);
        return ResponseEntity.ok(service.getMyDates(principal.getAccount().getId()));
    }

    @DeleteMapping("/{eventId}")
    public ResponseEntity<Void> removeDate(
            @PathVariable Long eventId,
            @AuthenticationPrincipal AppAccountPrincipal principal) {
        requireVenueRole(principal);
        service.removeDate(principal.getAccount().getId(), eventId);
        return ResponseEntity.noContent().build();
    }

    private void requireVenueRole(AppAccountPrincipal principal) {
        if (principal.getAccount().getRole() != Role.VENUE) {
            throw new AccessDeniedException("Only venue accounts can manage availability");
        }
    }
}