package com.eventscoordinator.backend.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.eventscoordinator.backend.dto.ArtistProfileRequest;
import com.eventscoordinator.backend.dto.ArtistResponse;
import com.eventscoordinator.backend.model.Artist;
import com.eventscoordinator.backend.model.Role;
import com.eventscoordinator.backend.model.User;
import com.eventscoordinator.backend.repository.ArtistRepository;

@Service
public class ArtistService {

    private final ArtistRepository artistRepository;

    public ArtistService(ArtistRepository artistRepository) {
        this.artistRepository = artistRepository;
    }

    public ArtistResponse createProfile(User currentUser, ArtistProfileRequest request) {
        requireRole(currentUser, Role.ARTIST);
        if (artistRepository.findByUserId(currentUser.getId()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Artist profile already exists");
        }

        Artist artist = new Artist(currentUser, request.stageName(), request.genre(), request.bio());
        return toResponse(artistRepository.save(artist));
    }

    public ArtistResponse getById(Long id) {
        return toResponse(findById(id));
    }

    public ArtistResponse getOwnProfile(User currentUser) {
        return toResponse(findByUserId(currentUser.getId()));
    }

    public ArtistResponse updateOwnProfile(User currentUser, ArtistProfileRequest request) {
        Artist artist = findByUserId(currentUser.getId());
        artist.setStageName(request.stageName());
        artist.setGenre(request.genre());
        artist.setBio(request.bio());
        return toResponse(artistRepository.save(artist));
    }

    private Artist findById(Long id) {
        return artistRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Artist not found"));
    }

    private Artist findByUserId(Long userId) {
        return artistRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No artist profile for this account yet"));
    }

    private void requireRole(User user, Role role) {
        if (user.getRole() != role) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only " + role + " accounts can do this");
        }
    }

    private ArtistResponse toResponse(Artist artist) {
        return new ArtistResponse(artist.getId(), artist.getUser().getUsername(), artist.getStageName(), artist.getGenre(), artist.getBio());
    }
}
