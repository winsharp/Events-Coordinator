package com.eventscoordinator.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.eventscoordinator.backend.dto.BuyTicketRequest;
import com.eventscoordinator.backend.dto.TicketResponse;
import com.eventscoordinator.backend.model.Account;
import com.eventscoordinator.backend.model.Event;
import com.eventscoordinator.backend.model.Role;
import com.eventscoordinator.backend.model.Ticket;
import com.eventscoordinator.backend.repository.EventRepository;
import com.eventscoordinator.backend.repository.TicketRepository;

@Service
public class TicketService {

    private static final int MAX_TICKETS_PER_EVENT = 4;

    private final TicketRepository ticketRepository;
    private final EventRepository eventRepository;

    public TicketService(TicketRepository ticketRepository, EventRepository eventRepository) {
        this.ticketRepository = ticketRepository;
        this.eventRepository = eventRepository;
    }

    public TicketResponse buyTicket(Account currentAccount, BuyTicketRequest request) {
        if (currentAccount.getRole() != Role.CUSTOMER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only CUSTOMER accounts can buy tickets");
        }

        Event event = eventRepository.findById(request.eventId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        if (event.getArtist() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This event isn't confirmed yet — no artist has claimed it");
        }

        long alreadyOwned = ticketRepository.countByEventIdAndAccountId(event.getId(), currentAccount.getId());
        if (alreadyOwned >= MAX_TICKETS_PER_EVENT) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You can buy at most " + MAX_TICKETS_PER_EVENT + " tickets to this event");
        }

        long sold = ticketRepository.countByEventId(event.getId());
        if (sold >= event.getVenue().getCapacity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This event is sold out");
        }

        Ticket ticket = new Ticket(event, currentAccount, LocalDateTime.now());
        return toResponse(ticketRepository.save(ticket));
    }

    public List<TicketResponse> getMyTickets(Account currentAccount) {
        return ticketRepository.findByAccountId(currentAccount.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    public void cancelTicket(Account currentAccount, Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

        if (!ticket.getAccount().getId().equals(currentAccount.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only cancel your own tickets");
        }

        ticketRepository.delete(ticket);
    }

    private TicketResponse toResponse(Ticket ticket) {
        Event event = ticket.getEvent();
        return new TicketResponse(
                ticket.getId(),
                event.getId(),
                event.getTitle(),
                event.getArtist() != null ? event.getArtist().getStageName() : null,
                event.getVenue().getName(),
                event.getEventDate(),
                ticket.getPurchasedAt());
    }
}
