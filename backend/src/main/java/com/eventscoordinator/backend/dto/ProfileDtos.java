package com.eventscoordinator.backend.dto;

import jakarta.validation.constraints.*;
import java.util.List;

public final class ProfileDtos {
  private ProfileDtos() {}

  public record ArtistRequest(
      @NotBlank @Size(max = 120) String stageName,
      @NotBlank @Size(max = 80) String genre,
      @Size(max = 2000) String bio) {}

  public record ArtistResponse(
      Long id, Long accountId, String stageName, String genre, String bio) {}

  public record VenueRequest(
      @NotBlank @Size(max = 150) String name,
      @NotBlank @Size(max = 120) String address,
      @NotBlank @Size(max = 80) String city,
      @Min(1) @Max(1000000) int capacity,
      @Size(max = 2000) String description,
      @Email @Size(max = 254) String contactEmail,
      @Size(max = 500) String website,
      @Size(max = 20) List<@Size(max = 80) String> genres,
      @Size(max = 30) List<@Size(max = 100) String> amenities,
      boolean published) {}

  public record VenueResponse(
      Long id,
      Long accountId,
      String name,
      String address,
      String city,
      int capacity,
      String description,
      String contactEmail,
      String website,
      List<String> genres,
      List<String> amenities,
      boolean published) {}
}
