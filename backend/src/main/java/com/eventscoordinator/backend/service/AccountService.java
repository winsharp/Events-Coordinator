package com.eventscoordinator.backend.service;

import com.eventscoordinator.backend.dto.AccountDtos.*;
import com.eventscoordinator.backend.mapper.AccountMapper;
import com.eventscoordinator.backend.model.Account;
import com.eventscoordinator.backend.repository.AccountRepository;
import com.eventscoordinator.backend.security.CurrentAccount;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AccountService {
  private final CurrentAccount current;
  private final AccountRepository accounts;
  private final AccountMapper mapper;

  public AccountService(CurrentAccount c, AccountRepository a, AccountMapper m) {
    current = c;
    accounts = a;
    mapper = m;
  }

  @PreAuthorize("isAuthenticated()")
  @Transactional(readOnly = true)
  public Response me() {
    return mapper.toResponse(current.get());
  }

  @PreAuthorize("isAuthenticated()")
  @Transactional
  public Response update(UpdateRequest r) {
    Account a = current.get();
    accounts
        .findByEmailIgnoreCase(r.email())
        .filter(x -> !x.getId().equals(a.getId()))
        .ifPresent(
            x -> {
              throw new IllegalStateException("Email is already registered");
            });
    a.update(r.email().trim().toLowerCase(), r.firstName().trim(), r.lastName().trim());
    return mapper.toResponse(a);
  }
}
