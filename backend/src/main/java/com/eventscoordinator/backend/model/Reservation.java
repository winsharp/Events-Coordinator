package com.eventscoordinator.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "reservations")
public class Reservation {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Version private long version;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "customer_id", nullable = false)
  private Account customer;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "event_id", nullable = false)
  private Event event;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "tier_id", nullable = false)
  private TicketTier tier;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "seat_id")
  private Seat seat;

  @Column(nullable = false)
  private int quantity;

  @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
  private BigDecimal unitPrice;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private ReservationStatus status = ReservationStatus.ACTIVE;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt = Instant.now();

  @Column(name = "expires_at", nullable = false)
  private Instant expiresAt;

  protected Reservation() {}

  public Reservation(Account c, Event e, TicketTier t, Seat s, int q, Instant ex) {
    customer = c;
    event = e;
    tier = t;
    seat = s;
    quantity = q;
    unitPrice = t.getPrice();
    expiresAt = ex;
  }

  public Long getId() {
    return id;
  }

  public Account getCustomer() {
    return customer;
  }

  public Event getEvent() {
    return event;
  }

  public TicketTier getTier() {
    return tier;
  }

  public Seat getSeat() {
    return seat;
  }

  public int getQuantity() {
    return quantity;
  }

  public BigDecimal getUnitPrice() {
    return unitPrice;
  }

  public ReservationStatus getStatus() {
    return status;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public Instant getExpiresAt() {
    return expiresAt;
  }

  public boolean expired(Instant now) {
    return status == ReservationStatus.ACTIVE && !expiresAt.isAfter(now);
  }

  public void release(ReservationStatus s) {
    if (status != ReservationStatus.ACTIVE)
      throw new IllegalStateException("Reservation is not active");
    status = s;
  }

  public void convert() {
    if (status != ReservationStatus.ACTIVE)
      throw new IllegalStateException("Reservation is not active");
    status = ReservationStatus.CONVERTED;
  }
}
