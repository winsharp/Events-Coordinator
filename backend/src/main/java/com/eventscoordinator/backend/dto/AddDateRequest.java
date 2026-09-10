package com.eventscoordinator.backend.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;

public record AddDateRequest(
        @NotNull @FutureOrPresent LocalDate eventDate,
         String title,
         String description
) {}