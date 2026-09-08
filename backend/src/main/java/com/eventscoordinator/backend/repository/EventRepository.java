package com.eventscoordinator.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eventscoordinator.backend.model.Event;

public interface EventRepository extends JpaRepository<Event, Long> {
}
