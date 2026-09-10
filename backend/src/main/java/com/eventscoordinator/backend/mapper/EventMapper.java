package com.eventscoordinator.backend.mapper;

import com.eventscoordinator.backend.dto.EventDtos.*;
import com.eventscoordinator.backend.model.*;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface EventMapper {
  @Mapping(target = "venueId", source = "venue.id")
  @Mapping(target = "venueName", source = "venue.name")
  @Mapping(target = "eventId", ignore = true)
  @Mapping(target = "artistId", ignore = true)
  @Mapping(target = "artistName", ignore = true)
  @Mapping(target = "bookingStatus", ignore = true)
  SlotResponse toResponse(AvailabilitySlot s);

  default SlotResponse toResponse(AvailabilitySlot slot, Event event) {
    return new SlotResponse(
        slot.getId(),
        slot.getVenue().getId(),
        slot.getVenue().getName(),
        slot.getStartAt(),
        slot.getEndAt(),
        slot.getStatus(),
        event == null ? null : event.getId(),
        event == null ? null : event.getArtist().getId(),
        event == null ? null : event.getArtist().getStageName(),
        event == null ? null : event.getStatus());
  }

  @Mapping(target = "artistId", source = "artist.id")
  @Mapping(target = "artistName", source = "artist.stageName")
  @Mapping(target = "venueId", source = "venue.id")
  @Mapping(target = "venueName", source = "venue.name")
  @Mapping(target = "city", source = "venue.city")
  EventResponse toResponse(Event e);
}
