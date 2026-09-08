package com.eventscoordinator.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.eventscoordinator.backend.model.Account;
import com.eventscoordinator.backend.model.Role;
import com.eventscoordinator.backend.model.Venue;
import com.eventscoordinator.backend.repository.AccountRepository;
import com.eventscoordinator.backend.repository.VenueRepository;

// runs on every startup, but only inserts if the venue table is empty —
// gives everyone who clones the repo the same starting data
@Component
public class DataSeeder implements CommandLineRunner {

    private final AccountRepository accountRepository;
    private final VenueRepository venueRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(AccountRepository accountRepository, VenueRepository venueRepository, PasswordEncoder passwordEncoder) {
        this.accountRepository = accountRepository;
        this.venueRepository = venueRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (venueRepository.count() > 0) {
            return;
        }

        seedVenue("fillmore_sf", "fillmore@example.com", "The Fillmore", "San Francisco, CA", 1150);
        seedVenue("redrocks", "redrocks@example.com", "Red Rocks Amphitheatre", "Morrison, CO", 9525);
        seedVenue("brooklynbowl", "brooklynbowl@example.com", "Brooklyn Bowl", "Brooklyn, NY", 600);
    }

    private void seedVenue(String username, String email, String name, String city, int capacity) {
        Account account = new Account(username, email, passwordEncoder.encode("password123"), Role.VENUE);
        accountRepository.save(account);
        venueRepository.save(new Venue(account, name, city, capacity));
    }
}
