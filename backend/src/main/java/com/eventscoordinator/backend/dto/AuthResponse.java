package com.eventscoordinator.backend.dto;

import com.eventscoordinator.backend.model.Role;

public record AuthResponse(Long id, String username, Role role) {
}
