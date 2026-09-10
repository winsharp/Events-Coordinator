package com.eventscoordinator.backend.repository;

import com.eventscoordinator.backend.model.*;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select r from Reservation r join fetch r.tier left join fetch r.seat where r.id=:id")
  Optional<Reservation> findLocked(@Param("id") Long id);

  List<Reservation> findByCustomerIdOrderByCreatedAtDesc(Long id);

  List<Reservation> findByStatusAndExpiresAtBefore(ReservationStatus s, Instant now);
}
