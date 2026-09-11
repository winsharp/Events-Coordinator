package com.eventscoordinator.backend.dto;

import com.eventscoordinator.backend.model.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;

public final class CommerceDtos {
  private CommerceDtos() {}

  public record TierRequest(
      @NotBlank @Size(max = 80) String name,
      @NotNull @DecimalMin("0.01") @Digits(integer = 10, fraction = 2) BigDecimal price,
      @Min(1) int quantity) {}

  public record TierResponse(
      Long id,
      Long eventId,
      String name,
      BigDecimal price,
      int totalQuantity,
      int availableQuantity) {}

  public record SeatBatchRequest(
      @NotNull Long tierId,
      @NotBlank @Size(max = 50) String section,
      @NotBlank @Size(max = 20) String row,
      @Min(1) int firstNumber,
      @Min(1) @Max(1000) int count) {}

  public record SeatResponse(
      Long id,
      Long eventId,
      Long tierId,
      String tierName,
      String section,
      String row,
      int number,
      SeatStatus status) {}

  public record ReservationRequest(
      @NotNull Long tierId, @Min(1) @Max(10) int quantity, Long seatId) {}

  public record ReservationResponse(
      Long id,
      Long eventId,
      String eventTitle,
      Long tierId,
      String tierName,
      Long seatId,
      int quantity,
      BigDecimal unitPrice,
      BigDecimal total,
      ReservationStatus status,
      Instant expiresAt) {}

  public record CheckoutRequest(
      @NotNull Long reservationId,
      @NotNull PaymentMethod paymentMethod,
      @NotBlank @Size(max = 100) String idempotencyKey) {}

  public record OrderResponse(
      Long id,
      Long reservationId,
      PaymentMethod paymentMethod,
      OrderStatus status,
      BigDecimal total,
      Instant createdAt,
      Instant paidAt) {}

  public record TicketResponse(
      Long id,
      String code,
      Long orderId,
      Long eventId,
      String eventTitle,
      String venueName,
      Instant eventStart,
      Long tierId,
      String tierName,
      Long seatId,
      String seatLabel,
      Long ownerId,
      String ownerEmail,
      TicketStatus status,
      Instant issuedAt) {}

  public record TransferRequest(@NotBlank @Email String recipientEmail) {}
}
