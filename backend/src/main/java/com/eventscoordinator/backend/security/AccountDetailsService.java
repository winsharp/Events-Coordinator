package com.eventscoordinator.backend.security;

import com.eventscoordinator.backend.repository.AccountRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AccountDetailsService implements UserDetailsService {
  private final AccountRepository accounts;

  public AccountDetailsService(AccountRepository accounts) {
    this.accounts = accounts;
  }

  @Override
  public UserDetails loadUserByUsername(String identifier) {
    return accounts
        .findByUsernameOrEmail(identifier)
        .map(AccountPrincipal::from)
        .orElseThrow(() -> new UsernameNotFoundException("Account not found"));
  }
}
