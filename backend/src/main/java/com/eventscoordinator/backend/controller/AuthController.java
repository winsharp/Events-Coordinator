package com.eventscoordinator.backend.controller;

import com.eventscoordinator.backend.dto.AccountDtos.*;
import com.eventscoordinator.backend.service.*;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/auth", "/auth"})
public class AuthController {
  private final AuthService auth;
  private final AccountService accounts;

  public AuthController(AuthService a, AccountService s) {
    auth = a;
    accounts = s;
  }

  @PostMapping("/register")
  @ResponseStatus(HttpStatus.CREATED)
  public AuthResponse register(@Valid @RequestBody RegisterRequest r) {
    return auth.register(r);
  }

  @PostMapping("/login")
  public AuthResponse login(@Valid @RequestBody LoginRequest r) {
    return auth.login(r);
  }

  @GetMapping("/me")
  public Response me() {
    return accounts.me();
  }

  @PutMapping("/me")
  public Response update(@Valid @RequestBody UpdateRequest r) {
    return accounts.update(r);
  }
}
