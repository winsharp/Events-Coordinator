package com.eventscoordinator.backend.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eventscoordinator.backend.dto.CustomerProfileRequest;
import com.eventscoordinator.backend.dto.CustomerResponse;
import com.eventscoordinator.backend.security.AppAccountPrincipal;
import com.eventscoordinator.backend.service.CustomerService;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping("/me")
    public CustomerResponse getOwnProfile(@AuthenticationPrincipal AppAccountPrincipal principal) {
        return customerService.getOwnProfile(principal.getAccount());
    }

    @PutMapping("/me")
    public CustomerResponse updateOwnProfile(@AuthenticationPrincipal AppAccountPrincipal principal, @RequestBody CustomerProfileRequest request) {
        return customerService.updateOwnProfile(principal.getAccount(), request);
    }
}
