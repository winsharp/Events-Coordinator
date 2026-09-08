package com.eventscoordinator.backend.security;

import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.eventscoordinator.backend.repository.AccountRepository;

@Service
public class AppAccountDetailsService implements UserDetailsService {

    private final AccountRepository accountRepository;

    public AppAccountDetailsService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @Override
    public AppAccountPrincipal loadUserByUsername(String username) throws UsernameNotFoundException {
        return accountRepository.findByUsername(username)
                .map(AppAccountPrincipal::new)
                .orElseThrow(() -> new UsernameNotFoundException("No account with username: " + username));
    }
}
