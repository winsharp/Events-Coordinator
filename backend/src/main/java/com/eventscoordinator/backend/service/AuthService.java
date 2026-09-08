package com.eventscoordinator.backend.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.eventscoordinator.backend.dto.RegisterRequest;
import com.eventscoordinator.backend.model.Account;
import com.eventscoordinator.backend.model.Role;
import com.eventscoordinator.backend.repository.AccountRepository;

@Service
public class AuthService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(AccountRepository accountRepository, PasswordEncoder passwordEncoder) {
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Account register(RegisterRequest request) {
        if (accountRepository.findByUsername(request.username()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username is already taken");
        }

        Role role = parseRole(request.role());
        Account account = new Account(request.username(), request.email(), passwordEncoder.encode(request.password()), role,
                request.firstName(), request.lastName());
        return accountRepository.save(account);
    }

    private Role parseRole(String role) {
        try {
            return Role.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role must be one of CUSTOMER, ARTIST, VENUE");
        }
    }
}
