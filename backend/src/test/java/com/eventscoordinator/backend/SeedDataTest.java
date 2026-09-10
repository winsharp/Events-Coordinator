package com.eventscoordinator.backend;

import static org.assertj.core.api.Assertions.*;

import java.nio.file.*;
import java.util.stream.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.*;
import org.junit.jupiter.params.provider.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

class SeedDataTest {
  static String sql;

  @BeforeAll
  static void load() throws Exception {
    sql = Files.readString(Path.of("data-population.sql"));
  }

  static Stream<String> users() {
    return Stream.of(
        "customer.demo",
        "customer.alex",
        "customer.jordan",
        "artist.demo",
        "artist.neon",
        "artist.jazz",
        "venue.demo",
        "venue.harbor",
        "venue.garden");
  }

  @ParameterizedTest
  @MethodSource("users")
  void everyDocumentedAccountHasUsableBcryptHash(String user) {
    assertThat(sql).contains("'" + user + "'");
    String hash = "$2a$10$CXhfna/erEzIeERFptp7EeAGhi2eKxTkJdJHVNoCCdDaXmBumu1K2";
    assertThat(sql).contains(hash);
    assertThat(new BCryptPasswordEncoder().matches("TicketGenie1!", hash)).isTrue();
  }

  @Test
  void seedContainsReferentiallyOrderedCompleteDataset() {
    assertThat(sql.indexOf("INSERT INTO accounts")).isLessThan(sql.indexOf("INSERT INTO artists"));
    assertThat(sql.indexOf("INSERT INTO events"))
        .isLessThan(sql.indexOf("INSERT INTO ticket_tiers"));
    assertThat(sql.indexOf("INSERT INTO reservations"))
        .isLessThan(sql.indexOf("INSERT INTO purchase_orders"));
    assertThat(sql)
        .contains(
            "'CARD'",
            "'PAYPAL'",
            "'USDC'",
            "'PENDING'",
            "'CONFIRMED'",
            "'REJECTED'",
            "'PAID'",
            "'FAILED'",
            "'CANCELLED'",
            "'ACTIVE'",
            "'CONVERTED'",
            "'RELEASED'",
            "'EXPIRED'",
            "'VALID'",
            "'TRANSFERRED'",
            "setval(pg_get_serial_sequence");
    assertThat(sql.lines().filter(x -> x.matches("\\(\\d+,0,.*")).count()).isGreaterThan(190);
    assertThat(sql).contains("INSERT INTO seats", "INSERT INTO issued_tickets");
    assertThat(sql).contains("SELECT setval(pg_get_serial_sequence('seats','id'), 96, true)");
  }
}
