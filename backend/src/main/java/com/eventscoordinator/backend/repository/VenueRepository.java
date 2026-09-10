package com.eventscoordinator.backend.repository;

import com.eventscoordinator.backend.model.Venue;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VenueRepository extends JpaRepository<Venue, Long> {
  Optional<Venue> findByAccountId(Long accountId);

  List<Venue> findByNameContainingIgnoreCaseOrCityContainingIgnoreCaseOrderByName(
      String q, String q2);
}
