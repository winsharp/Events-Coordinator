package com.eventscoordinator.backend.mapper;

import com.eventscoordinator.backend.dto.ProfileDtos.*;
import com.eventscoordinator.backend.model.*;
import java.util.Arrays;
import java.util.List;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ProfileMapper {
  @Mapping(target = "accountId", source = "account.id")
  ArtistResponse toResponse(Artist a);

  default VenueResponse toResponse(Venue venue) {
    return new VenueResponse(
        venue.getId(),
        venue.getAccount().getId(),
        venue.getName(),
        venue.getAddress(),
        venue.getCity(),
        venue.getCapacity(),
        venue.getDescription(),
        venue.getContactEmail(),
        venue.getWebsite(),
        split(venue.getGenres()),
        split(venue.getAmenities()),
        venue.isPublished());
  }

  private List<String> split(String values) {
    return values == null || values.isBlank() ? List.of() : Arrays.asList(values.split("\\|"));
  }
}
