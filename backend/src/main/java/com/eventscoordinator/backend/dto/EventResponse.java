package com.eventscoordinator.backend.dto;

import java.time.LocalDate;

public record EventResponse(Long id, LocalDate date, String description, String title, VenueResponse venue) {
}
