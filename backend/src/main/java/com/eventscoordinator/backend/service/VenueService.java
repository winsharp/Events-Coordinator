package com.eventscoordinator.backend.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.eventscoordinator.backend.dto.VenueProfileRequest;
import com.eventscoordinator.backend.dto.VenueResponse;
import com.eventscoordinator.backend.model.Account;
import com.eventscoordinator.backend.model.Role;
import com.eventscoordinator.backend.model.Venue;
import com.eventscoordinator.backend.repository.VenueRepository;

@Service
public class VenueService {

    private final VenueRepository venueRepository;

    public VenueService(VenueRepository venueRepository) {
        this.venueRepository = venueRepository;
    }

    public VenueResponse createProfile(Account currentAccount, VenueProfileRequest request) {
        requireRole(currentAccount, Role.VENUE);
        if (venueRepository.findByAccountId(currentAccount.getId()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Venue profile already exists");
        }

        Venue venue = new Venue(currentAccount, request.name(), request.city(), request.capacity());
        return toResponse(venueRepository.save(venue));
    }

    public VenueResponse getById(Long id) {
        return toResponse(findById(id));
    }

    public List<VenueResponse> getAll() {
        return venueRepository.findAll().stream().map(venue -> toResponse(venue)).toList();
    }

    public VenueResponse getOwnProfile(Account currentAccount) {
        return toResponse(findByAccountId(currentAccount.getId()));
    }

    public VenueResponse updateOwnProfile(Account currentAccount, VenueProfileRequest request) {
        Venue venue = findByAccountId(currentAccount.getId());
        venue.setName(request.name());
        venue.setCity(request.city());
        venue.setCapacity(request.capacity());
        return toResponse(venueRepository.save(venue));
    }

    private Venue findById(Long id) {
        return venueRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Venue not found"));
    }

    private Venue findByAccountId(Long accountId) {
        return venueRepository.findByAccountId(accountId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No venue profile for this account yet"));
    }

    private void requireRole(Account account, Role role) {
        if (account.getRole() != role) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only " + role + " accounts can do this");
        }
    }

    private VenueResponse toResponse(Venue venue) {
        return new VenueResponse(venue.getId(), venue.getAccount().getUsername(), venue.getName(), venue.getCity(), venue.getCapacity());
    }
}
