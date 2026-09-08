package com.eventscoordinator.backend.dto;

public record CustomerResponse(Long id, String username, String email, String firstName, String lastName) {
}
