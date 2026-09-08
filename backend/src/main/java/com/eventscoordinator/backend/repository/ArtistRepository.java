package com.eventscoordinator.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eventscoordinator.backend.model.Artist;

public interface ArtistRepository extends JpaRepository<Artist, Long> {
}
