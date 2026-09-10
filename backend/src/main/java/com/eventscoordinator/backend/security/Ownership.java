package com.eventscoordinator.backend.security;

import com.eventscoordinator.backend.repository.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component("ownership")
@Transactional(readOnly = true)
public class Ownership {
  private final VenueRepository venues;
  private final ArtistRepository artists;
  private final EventRepository events;

  public Ownership(VenueRepository v, ArtistRepository a, EventRepository e) {
    venues = v;
    artists = a;
    events = e;
  }

  private Long id() {
    var p = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    return p instanceof AccountPrincipal a ? a.id() : -1L;
  }

  public boolean venue(Long venueId) {
    return venues.findById(venueId).map(v -> v.getAccount().getId().equals(id())).orElse(false);
  }

  public boolean artist(Long artistId) {
    return artists.findById(artistId).map(a -> a.getAccount().getId().equals(id())).orElse(false);
  }

  public boolean venueEvent(Long eventId) {
    return events
        .findById(eventId)
        .map(e -> e.getVenue().getAccount().getId().equals(id()))
        .orElse(false);
  }
}
