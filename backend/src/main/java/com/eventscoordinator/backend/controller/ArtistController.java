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

import com.eventscoordinator.backend.dto.ArtistProfileRequest;
import com.eventscoordinator.backend.dto.ArtistResponse;
import com.eventscoordinator.backend.security.AppAccountPrincipal;
import com.eventscoordinator.backend.service.ArtistService;

@RestController
@RequestMapping("/api/artists")
public class ArtistController {

    private final ArtistService artistService;

    public ArtistController(ArtistService artistService) {
        this.artistService = artistService;
    }

    @PostMapping
    public ResponseEntity<ArtistResponse> createProfile(@AuthenticationPrincipal AppAccountPrincipal principal, @RequestBody ArtistProfileRequest request) {
        ArtistResponse response = artistService.createProfile(principal.getAccount(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ArtistResponse getById(@PathVariable Long id) {
        return artistService.getById(id);
    }

    @GetMapping("/me")
    public ArtistResponse getOwnProfile(@AuthenticationPrincipal AppAccountPrincipal principal) {
        return artistService.getOwnProfile(principal.getAccount());
    }

    @PutMapping("/me")
    public ArtistResponse updateOwnProfile(@AuthenticationPrincipal AppAccountPrincipal principal, @RequestBody ArtistProfileRequest request) {
        return artistService.updateOwnProfile(principal.getAccount(), request);
    }
}
