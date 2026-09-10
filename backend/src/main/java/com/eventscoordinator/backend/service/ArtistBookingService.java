package com.eventscoordinator.backend.service;

import org.springframework.stereotype.Service;

import com.eventscoordinator.backend.dto.VenueDateResponse;
import com.eventscoordinator.backend.model.Artist;
import com.eventscoordinator.backend.model.Event;
import com.eventscoordinator.backend.repository.ArtistRepository;
import com.eventscoordinator.backend.repository.EventRepository;

@Service
public class ArtistBookingService {

    private final EventRepository eventRepository;
    private final ArtistRepository artistRepository;

    public ArtistBookingService(EventRepository eventRepository, ArtistRepository artistRepository) {
        this.eventRepository = eventRepository;
        this.artistRepository = artistRepository;
    }

    public VenueDateResponse bookDate(Long accountId, Long eventId) {
        Artist artist = artistRepository.findByAccountId(accountId)
                .orElseThrow(() -> new IllegalArgumentException("No artist profile found for this account"));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Date not found"));

        if (event.getArtist() != null) {
            throw new IllegalStateException("This date has already been booked");
        }

        event.setArtist(artist);
        Event saved = eventRepository.save(event);
        return toResponse(saved);
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
}