package com.eventscoordinator.backend.dto;

import com.eventscoordinator.backend.model.EventStatus;
import com.eventscoordinator.backend.model.SlotStatus;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public final class EventDtos {
  private EventDtos() {}

  public record SlotRequest(@NotNull @Future Instant startAt, @NotNull @Future Instant endAt) {}

  public record SlotResponse(
      Long id,
      Long venueId,
      String venueName,
      Instant startAt,
      Instant endAt,
      SlotStatus status,
      Long eventId,
      Long artistId,
      String artistName,
      EventStatus bookingStatus) {}

  public record BookRequest(
      @NotBlank @Size(max = 180) String title, @Size(max = 3000) String description) {}

  public record EventUpdateRequest(
      @NotBlank @Size(max = 180) String title,
      @Size(max = 3000) String description,
      @NotNull Instant startAt,
      @NotNull Instant endAt) {}

  public record EventResponse(
      Long id,
      String title,
      String description,
      Instant startAt,
      Instant endAt,
      EventStatus status,
      Long artistId,
      String artistName,
      Long venueId,
      String venueName,
      String city) {}
}
