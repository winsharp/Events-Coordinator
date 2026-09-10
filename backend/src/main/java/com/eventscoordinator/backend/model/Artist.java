package com.eventscoordinator.backend.model;

import jakarta.persistence.*;

@Entity
@Table(
    name = "artists",
    uniqueConstraints = @UniqueConstraint(name = "uk_artist_account", columnNames = "account_id"))
public class Artist {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Version private long version;

  @OneToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "account_id", nullable = false)
  private Account account;

  @Column(name = "stage_name", nullable = false, length = 120)
  private String stageName;

  @Column(nullable = false, length = 80)
  private String genre;

  @Column(length = 2000)
  private String bio;

  protected Artist() {}

  public Artist(Account a, String s, String g, String b) {
    account = a;
    stageName = s;
    genre = g;
    bio = b;
  }

  public Long getId() {
    return id;
  }

  public Account getAccount() {
    return account;
  }

  public String getStageName() {
    return stageName;
  }

  public String getGenre() {
    return genre;
  }

  public String getBio() {
    return bio;
  }

  public void update(String s, String g, String b) {
    stageName = s;
    genre = g;
    bio = b;
  }
}
