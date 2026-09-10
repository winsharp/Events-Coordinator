package com.eventscoordinator.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
public record RegisterRequest(
    @NotBlank 
    String username,

    @NotBlank 
    @Email 
     String email, 
    
     @NotBlank 
    String password,

     String role,
      String firstName, 
      String lastName) {
}
