package com.eventscoordinator.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eventscoordinator.backend.dto.VenueDateResponse;
import com.eventscoordinator.backend.service.VenueAvailabilityService;

@RestController
@RequestMapping("/api/venues/{venueId}/dates")
public class VenueDateController {

    private final VenueAvailabilityService venueAvailabilityService;

    public VenueDateController(VenueAvailabilityService venueAvailabilityService) {
        this.venueAvailabilityService = venueAvailabilityService;
    }

    @GetMapping
    public List<VenueDateResponse> getDatesForVenue(@PathVariable Long venueId) {
        return venueAvailabilityService.getDatesForVenue(venueId);
    }
}