package com.eventscoordinator.backend.repository;

import com.eventscoordinator.backend.model.Artist;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ArtistRepository extends JpaRepository<Artist, Long> {
  Optional<Artist> findByAccountId(Long accountId);

  List<Artist> findByStageNameContainingIgnoreCaseOrGenreContainingIgnoreCaseOrderByStageName(
      String q, String q2);
}
