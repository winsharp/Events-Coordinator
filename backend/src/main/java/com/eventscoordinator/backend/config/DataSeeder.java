package com.eventscoordinator.backend.config;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.eventscoordinator.backend.model.Account;
import com.eventscoordinator.backend.model.Artist;
import com.eventscoordinator.backend.model.Event;
import com.eventscoordinator.backend.model.Role;
import com.eventscoordinator.backend.model.Ticket;
import com.eventscoordinator.backend.model.Venue;
import com.eventscoordinator.backend.repository.AccountRepository;
import com.eventscoordinator.backend.repository.ArtistRepository;
import com.eventscoordinator.backend.repository.EventRepository;
import com.eventscoordinator.backend.repository.TicketRepository;
import com.eventscoordinator.backend.repository.VenueRepository;

// runs on every startup, but only inserts if the venue table is empty —
// gives everyone who clones the repo the same starting data
@Component
public class DataSeeder implements CommandLineRunner {
    private final AccountRepository accountRepository;
    private final VenueRepository venueRepository;
    private final PasswordEncoder passwordEncoder;
    private final ArtistRepository artistRepository;
    private final EventRepository eventRepository;
    private final TicketRepository ticketRepository;

    public DataSeeder(AccountRepository accountRepository, VenueRepository venueRepository, ArtistRepository artistRepository, EventRepository eventRepository, TicketRepository ticketRepository, PasswordEncoder passwordEncoder) {
        this.accountRepository = accountRepository;
        this.venueRepository = venueRepository;
        this.passwordEncoder = passwordEncoder;
        this.artistRepository = artistRepository;
        this.eventRepository = eventRepository;
        this.ticketRepository = ticketRepository;
    }

    @Override
    public void run(String... args) {
        if (venueRepository.count() > 0) {
            return;
        }

        Venue venue = seedVenue("fillmore_sf", "fillmore@example.com", "The Fillmore", "San Francisco, CA", 1150);
        seedVenue("redrocks", "redrocks@example.com", "Red Rocks Amphitheatre", "Morrison, CO", 9525);
        seedVenue("brooklynbowl", "brooklynbowl@example.com", "Brooklyn Bowl", "Brooklyn, NY", 600);

        Artist artist = seedArtist("artist_", "artist@hotmail.com", "Rick Roy");
        Event event1 = seedEvent(venue, artist, LocalDate.parse("2026-10-03"));
        Event event2 = seedEvent(venue, artist, LocalDate.parse("2026-10-04"));
        seedEvent(venue, artist, LocalDate.parse("2026-10-05"));

        Account customer = seedCustomer("testcustomer", "testcustomer@example.com", "Test", "Customer");
        seedTicket(event1, customer);
        seedTicket(event1, customer);
        seedTicket(event2, customer);
    }

    private Artist seedArtist(String username, String email, String name) {
        Account account = new Account(username, email, passwordEncoder.encode("password123"), Role.VENUE);
        accountRepository.save(account);
        Artist artist = new Artist(account, "foo", "", "Test artist");
        return artistRepository.save(artist);
    }

    private Venue seedVenue(String username, String email, String name, String city, int capacity) {
        Account account = new Account(username, email, passwordEncoder.encode("password123"), Role.VENUE);
        accountRepository.save(account);
        return venueRepository.save(new Venue(account, name, city, capacity));
    }

    private Event seedEvent(Venue venue, Artist artist, LocalDate date) {
        Event event = new Event(venue, artist, date);
        return eventRepository.save(event);
    }

    private Account seedCustomer(String username, String email, String firstName, String lastName) {
        Account account = new Account(username, email, passwordEncoder.encode("password123"), Role.CUSTOMER, firstName, lastName);
        return accountRepository.save(account);
    }

    private Ticket seedTicket(Event event, Account account) {
        Ticket ticket = new Ticket(event, account, LocalDateTime.now());
        return ticketRepository.save(ticket);
    }
}
