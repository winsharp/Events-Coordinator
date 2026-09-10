package com.eventscoordinator.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eventscoordinator.backend.dto.VenueDateResponse;
import com.eventscoordinator.backend.model.Role;
import com.eventscoordinator.backend.security.AppAccountPrincipal;
import com.eventscoordinator.backend.service.ArtistBookingService;

@RestController
@RequestMapping("/api/artists/me/bookings")
public class ArtistBookingController {

    private final ArtistBookingService artistBookingService;

    public ArtistBookingController(ArtistBookingService artistBookingService) {
        this.artistBookingService = artistBookingService;
    }

    @PostMapping("/{eventId}")
    public ResponseEntity<VenueDateResponse> bookDate(
            @PathVariable Long eventId,
            @AuthenticationPrincipal AppAccountPrincipal principal) {
        requireArtistRole(principal);
        VenueDateResponse response = artistBookingService.bookDate(principal.getAccount().getId(), eventId);
        return ResponseEntity.ok(response);
    }

    private void requireArtistRole(AppAccountPrincipal principal) {
        if (principal.getAccount().getRole() != Role.ARTIST) {
            throw new AccessDeniedException("Only artist accounts can book dates");
        }
    }
}