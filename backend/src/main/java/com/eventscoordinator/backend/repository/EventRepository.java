package com.eventscoordinator.backend.repository;

import com.eventscoordinator.backend.model.*;
import jakarta.persistence.LockModeType;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface EventRepository extends JpaRepository<Event, Long> {
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query(
      "select e from Event e join fetch e.venue join fetch e.artist join fetch e.slot where"
          + " e.id=:id")
  Optional<Event> findLocked(@Param("id") Long id);

  Optional<Event> findBySlotId(Long slotId);

  List<Event> findByStatusOrderByStartAtAsc(EventStatus status);

  List<Event> findByVenueIdOrderByStartAtDesc(Long venueId);

  List<Event> findByArtistIdOrderByStartAtDesc(Long artistId);
}
