package com.eventscoordinator.backend.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.eventscoordinator.backend.dto.EventResponse;
import com.eventscoordinator.backend.model.Event;
import com.eventscoordinator.backend.repository.EventRepository;

@Service
public class EventService {
    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    public EventResponse getById(Long id) {
        return toResponse(findById(id));
    }

    public List<EventResponse> getAll() {
        return eventRepository.findAll().stream().map(event -> toResponse(event)).toList();
    }

    private Event findById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "event not found"));
    }

    private EventResponse toResponse(Event event) {
        return new EventResponse(event.getId(), event.getEventDate(), event.getDescription(), event.getTitle());
    }
}
