package com.eventscoordinator.backend.repository;

import com.eventscoordinator.backend.model.IssuedTicket;
import jakarta.persistence.LockModeType;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface IssuedTicketRepository extends JpaRepository<IssuedTicket, Long> {
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select t from IssuedTicket t where t.id=:id")
  Optional<IssuedTicket> findLocked(@Param("id") Long id);

  List<IssuedTicket> findByOwnerIdOrderByIssuedAtDesc(Long ownerId);

  long countByOrderId(Long orderId);
}
