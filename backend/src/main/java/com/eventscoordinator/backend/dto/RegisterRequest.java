package com.eventscoordinator.backend.dto;

public record RegisterRequest(
        String username,
        String email,
        String password,
        String role,
        String firstName,
        String lastName,
        String stageName,   // used when role = ARTIST
        String genre,       // optional, used when role = ARTIST
        String bio,         // optional, used when role = ARTIST
        String venueName,   // used when role = VENUE
        String city,        // used when role = VENUE
        Integer capacity    // used when role = VENUE
) {
}