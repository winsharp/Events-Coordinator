package com.eventscoordinator.backend.mapper;

import com.eventscoordinator.backend.dto.AccountDtos;
import com.eventscoordinator.backend.model.Account;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface AccountMapper {
  AccountDtos.Response toResponse(Account account);
}
