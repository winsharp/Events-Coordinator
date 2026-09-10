package com.eventscoordinator.backend.logging;

import java.util.Arrays;
import java.util.stream.Collectors;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class BusinessLoggingAspect {
  private static final Logger log = LoggerFactory.getLogger(BusinessLoggingAspect.class);

  @Around(
      "execution(public * com.eventscoordinator.backend.service.AuthService.*(..)) || "
          + "execution(public * com.eventscoordinator.backend.service.EventService.*(..)) || "
          + "execution(public * com.eventscoordinator.backend.service.ReservationService.*(..)) || "
          + "execution(public * com.eventscoordinator.backend.service.CheckoutService.*(..)) || "
          + "execution(public * com.eventscoordinator.backend.service.ProfileService.*(..)) || "
          + "execution(public * com.eventscoordinator.backend.service.InventoryService.*(..))")
  public Object logBusinessCall(ProceedingJoinPoint call) throws Throwable {
    long started = System.nanoTime();
    String operation =
        call.getSignature().getDeclaringType().getSimpleName()
            + "."
            + call.getSignature().getName();
    String actor = actor();
    String arguments = safeArguments(call.getArgs());
    log.info("business.start operation={} actor={} arguments={}", operation, actor, arguments);
    try {
      Object result = call.proceed();
      log.info(
          "business.success operation={} actor={} durationMs={}",
          operation,
          actor,
          elapsedMillis(started));
      return result;
    } catch (Throwable failure) {
      log.warn(
          "business.failure operation={} actor={} durationMs={} errorType={}",
          operation,
          actor,
          elapsedMillis(started),
          failure.getClass().getSimpleName());
      throw failure;
    }
  }

  private String actor() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    return authentication == null || !authentication.isAuthenticated()
        ? "anonymous"
        : authentication.getName();
  }

  private String safeArguments(Object[] arguments) {
    String summary =
        Arrays.stream(arguments)
            .map(
                argument -> {
                  if (argument == null) return "null";
                  if (argument instanceof Number || argument instanceof Enum<?>) {
                    return argument.toString();
                  }
                  return argument.getClass().getSimpleName();
                })
            .collect(Collectors.joining(","));
    return summary.isEmpty() ? "none" : summary;
  }

  private long elapsedMillis(long started) {
    return (System.nanoTime() - started) / 1_000_000;
  }
}
