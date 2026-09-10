package com.eventscoordinator.backend.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(
    name = "availability_slots",
    uniqueConstraints =
        @UniqueConstraint(
            name = "uk_venue_slot_start",
            columnNames = {"venue_id", "start_at"}))
public class AvailabilitySlot {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Version private long version;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "venue_id", nullable = false)
  private Venue venue;

  @Column(name = "start_at", nullable = false)
  private Instant startAt;

  @Column(name = "end_at", nullable = false)
  private Instant endAt;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private SlotStatus status = SlotStatus.OPEN;

  protected AvailabilitySlot() {}

  public AvailabilitySlot(Venue v, Instant s, Instant e) {
    venue = v;
    startAt = s;
    endAt = e;
  }

  public Long getId() {
    return id;
  }

  public Venue getVenue() {
    return venue;
  }

  public Instant getStartAt() {
    return startAt;
  }

  public Instant getEndAt() {
    return endAt;
  }

  public SlotStatus getStatus() {
    return status;
  }

  public void update(Instant s, Instant e) {
    startAt = s;
    endAt = e;
  }

  public void book() {
    if (status != SlotStatus.OPEN) throw new IllegalStateException("Slot is not open");
    status = SlotStatus.BOOKED;
  }

  public void reject() {
    if (status != SlotStatus.BOOKED)
      throw new IllegalStateException("Only a booked slot can be rejected");
    status = SlotStatus.CANCELLED;
  }

  public void cancel() {
    if (status == SlotStatus.BOOKED)
      throw new IllegalStateException("Booked slot cannot be deleted");
    status = SlotStatus.CANCELLED;
  }
}
