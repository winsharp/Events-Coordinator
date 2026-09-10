package com.eventscoordinator.backend.security;

import com.eventscoordinator.backend.model.Account;
import com.eventscoordinator.backend.repository.AccountRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class CurrentAccount {
  private final AccountRepository accounts;

  public CurrentAccount(AccountRepository a) {
    accounts = a;
  }

  public Account get() {
    var a = SecurityContextHolder.getContext().getAuthentication();
    if (a == null || !(a.getPrincipal() instanceof AccountPrincipal p))
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
    return accounts
        .findById(p.id())
        .orElseThrow(
            () -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account no longer exists"));
  }

  public Long id() {
    return get().getId();
  }
}
