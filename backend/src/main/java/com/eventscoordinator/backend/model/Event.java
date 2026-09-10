package com.eventscoordinator.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.Instant;

@Entity
@Table(name = "events")
public class Event {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Version private long version;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "venue_id", nullable = false)
  private Venue venue;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "artist_id", nullable = false)
  private Artist artist;

  @OneToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "slot_id", nullable = false, unique = true)
  private AvailabilitySlot slot;

  @Column(nullable = false, length = 180)
  private String title;

  @Column(length = 3000)
  private String description;

  @Column(name = "start_at", nullable = false)
  private Instant startAt;

  @Column(name = "end_at", nullable = false)
  private Instant endAt;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private EventStatus status = EventStatus.PENDING;

  protected Event() {}

  public Event(
      Venue venue, Artist artist, AvailabilitySlot slot, String title, String description) {
    this.venue = venue;
    this.artist = artist;
    this.slot = slot;
    this.title = title;
    this.description = description;
    startAt = slot.getStartAt();
    endAt = slot.getEndAt();
  }

  public Long getId() {
    return id;
  }

  public Venue getVenue() {
    return venue;
  }

  public Artist getArtist() {
    return artist;
  }

  public AvailabilitySlot getSlot() {
    return slot;
  }

  public String getTitle() {
    return title;
  }

  public String getDescription() {
    return description;
  }

  public Instant getStartAt() {
    return startAt;
  }

  public Instant getEndAt() {
    return endAt;
  }

  public EventStatus getStatus() {
    return status;
  }

  public void update(String title, String description, Instant startAt, Instant endAt) {
    if (status == EventStatus.CANCELLED || status == EventStatus.REJECTED) {
      throw new IllegalStateException("Closed event cannot be updated");
    }
    this.title = title;
    this.description = description;
    this.startAt = startAt;
    this.endAt = endAt;
  }

  public void approve() {
    requirePending();
    status = EventStatus.CONFIRMED;
  }

  public void reject() {
    requirePending();
    status = EventStatus.REJECTED;
  }

  public void cancel() {
    if (status != EventStatus.CONFIRMED) {
      throw new IllegalStateException("Only a confirmed event can be cancelled");
    }
    status = EventStatus.CANCELLED;
  }

  private void requirePending() {
    if (status != EventStatus.PENDING) {
      throw new IllegalStateException("Booking request is no longer pending");
    }
  }
}
