package com.eventscoordinator.backend.repository;

import com.eventscoordinator.backend.model.*;
import jakarta.persistence.LockModeType;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface SeatRepository extends JpaRepository<Seat, Long> {
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select s from Seat s join fetch s.event join fetch s.tier where s.id=:id")
  Optional<Seat> findLocked(@Param("id") Long id);

  List<Seat> findByEventIdOrderBySectionAscRowAscNumberAsc(Long eventId);

  long countByTierId(Long tierId);
}
