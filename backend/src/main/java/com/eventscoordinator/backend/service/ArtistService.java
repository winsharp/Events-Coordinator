package com.eventscoordinator.backend.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.eventscoordinator.backend.dto.ArtistProfileRequest;
import com.eventscoordinator.backend.dto.ArtistResponse;
import com.eventscoordinator.backend.model.Account;
import com.eventscoordinator.backend.model.Artist;
import com.eventscoordinator.backend.model.Role;
import com.eventscoordinator.backend.repository.ArtistRepository;

@Service
public class ArtistService {

    private final ArtistRepository artistRepository;

    public ArtistService(ArtistRepository artistRepository) {
        this.artistRepository = artistRepository;
    }

    public ArtistResponse createProfile(Account currentAccount, ArtistProfileRequest request) {
        requireRole(currentAccount, Role.ARTIST);
        if (artistRepository.findByAccountId(currentAccount.getId()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Artist profile already exists");
        }

        Artist artist = new Artist(currentAccount, request.stageName(), request.genre(), request.bio());
        return toResponse(artistRepository.save(artist));
    }

    public ArtistResponse getById(Long id) {
        return toResponse(findById(id));
    }

    public ArtistResponse getOwnProfile(Account currentAccount) {
        return toResponse(findByAccountId(currentAccount.getId()));
    }

    public ArtistResponse updateOwnProfile(Account currentAccount, ArtistProfileRequest request) {
        Artist artist = findByAccountId(currentAccount.getId());
        artist.setStageName(request.stageName());
        artist.setGenre(request.genre());
        artist.setBio(request.bio());
        return toResponse(artistRepository.save(artist));
    }

    private Artist findById(Long id) {
        return artistRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Artist not found"));
    }

    private Artist findByAccountId(Long accountId) {
        return artistRepository.findByAccountId(accountId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No artist profile for this account yet"));
    }

    private void requireRole(Account account, Role role) {
        if (account.getRole() != role) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only " + role + " accounts can do this");
        }
    }

    private ArtistResponse toResponse(Artist artist) {
        return new ArtistResponse(artist.getId(), artist.getAccount().getUsername(), artist.getStageName(), artist.getGenre(), artist.getBio());
    }
}
