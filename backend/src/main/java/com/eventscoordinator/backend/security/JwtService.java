package com.eventscoordinator.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.time.Instant;
import java.util.*;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
  private final SecretKey key;
  private final long expiration;

  public JwtService(
      @Value("${app.jwt.secret}") String encoded, @Value("${app.jwt.expiration}") long expiration) {
    this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(encoded));
    this.expiration = expiration;
  }

  public String generate(AccountPrincipal p) {
    Instant now = Instant.now();
    return Jwts.builder()
        .subject(p.username())
        .claim("accountId", p.id())
        .claim("role", p.role().name())
        .issuedAt(Date.from(now))
        .expiration(Date.from(now.plusMillis(expiration)))
        .signWith(key)
        .compact();
  }

  public String username(String token) {
    return claims(token).getSubject();
  }

  public boolean valid(String token, UserDetails u) {
    try {
      return username(token).equalsIgnoreCase(u.getUsername())
          && claims(token).getExpiration().after(new Date());
    } catch (JwtException | IllegalArgumentException e) {
      return false;
    }
  }

  private Claims claims(String t) {
    return Jwts.parser().verifyWith(key).build().parseSignedClaims(t).getPayload();
  }

  public long expirationSeconds() {
    return expiration / 1000;
  }
}
