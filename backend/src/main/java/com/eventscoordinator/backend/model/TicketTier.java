package com.eventscoordinator.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(
    name = "ticket_tiers",
    uniqueConstraints =
        @UniqueConstraint(
            name = "uk_event_tier_name",
            columnNames = {"event_id", "name"}))
public class TicketTier {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Version private long version;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "event_id", nullable = false)
  private Event event;

  @Column(nullable = false, length = 80)
  private String name;

  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal price;

  @Column(name = "total_quantity", nullable = false)
  private int totalQuantity;

  @Column(name = "available_quantity", nullable = false)
  private int availableQuantity;

  protected TicketTier() {}

  public TicketTier(Event e, String n, BigDecimal p, int q) {
    event = e;
    name = n;
    price = p;
    totalQuantity = q;
    availableQuantity = q;
  }

  public Long getId() {
    return id;
  }

  public Event getEvent() {
    return event;
  }

  public String getName() {
    return name;
  }

  public BigDecimal getPrice() {
    return price;
  }

  public int getTotalQuantity() {
    return totalQuantity;
  }

  public int getAvailableQuantity() {
    return availableQuantity;
  }

  public void update(String n, BigDecimal p, int total) {
    int sold = totalQuantity - availableQuantity;
    if (total < sold)
      throw new IllegalArgumentException("Quantity cannot be less than allocated inventory");
    name = n;
    price = p;
    totalQuantity = total;
    availableQuantity = total - sold;
  }

  public void hold(int q) {
    if (q < 1 || availableQuantity < q) throw new IllegalStateException("Insufficient inventory");
    availableQuantity -= q;
  }

  public void release(int q) {
    availableQuantity = Math.min(totalQuantity, availableQuantity + q);
  }
}
