package com.eventscoordinator.backend.service;

import com.eventscoordinator.backend.dto.AccountDtos.AuthResponse;
import com.eventscoordinator.backend.dto.AccountDtos.LoginRequest;
import com.eventscoordinator.backend.dto.AccountDtos.RegisterRequest;
import com.eventscoordinator.backend.mapper.AccountMapper;
import com.eventscoordinator.backend.model.Account;
import com.eventscoordinator.backend.repository.AccountRepository;
import com.eventscoordinator.backend.security.AccountPrincipal;
import com.eventscoordinator.backend.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
  private final AccountRepository accounts;
  private final PasswordEncoder passwords;
  private final AuthenticationManager authenticationManager;
  private final JwtService jwt;
  private final AccountMapper mapper;

  public AuthService(
      AccountRepository accounts,
      PasswordEncoder passwords,
      AuthenticationManager authenticationManager,
      JwtService jwt,
      AccountMapper mapper) {
    this.accounts = accounts;
    this.passwords = passwords;
    this.authenticationManager = authenticationManager;
    this.jwt = jwt;
    this.mapper = mapper;
  }

  @Transactional
  public AuthResponse register(RegisterRequest request) {
    if (accounts.existsByEmailIgnoreCase(request.email())) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
    }

    Account account =
        accounts.save(
            new Account(
                request.email().trim().toLowerCase(),
                passwords.encode(request.password()),
                request.firstName().trim(),
                request.lastName().trim(),
                request.role()));
    return response(account);
  }

  public AuthResponse login(LoginRequest request) {
    try {
      authenticationManager.authenticate(
          new UsernamePasswordAuthenticationToken(request.email(), request.password()));
    } catch (AuthenticationException exception) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    Account account =
        accounts
            .findByEmailIgnoreCase(request.email())
            .orElseThrow(
                () ->
                    new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Invalid email or password"));
    return response(account);
  }

  private AuthResponse response(Account account) {
    return new AuthResponse(
        jwt.generate(AccountPrincipal.from(account)),
        "Bearer",
        jwt.expirationSeconds(),
        mapper.toResponse(account));
  }
}
