package com.eventscoordinator.backend.controller;

import com.eventscoordinator.backend.dto.ProfileDtos.ArtistRequest;
import com.eventscoordinator.backend.dto.ProfileDtos.ArtistResponse;
import com.eventscoordinator.backend.dto.ProfileDtos.VenueRequest;
import com.eventscoordinator.backend.dto.ProfileDtos.VenueResponse;
import com.eventscoordinator.backend.service.ProfileService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ProfileController {
  private final ProfileService profiles;

  public ProfileController(ProfileService profiles) {
    this.profiles = profiles;
  }

  @GetMapping("/artists")
  public List<ArtistResponse> artists(@RequestParam(required = false) String q) {
    return profiles.artists(q);
  }

  @GetMapping("/artists/{id}")
  public ArtistResponse artist(@PathVariable Long id) {
    return profiles.artist(id);
  }

  @GetMapping("/artists/me")
  public ArtistResponse myArtist() {
    return profiles.myArtist();
  }

  @PutMapping("/artists/me")
  public ArtistResponse saveArtist(@Valid @RequestBody ArtistRequest request) {
    return profiles.saveArtist(request);
  }

  @PostMapping("/artists")
  public ArtistResponse createArtist(@Valid @RequestBody ArtistRequest request) {
    return profiles.saveArtist(request);
  }

  @GetMapping("/venues")
  public List<VenueResponse> venues(@RequestParam(required = false) String q) {
    return profiles.venues(q);
  }

  @GetMapping("/venues/{id}")
  public VenueResponse venue(@PathVariable Long id) {
    return profiles.venue(id);
  }

  @GetMapping("/venues/me")
  public VenueResponse myVenue() {
    return profiles.myVenue();
  }

  @PutMapping("/venues/me")
  public VenueResponse saveVenue(@Valid @RequestBody VenueRequest request) {
    return profiles.saveVenue(request);
  }

  @PostMapping("/venues")
  public ResponseEntity<VenueResponse> publishVenue(@Valid @RequestBody VenueRequest request) {
    VenueResponse response = profiles.publishVenue(request);
    return ResponseEntity.created(URI.create("/api/venues/" + response.id())).body(response);
  }
}
