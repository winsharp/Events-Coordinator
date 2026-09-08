package com.eventscoordinator.backend.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.eventscoordinator.backend.dto.VenueProfileRequest;
import com.eventscoordinator.backend.dto.VenueResponse;
import com.eventscoordinator.backend.model.Role;
import com.eventscoordinator.backend.model.User;
import com.eventscoordinator.backend.model.Venue;
import com.eventscoordinator.backend.repository.VenueRepository;

@Service
public class VenueService {

    private final VenueRepository venueRepository;

    public VenueService(VenueRepository venueRepository) {
        this.venueRepository = venueRepository;
    }

    public VenueResponse createProfile(User currentUser, VenueProfileRequest request) {
        requireRole(currentUser, Role.VENUE);
        if (venueRepository.findByUserId(currentUser.getId()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Venue profile already exists");
        }

        Venue venue = new Venue(currentUser, request.name(), request.city(), request.capacity());
        return toResponse(venueRepository.save(venue));
    }

    public VenueResponse getById(Long id) {
        return toResponse(findById(id));
    }

    public VenueResponse getOwnProfile(User currentUser) {
        return toResponse(findByUserId(currentUser.getId()));
    }

    public VenueResponse updateOwnProfile(User currentUser, VenueProfileRequest request) {
        Venue venue = findByUserId(currentUser.getId());
        venue.setName(request.name());
        venue.setCity(request.city());
        venue.setCapacity(request.capacity());
        return toResponse(venueRepository.save(venue));
    }

    private Venue findById(Long id) {
        return venueRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Venue not found"));
    }

    private Venue findByUserId(Long userId) {
        return venueRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No venue profile for this account yet"));
    }

    private void requireRole(User user, Role role) {
        if (user.getRole() != role) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only " + role + " accounts can do this");
        }
    }

    private VenueResponse toResponse(Venue venue) {
        return new VenueResponse(venue.getId(), venue.getUser().getUsername(), venue.getName(), venue.getCity(), venue.getCapacity());
    }
}
