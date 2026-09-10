package com.eventscoordinator.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(
    name = "purchase_orders",
    uniqueConstraints =
        @UniqueConstraint(
            name = "uk_order_idempotency",
            columnNames = {"customer_id", "idempotency_key"}))
public class PurchaseOrder {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Version private long version;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "customer_id", nullable = false)
  private Account customer;

  @OneToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "reservation_id", nullable = false, unique = true)
  private Reservation reservation;

  @Column(name = "idempotency_key", nullable = false, length = 100)
  private String idempotencyKey;

  @Enumerated(EnumType.STRING)
  @Column(name = "payment_method", nullable = false, length = 20)
  private PaymentMethod paymentMethod;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private OrderStatus status;

  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal total;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt = Instant.now();

  @Column(name = "process_after")
  private Instant processAfter;

  @Column(name = "paid_at")
  private Instant paidAt;

  protected PurchaseOrder() {}

  public PurchaseOrder(
      Account c,
      Reservation r,
      String key,
      PaymentMethod m,
      OrderStatus s,
      BigDecimal total,
      Instant processAfter) {
    customer = c;
    reservation = r;
    idempotencyKey = key;
    paymentMethod = m;
    status = s;
    this.total = total;
    this.processAfter = processAfter;
  }

  public Long getId() {
    return id;
  }

  public Account getCustomer() {
    return customer;
  }

  public Reservation getReservation() {
    return reservation;
  }

  public String getIdempotencyKey() {
    return idempotencyKey;
  }

  public PaymentMethod getPaymentMethod() {
    return paymentMethod;
  }

  public OrderStatus getStatus() {
    return status;
  }

  public BigDecimal getTotal() {
    return total;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public Instant getProcessAfter() {
    return processAfter;
  }

  public Instant getPaidAt() {
    return paidAt;
  }

  public boolean ready(Instant now) {
    return status == OrderStatus.PENDING && processAfter != null && !processAfter.isAfter(now);
  }

  public void markPaid(Instant now) {
    status = OrderStatus.PAID;
    paidAt = now;
  }
}
