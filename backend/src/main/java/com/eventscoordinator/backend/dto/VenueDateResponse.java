package com.eventscoordinator.backend.dto;

import java.time.LocalDate;

public record VenueDateResponse(
        Long id,
        LocalDate eventDate,
        String status,           // "OPEN" or "BOOKED"
        String artistStageName   // null when status is "OPEN"
) {}