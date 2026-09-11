package com.eventscoordinator.backend.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
  private final JwtService jwt;
  private final AccountDetailsService details;

  public JwtAuthenticationFilter(JwtService j, AccountDetailsService d) {
    jwt = j;
    details = d;
  }

  protected void doFilterInternal(
      HttpServletRequest req, HttpServletResponse res, FilterChain chain)
      throws ServletException, IOException {
    String h = req.getHeader("Authorization");
    if (h != null
        && h.startsWith("Bearer ")
        && SecurityContextHolder.getContext().getAuthentication() == null) {
      String token = h.substring(7);
      try {
        UserDetails u = details.loadUserByUsername(jwt.email(token));
        if (jwt.valid(token, u)) {
          var a = new UsernamePasswordAuthenticationToken(u, null, u.getAuthorities());
          a.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
          SecurityContextHolder.getContext().setAuthentication(a);
        }
      } catch (Exception ignored) {
      }
    }
    chain.doFilter(req, res);
  }
}
