package com.eventscoordinator.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record TicketResponse(
        Long id,
        Long eventId,
        String eventTitle,
        String artistStageName,
        String venueName,
        LocalDate eventDate,
        LocalDateTime purchasedAt) {
}
