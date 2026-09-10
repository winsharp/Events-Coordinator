package com.eventscoordinator.backend.service;

import com.eventscoordinator.backend.dto.ProfileDtos.*;
import com.eventscoordinator.backend.mapper.ProfileMapper;
import com.eventscoordinator.backend.model.*;
import com.eventscoordinator.backend.repository.*;
import com.eventscoordinator.backend.security.CurrentAccount;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProfileService {
  private final ArtistRepository artists;
  private final VenueRepository venues;
  private final CurrentAccount current;
  private final ProfileMapper mapper;

  public ProfileService(ArtistRepository a, VenueRepository v, CurrentAccount c, ProfileMapper m) {
    artists = a;
    venues = v;
    current = c;
    mapper = m;
  }

  @Transactional(readOnly = true)
  public List<ArtistResponse> artists(String q) {
    return (q == null || q.isBlank()
            ? artists.findAll()
            : artists
                .findByStageNameContainingIgnoreCaseOrGenreContainingIgnoreCaseOrderByStageName(
                    q, q))
        .stream().map(mapper::toResponse).toList();
  }

  @Transactional(readOnly = true)
  public ArtistResponse artist(Long id) {
    return mapper.toResponse(artists.findById(id).orElseThrow(() -> notFound("Artist")));
  }

  @PreAuthorize("hasRole('ARTIST')")
  @Transactional
  public ArtistResponse saveArtist(ArtistRequest r) {
    Account a = current.get();
    Artist x =
        artists
            .findByAccountId(a.getId())
            .orElseGet(() -> new Artist(a, r.stageName(), r.genre(), r.bio()));
    x.update(r.stageName(), r.genre(), r.bio());
    return mapper.toResponse(artists.save(x));
  }

  @PreAuthorize("hasRole('ARTIST')")
  @Transactional(readOnly = true)
  public ArtistResponse myArtist() {
    return mapper.toResponse(
        artists.findByAccountId(current.id()).orElseThrow(() -> notFound("Artist profile")));
  }

  @Transactional(readOnly = true)
  public List<VenueResponse> venues(String q) {
    String query = q == null ? "" : q.trim().toLowerCase(Locale.ROOT);
    return venues.findAll().stream()
        .filter(Venue::isPublished)
        .filter(
            venue ->
                query.isEmpty()
                    || venue.getName().toLowerCase(Locale.ROOT).contains(query)
                    || venue.getCity().toLowerCase(Locale.ROOT).contains(query))
        .sorted(Comparator.comparing(Venue::getName))
        .map(mapper::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public VenueResponse venue(Long id) {
    Venue venue = venues.findById(id).orElseThrow(() -> notFound("Venue"));
    if (!venue.isPublished()) throw notFound("Venue");
    return mapper.toResponse(venue);
  }

  @PreAuthorize("hasRole('VENUE')")
  @Transactional
  public VenueResponse publishVenue(VenueRequest r) {
    Account a = current.get();
    if (venues.findByAccountId(a.getId()).isPresent()) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Venue profile is already published");
    }
    Venue venue = createVenue(a, r, true);
    return mapper.toResponse(venues.save(venue));
  }

  @PreAuthorize("hasRole('VENUE')")
  @Transactional
  public VenueResponse saveVenue(VenueRequest r) {
    Account a = current.get();
    Venue x = venues.findByAccountId(a.getId()).orElseGet(() -> createVenue(a, r, r.published()));
    x.update(
        r.name(),
        r.address(),
        r.city(),
        r.capacity(),
        r.description(),
        r.contactEmail(),
        r.website(),
        joined(r.genres()),
        joined(r.amenities()),
        r.published());
    return mapper.toResponse(venues.save(x));
  }

  @PreAuthorize("hasRole('VENUE')")
  @Transactional(readOnly = true)
  public VenueResponse myVenue() {
    return mapper.toResponse(
        venues.findByAccountId(current.id()).orElseThrow(() -> notFound("Venue profile")));
  }

  private Venue createVenue(Account account, VenueRequest request, boolean published) {
    return new Venue(
        account,
        request.name(),
        request.address(),
        request.city(),
        request.capacity(),
        request.description(),
        request.contactEmail(),
        request.website(),
        joined(request.genres()),
        joined(request.amenities()),
        published);
  }

  private String joined(List<String> values) {
    return values == null ? "" : String.join("|", values);
  }

  private ResponseStatusException notFound(String n) {
    return new ResponseStatusException(HttpStatus.NOT_FOUND, n + " not found");
  }
}
