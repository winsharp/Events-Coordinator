package com.eventscoordinator.backend.security;

import com.eventscoordinator.backend.model.*;
import java.util.*;
import org.springframework.security.core.*;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public record AccountPrincipal(Long id, String email, String password, Role role)
    implements UserDetails {
  public static AccountPrincipal from(Account a) {
    return new AccountPrincipal(a.getId(), a.getEmail(), a.getPasswordHash(), a.getRole());
  }

  public Collection<? extends GrantedAuthority> getAuthorities() {
    return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
  }

  public String getPassword() {
    return password;
  }

  public String getUsername() {
    return email;
  }
}
