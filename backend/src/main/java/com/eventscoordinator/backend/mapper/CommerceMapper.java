package com.eventscoordinator.backend.mapper;

import com.eventscoordinator.backend.dto.CommerceDtos.*;
import com.eventscoordinator.backend.model.*;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface CommerceMapper {
  @Mapping(target = "eventId", source = "event.id")
  TierResponse toResponse(TicketTier t);

  @Mapping(target = "eventId", source = "event.id")
  @Mapping(target = "tierId", source = "tier.id")
  @Mapping(target = "tierName", source = "tier.name")
  SeatResponse toResponse(Seat s);

  @Mapping(target = "eventId", source = "event.id")
  @Mapping(target = "eventTitle", source = "event.title")
  @Mapping(target = "tierId", source = "tier.id")
  @Mapping(target = "tierName", source = "tier.name")
  @Mapping(target = "seatId", source = "seat.id")
  @Mapping(
      target = "total",
      expression = "java(r.getUnitPrice().multiply(BigDecimal.valueOf(r.getQuantity())))")
  ReservationResponse toResponse(Reservation r);

  @Mapping(target = "reservationId", source = "reservation.id")
  OrderResponse toResponse(PurchaseOrder o);

  @Mapping(target = "orderId", source = "order.id")
  @Mapping(target = "eventId", source = "event.id")
  @Mapping(target = "eventTitle", source = "event.title")
  @Mapping(target = "venueName", source = "event.venue.name")
  @Mapping(target = "eventStart", source = "event.startAt")
  @Mapping(target = "tierId", source = "tier.id")
  @Mapping(target = "tierName", source = "tier.name")
  @Mapping(target = "seatId", source = "seat.id")
  @Mapping(target = "seatLabel", expression = "java(seatLabel(t.getSeat()))")
  @Mapping(target = "ownerId", source = "owner.id")
  @Mapping(target = "ownerUsername", source = "owner.username")
  TicketResponse toResponse(IssuedTicket t);

  default String seatLabel(Seat s) {
    return s == null ? null : s.getSection() + " " + s.getRow() + "-" + s.getNumber();
  }
}
