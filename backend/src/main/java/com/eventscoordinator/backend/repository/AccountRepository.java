package com.eventscoordinator.backend.repository;

import com.eventscoordinator.backend.model.Account;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AccountRepository extends JpaRepository<Account, Long> {
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select a from Account a where a.id = :id")
  Optional<Account> findLocked(@Param("id") Long id);

  Optional<Account> findByEmailIgnoreCase(String email);

  boolean existsByEmailIgnoreCase(String email);
}
