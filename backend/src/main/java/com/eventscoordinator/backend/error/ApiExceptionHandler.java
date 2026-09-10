package com.eventscoordinator.backend.error;

import jakarta.persistence.OptimisticLockException;
import jakarta.validation.ConstraintViolationException;
import java.net.URI;
import java.util.*;
import org.springframework.dao.*;
import org.springframework.http.*;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ApiExceptionHandler {
  @ExceptionHandler(ResponseStatusException.class)
  ProblemDetail status(ResponseStatusException e) {
    var p =
        ProblemDetail.forStatusAndDetail(
            e.getStatusCode(), e.getReason() == null ? "Request failed" : e.getReason());
    p.setType(URI.create("https://ticketgenie.example/problems/request"));
    return p;
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  ProblemDetail validation(MethodArgumentNotValidException e) {
    var p = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Request validation failed");
    Map<String, String> errors = new LinkedHashMap<>();
    e.getBindingResult()
        .getFieldErrors()
        .forEach(x -> errors.putIfAbsent(x.getField(), x.getDefaultMessage()));
    p.setProperty("errors", errors);
    return p;
  }

  @ExceptionHandler({ConstraintViolationException.class, IllegalArgumentException.class})
  ProblemDetail bad(Exception e) {
    return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, e.getMessage());
  }

  @ExceptionHandler(IllegalStateException.class)
  ProblemDetail conflict(IllegalStateException e) {
    return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, e.getMessage());
  }

  @ExceptionHandler(AccessDeniedException.class)
  ProblemDetail denied(AccessDeniedException e) {
    return ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "Access denied");
  }

  @ExceptionHandler({
    DataIntegrityViolationException.class,
    ObjectOptimisticLockingFailureException.class,
    OptimisticLockException.class
  })
  ProblemDetail concurrency(Exception e) {
    return ProblemDetail.forStatusAndDetail(
        HttpStatus.CONFLICT, "The resource changed concurrently or violates a uniqueness rule");
  }
}
