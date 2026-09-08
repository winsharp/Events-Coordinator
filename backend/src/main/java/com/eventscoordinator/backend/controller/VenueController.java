package com.eventscoordinator.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eventscoordinator.backend.dto.VenueProfileRequest;
import com.eventscoordinator.backend.dto.VenueResponse;
import com.eventscoordinator.backend.security.AppUserPrincipal;
import com.eventscoordinator.backend.service.VenueService;

@RestController
@RequestMapping("/api/venues")
public class VenueController {

    private final VenueService venueService;

    public VenueController(VenueService venueService) {
        this.venueService = venueService;
    }

    @PostMapping
    public ResponseEntity<VenueResponse> createProfile(@AuthenticationPrincipal AppUserPrincipal principal, @RequestBody VenueProfileRequest request) {
        VenueResponse response = venueService.createProfile(principal.getUser(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public VenueResponse getById(@PathVariable Long id) {
        return venueService.getById(id);
    }

    @GetMapping("/me")
    public VenueResponse getOwnProfile(@AuthenticationPrincipal AppUserPrincipal principal) {
        return venueService.getOwnProfile(principal.getUser());
    }

    @PutMapping("/me")
    public VenueResponse updateOwnProfile(@AuthenticationPrincipal AppUserPrincipal principal, @RequestBody VenueProfileRequest request) {
        return venueService.updateOwnProfile(principal.getUser(), request);
    }
}
