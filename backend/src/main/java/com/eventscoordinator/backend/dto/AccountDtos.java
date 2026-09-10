package com.eventscoordinator.backend.dto;

import com.eventscoordinator.backend.model.Role;
import jakarta.validation.constraints.*;
import java.time.Instant;

public final class AccountDtos {
  private AccountDtos() {}

  public record RegisterRequest(
      @NotBlank @Size(min = 3, max = 50) String username,
      @NotBlank @Email @Size(max = 180) String email,
      @NotBlank @Size(min = 8, max = 72) String password,
      @NotNull Role role,
      @NotBlank @Size(max = 80) String firstName,
      @NotBlank @Size(max = 80) String lastName) {}

  public record LoginRequest(@NotBlank String username, @NotBlank String password) {}

  public record UpdateRequest(
      @NotBlank @Email @Size(max = 180) String email,
      @NotBlank @Size(max = 80) String firstName,
      @NotBlank @Size(max = 80) String lastName) {}

  public record Response(
      Long id,
      String username,
      String email,
      String firstName,
      String lastName,
      Role role,
      Instant createdAt) {}

  public record AuthResponse(
      String token, String tokenType, long expiresInSeconds, Response account) {}
}
