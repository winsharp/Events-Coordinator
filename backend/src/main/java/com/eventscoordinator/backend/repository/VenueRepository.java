package com.eventscoordinator.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eventscoordinator.backend.model.Venue;

public interface VenueRepository extends JpaRepository<Venue, Long> {
}
