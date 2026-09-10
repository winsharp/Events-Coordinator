package com.eventscoordinator.backend.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.eventscoordinator.backend.dto.AddDateRequest;
import com.eventscoordinator.backend.dto.VenueDateResponse;
import com.eventscoordinator.backend.model.Event;
import com.eventscoordinator.backend.model.Venue;
import com.eventscoordinator.backend.repository.EventRepository;
import com.eventscoordinator.backend.repository.VenueRepository;

@Service
public class VenueAvailabilityService {

    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;

    public VenueAvailabilityService(EventRepository eventRepository, VenueRepository venueRepository) {
        this.eventRepository = eventRepository;
        this.venueRepository = venueRepository;
    }

    public VenueDateResponse addAvailableDate(Long accountId, AddDateRequest request) {
        Venue venue = getVenueForAccount(accountId);

        if (request.eventDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Date must be in the future");
        }
        if (eventRepository.existsByVenueIdAndEventDate(venue.getId(), request.eventDate())) {
            throw new IllegalStateException("This date is already listed for your venue");
        }

        Event event = new Event(venue, null, request.eventDate());
        return toResponse(eventRepository.save(event));
    }

    public List<VenueDateResponse> getMyDates(Long accountId) {
        Venue venue = getVenueForAccount(accountId);
        return eventRepository.findByVenueId(venue.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public void removeDate(Long accountId, Long eventId) {
        Venue venue = getVenueForAccount(accountId);
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));

        if (!event.getVenue().getId().equals(venue.getId())) {
            throw new AccessDeniedException("This date does not belong to your venue");
        }
        if (event.getArtist() != null) {
            throw new IllegalStateException("Cannot remove a date that is already booked");
        }
        eventRepository.delete(event);
    }

    private Venue getVenueForAccount(Long accountId) {
        return venueRepository.findByAccountId(accountId)
                .orElseThrow(() -> new IllegalArgumentException("No venue profile found for this account"));
    }

    private VenueDateResponse toResponse(Event e) {
        boolean booked = e.getArtist() != null;
        return new VenueDateResponse(
                e.getId(),
                e.getEventDate(),
                booked ? "BOOKED" : "OPEN",
                booked ? e.getArtist().getStageName() : null
        );
    }

    public List<VenueDateResponse> getDatesForVenue(Long venueId) {
        if (!venueRepository.existsById(venueId)) {
            throw new IllegalArgumentException("Venue not found");
        }
        return eventRepository.findByVenueIdAndArtistIsNull(venueId)
                .stream()
                .map(this::toResponse)
                .toList();
    }
}