package com.eventscoordinator.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eventscoordinator.backend.model.Venue;

public interface VenueRepository extends JpaRepository<Venue, Long> {
    Optional<Venue> findByAccountId(Long accountId);
}
