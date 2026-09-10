package com.eventscoordinator.backend.repository;

import com.eventscoordinator.backend.model.PurchaseOrder;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
  Optional<PurchaseOrder> findByCustomerIdAndIdempotencyKey(Long customerId, String key);

  List<PurchaseOrder> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
}
