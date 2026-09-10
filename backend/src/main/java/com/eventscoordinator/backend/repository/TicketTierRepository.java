package com.eventscoordinator.backend.repository;

import com.eventscoordinator.backend.model.TicketTier;
import jakarta.persistence.LockModeType;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface TicketTierRepository extends JpaRepository<TicketTier, Long> {
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select t from TicketTier t join fetch t.event where t.id=:id")
  Optional<TicketTier> findLocked(@Param("id") Long id);

  List<TicketTier> findByEventIdOrderByPriceAsc(Long eventId);
}
