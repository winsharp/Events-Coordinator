package com.eventscoordinator.backend.model;

import jakarta.persistence.*;

@Entity
@Table(
    name = "venues",
    uniqueConstraints = @UniqueConstraint(name = "uk_venue_account", columnNames = "account_id"))
public class Venue {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Version private long version;

  @OneToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "account_id", nullable = false)
  private Account account;

  @Column(nullable = false, length = 150)
  private String name;

  @Column(nullable = false, length = 120)
  private String address;

  @Column(nullable = false, length = 80)
  private String city;

  @Column(nullable = false)
  private int capacity;

  @Column(length = 2000)
  private String description;

  @Column(name = "contact_email", length = 254)
  private String contactEmail;

  @Column(length = 500)
  private String website;

  @Column(length = 1000)
  private String genres;

  @Column(length = 1000)
  private String amenities;

  @Column(nullable = false)
  private boolean published;

  protected Venue() {}

  public Venue(
      Account account,
      String name,
      String address,
      String city,
      int capacity,
      String description,
      String contactEmail,
      String website,
      String genres,
      String amenities,
      boolean published) {
    this.account = account;
    update(
        name,
        address,
        city,
        capacity,
        description,
        contactEmail,
        website,
        genres,
        amenities,
        published);
  }

  public Long getId() {
    return id;
  }

  public Account getAccount() {
    return account;
  }

  public String getName() {
    return name;
  }

  public String getAddress() {
    return address;
  }

  public String getCity() {
    return city;
  }

  public int getCapacity() {
    return capacity;
  }

  public String getDescription() {
    return description;
  }

  public String getContactEmail() {
    return contactEmail;
  }

  public String getWebsite() {
    return website;
  }

  public String getGenres() {
    return genres;
  }

  public String getAmenities() {
    return amenities;
  }

  public boolean isPublished() {
    return published;
  }

  public void update(
      String name,
      String address,
      String city,
      int capacity,
      String description,
      String contactEmail,
      String website,
      String genres,
      String amenities,
      boolean published) {
    this.name = name;
    this.address = address;
    this.city = city;
    this.capacity = capacity;
    this.description = description;
    this.contactEmail = contactEmail;
    this.website = website;
    this.genres = genres;
    this.amenities = amenities;
    this.published = published;
  }
}
