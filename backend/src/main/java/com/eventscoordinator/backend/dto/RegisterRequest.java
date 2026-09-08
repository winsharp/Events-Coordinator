package com.eventscoordinator.backend.dto;

public record RegisterRequest(String username, String email, String password, String role) {
}
