package com.eventscoordinator.backend;

import static org.assertj.core.api.Assertions.*;

import com.eventscoordinator.backend.dto.AccountDtos.RegisterRequest;
import com.eventscoordinator.backend.model.*;
import com.eventscoordinator.backend.security.*;
import jakarta.validation.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import java.util.stream.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.*;
import org.junit.jupiter.params.provider.*;

class DomainRulesParameterizedTest {
  static Stream<Arguments> inventory() {
    return IntStream.rangeClosed(1, 100).mapToObj(i -> Arguments.of(i + 10, (i % 10) + 1));
  }

  @ParameterizedTest(name = "inventory {index}: total={0}, hold={1}")
  @MethodSource("inventory")
  void tierInventoryBehaves(int total, int hold) {
    TicketTier tier = new TicketTier(null, "General", new BigDecimal("25.00"), total);
    assertThat(tier.getAvailableQuantity()).isEqualTo(total);
    tier.hold(hold);
    assertThat(tier.getAvailableQuantity()).isEqualTo(total - hold);
    tier.release(hold);
    assertThat(tier.getAvailableQuantity()).isEqualTo(total);
    assertThat(tier.getPrice()).isEqualByComparingTo("25.00");
  }

  static Stream<Arguments> expirations() {
    return IntStream.range(-30, 30).mapToObj(i -> Arguments.of(i, i <= 0));
  }

  @ParameterizedTest(name = "expiration delta {0}")
  @MethodSource("expirations")
  void reservationExpiryUsesDeadline(int delta, boolean expected) {
    Instant now = Instant.parse("2027-01-01T00:00:00Z");
    TicketTier tier = new TicketTier(null, "GA", BigDecimal.TEN, 5);
    Reservation r = new Reservation(null, null, tier, null, 1, now.plusSeconds(delta));
    assertThat(r.expired(now)).isEqualTo(expected);
    assertThat(r.getQuantity()).isOne();
  }

  @ParameterizedTest(name = "seat lifecycle {0}")
  @ValueSource(
      ints = {
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
        26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48,
        49, 50
      })
  void seatLifecycleIsConsistent(int number) {
    Seat s = new Seat(null, null, "Orchestra", "A", number);
    assertThat(s.getStatus()).isEqualTo(SeatStatus.AVAILABLE);
    assertThat(s.getNumber()).isEqualTo(number);
    s.hold();
    assertThat(s.getStatus()).isEqualTo(SeatStatus.HELD);
    s.release();
    assertThat(s.getStatus()).isEqualTo(SeatStatus.AVAILABLE);
    s.hold();
    s.sell();
    assertThat(s.getStatus()).isEqualTo(SeatStatus.SOLD);
  }

  static Stream<Arguments> jwtUsers() {
    Role[] roles = Role.values();
    return IntStream.range(0, 45)
        .mapToObj(i -> Arguments.of("user" + i, roles[i % roles.length], (long) i + 1));
  }

  @ParameterizedTest(name = "jwt {0} {1}")
  @MethodSource("jwtUsers")
  void jwtRoundTripAuthenticates(String username, Role role, long id) {
    JwtService jwt =
        new JwtService(
            "VGVzdC1zZWNyZXQta2V5LW11c3QtYmUtYXQtbGVhc3QtMzItYnl0ZXMtbG9uZy0yMDI2", 60000);
    AccountPrincipal p = new AccountPrincipal(id, username, "hash", role);
    String token = jwt.generate(p);
    assertThat(token.split("\\.")).hasSize(3);
    assertThat(jwt.username(token)).isEqualTo(username);
    assertThat(jwt.valid(token, p)).isTrue();
    assertThat(p.getAuthorities()).extracting(Object::toString).containsExactly("ROLE_" + role);
  }

  static Stream<Arguments> passwordLengths() {
    return IntStream.range(0, 45).mapToObj(i -> Arguments.of("x".repeat(i), i >= 8));
  }

  @ParameterizedTest(name = "password length {index}")
  @MethodSource("passwordLengths")
  void registrationPasswordValidation(String password, boolean expectedValid) {
    try (ValidatorFactory f = Validation.buildDefaultValidatorFactory()) {
      var violations =
          f.getValidator()
              .validate(
                  new RegisterRequest(
                      "validuser", "valid@example.test", password, Role.CUSTOMER, "First", "Last"));
      boolean passwordViolation =
          violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("password"));
      assertThat(passwordViolation).isEqualTo(!expectedValid);
    }
  }

  static Stream<Arguments> processingTimes() {
    return IntStream.range(-15, 15).mapToObj(i -> Arguments.of(i, i <= 0));
  }

  @ParameterizedTest(name = "processing delta {0}")
  @MethodSource("processingTimes")
  void pendingOrderReadinessUsesProcessingTime(int delta, boolean expected) {
    Instant now = Instant.parse("2027-01-01T00:00:00Z");
    PurchaseOrder o =
        new PurchaseOrder(
            null,
            null,
            "key-" + delta,
            PaymentMethod.USDC,
            OrderStatus.PENDING,
            BigDecimal.ONE,
            now.plusSeconds(delta));
    assertThat(o.ready(now)).isEqualTo(expected);
    assertThat(o.getStatus()).isEqualTo(OrderStatus.PENDING);
  }
}
