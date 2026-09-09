package com.eventscoordinator.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eventscoordinator.backend.dto.BuyTicketRequest;
import com.eventscoordinator.backend.dto.TicketResponse;
import com.eventscoordinator.backend.security.AppAccountPrincipal;
import com.eventscoordinator.backend.service.TicketService;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public ResponseEntity<TicketResponse> buyTicket(@AuthenticationPrincipal AppAccountPrincipal principal, @RequestBody BuyTicketRequest request) {
        TicketResponse response = ticketService.buyTicket(principal.getAccount(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me")
    public List<TicketResponse> getMyTickets(@AuthenticationPrincipal AppAccountPrincipal principal) {
        return ticketService.getMyTickets(principal.getAccount());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelTicket(@AuthenticationPrincipal AppAccountPrincipal principal, @PathVariable Long id) {
        ticketService.cancelTicket(principal.getAccount(), id);
        return ResponseEntity.noContent().build();
    }
}
