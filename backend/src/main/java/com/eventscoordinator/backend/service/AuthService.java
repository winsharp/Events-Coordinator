package com.eventscoordinator.backend.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.eventscoordinator.backend.dto.RegisterRequest;
import com.eventscoordinator.backend.model.Account;
import com.eventscoordinator.backend.model.Artist;
import com.eventscoordinator.backend.model.Role;
import com.eventscoordinator.backend.model.Venue;
import com.eventscoordinator.backend.repository.AccountRepository;
import com.eventscoordinator.backend.repository.ArtistRepository;
import com.eventscoordinator.backend.repository.VenueRepository;

@Service
public class AuthService {

    private final AccountRepository accountRepository;
    private final ArtistRepository artistRepository;
    private final VenueRepository venueRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(AccountRepository accountRepository, ArtistRepository artistRepository,
                       VenueRepository venueRepository, PasswordEncoder passwordEncoder) {
        this.accountRepository = accountRepository;
        this.artistRepository = artistRepository;
        this.venueRepository = venueRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Account register(RegisterRequest request) {
        if (accountRepository.findByUsername(request.username()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username is already taken");
        }

        Role role = parseRole(request.role());
        Account account = new Account(request.username(), request.email(), passwordEncoder.encode(request.password()), role,
                request.firstName(), request.lastName());
        Account savedAccount = accountRepository.save(account);

        if (role == Role.ARTIST) {
            if (request.stageName() == null || request.stageName().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "stageName is required for ARTIST accounts");
            }
            artistRepository.save(new Artist(savedAccount, request.stageName(), request.genre(), request.bio()));
        } else if (role == Role.VENUE) {
            if (request.venueName() == null || request.venueName().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "venueName is required for VENUE accounts");
            }
            venueRepository.save(new Venue(savedAccount, request.venueName(), request.city(), request.capacity()));
        }

        return savedAccount;
    }

    private Role parseRole(String role) {
        try {
            return Role.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role must be one of CUSTOMER, ARTIST, VENUE");
        }
    }
}