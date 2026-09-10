package com.eventscoordinator.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eventscoordinator.backend.model.Event;

import java.time.LocalDate;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByVenueId(Long venueId);
    boolean existsByVenueIdAndEventDate(Long venueId, LocalDate eventDate);
    List<Event> findByVenueIdAndArtistIsNull(Long venueId);
}
