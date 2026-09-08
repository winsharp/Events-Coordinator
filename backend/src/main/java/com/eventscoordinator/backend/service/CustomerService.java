package com.eventscoordinator.backend.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.eventscoordinator.backend.dto.CustomerProfileRequest;
import com.eventscoordinator.backend.dto.CustomerResponse;
import com.eventscoordinator.backend.model.Account;
import com.eventscoordinator.backend.model.Role;
import com.eventscoordinator.backend.repository.AccountRepository;

// Customers don't get a separate profile entity like Artist/Venue do — there's
// nothing customer-specific beyond what's already on Account. This service
// just exposes that same Account data through a matching "/me" shape for
// frontend/API consistency with ArtistService and VenueService.
@Service
public class CustomerService {

    private final AccountRepository accountRepository;

    public CustomerService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    public CustomerResponse getOwnProfile(Account currentAccount) {
        requireRole(currentAccount);
        return toResponse(currentAccount);
    }

    public CustomerResponse updateOwnProfile(Account currentAccount, CustomerProfileRequest request) {
        requireRole(currentAccount);
        currentAccount.setFirstName(request.firstName());
        currentAccount.setLastName(request.lastName());
        currentAccount.setEmail(request.email());
        return toResponse(accountRepository.save(currentAccount));
    }

    private void requireRole(Account account) {
        if (account.getRole() != Role.CUSTOMER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only CUSTOMER accounts have a customer profile");
        }
    }

    private CustomerResponse toResponse(Account account) {
        return new CustomerResponse(account.getId(), account.getUsername(), account.getEmail(), account.getFirstName(), account.getLastName());
    }
}
