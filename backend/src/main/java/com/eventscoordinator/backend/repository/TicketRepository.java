package com.eventscoordinator.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eventscoordinator.backend.model.Ticket;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByAccountId(Long accountId);
    long countByEventId(Long eventId);
    long countByEventIdAndAccountId(Long eventId, Long accountId);
}
