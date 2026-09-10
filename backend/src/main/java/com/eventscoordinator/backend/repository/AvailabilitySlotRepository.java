package com.eventscoordinator.backend.repository;

import com.eventscoordinator.backend.model.*;
import jakarta.persistence.LockModeType;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface AvailabilitySlotRepository extends JpaRepository<AvailabilitySlot, Long> {
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select s from AvailabilitySlot s join fetch s.venue where s.id=:id")
  Optional<AvailabilitySlot> findLocked(@Param("id") Long id);

  List<AvailabilitySlot> findByVenueIdOrderByStartAt(Long venueId);

  List<AvailabilitySlot> findByVenueIdAndStatusOrderByStartAt(Long venueId, SlotStatus status);
}
