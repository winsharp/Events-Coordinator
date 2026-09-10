package com.eventscoordinator.backend.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "issued_tickets",
    uniqueConstraints = @UniqueConstraint(name = "uk_ticket_code", columnNames = "code"))
public class IssuedTicket {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Version private long version;

  @Column(nullable = false, updatable = false, length = 36)
  private String code = UUID.randomUUID().toString();

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "order_id", nullable = false)
  private PurchaseOrder order;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "event_id", nullable = false)
  private Event event;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "tier_id", nullable = false)
  private TicketTier tier;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "seat_id")
  private Seat seat;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "owner_id", nullable = false)
  private Account owner;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private TicketStatus status = TicketStatus.VALID;

  @Column(name = "issued_at", nullable = false)
  private Instant issuedAt = Instant.now();

  protected IssuedTicket() {}

  public IssuedTicket(PurchaseOrder o, Event e, TicketTier t, Seat s, Account owner) {
    order = o;
    event = e;
    tier = t;
    seat = s;
    this.owner = owner;
  }

  public Long getId() {
    return id;
  }

  public String getCode() {
    return code;
  }

  public PurchaseOrder getOrder() {
    return order;
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

  public Account getOwner() {
    return owner;
  }

  public TicketStatus getStatus() {
    return status;
  }

  public Instant getIssuedAt() {
    return issuedAt;
  }

  public void transfer(Account recipient) {
    if (status != TicketStatus.VALID) throw new IllegalStateException("Ticket is not transferable");
    owner = recipient;
  }
}
