package com.eventscoordinator.backend.model;

import jakarta.persistence.*;

@Entity
@Table(
    name = "seats",
    uniqueConstraints =
        @UniqueConstraint(
            name = "uk_event_seat",
            columnNames = {"event_id", "section_name", "row_label", "seat_number"}))
public class Seat {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Version private long version;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "event_id", nullable = false)
  private Event event;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "tier_id", nullable = false)
  private TicketTier tier;

  @Column(name = "section_name", nullable = false, length = 50)
  private String section;

  @Column(name = "row_label", nullable = false, length = 20)
  private String row;

  @Column(name = "seat_number", nullable = false)
  private int number;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private SeatStatus status = SeatStatus.AVAILABLE;

  protected Seat() {}

  public Seat(Event e, TicketTier t, String s, String r, int n) {
    event = e;
    tier = t;
    section = s;
    row = r;
    number = n;
  }

  public Long getId() {
    return id;
  }

  public Event getEvent() {
    return event;
  }

  public TicketTier getTier() {
    return tier;
  }

  public String getSection() {
    return section;
  }

  public String getRow() {
    return row;
  }

  public int getNumber() {
    return number;
  }

  public SeatStatus getStatus() {
    return status;
  }

  public void hold() {
    if (status != SeatStatus.AVAILABLE) throw new IllegalStateException("Seat is unavailable");
    status = SeatStatus.HELD;
  }

  public void release() {
    if (status == SeatStatus.HELD) status = SeatStatus.AVAILABLE;
  }

  public void sell() {
    if (status != SeatStatus.HELD) throw new IllegalStateException("Seat is not held");
    status = SeatStatus.SOLD;
  }
}
