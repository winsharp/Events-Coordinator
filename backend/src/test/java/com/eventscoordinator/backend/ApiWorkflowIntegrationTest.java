package com.eventscoordinator.backend;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.*;
import java.util.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.http.MediaType;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApiWorkflowIntegrationTest {
  @Autowired MockMvc mvc;
  @Autowired ObjectMapper json;
  @Autowired ApplicationContext context;

  String call(String method, String path, String token, String body, int status) throws Exception {
    var b =
        switch (method) {
          case "POST" -> post(path);
          case "PUT" -> put(path);
          case "PATCH" -> patch(path);
          case "DELETE" -> delete(path);
          default -> get(path);
        };
    if (token != null) b.header("Authorization", "Bearer " + token);
    if (body != null) b.contentType(MediaType.APPLICATION_JSON).content(body);
    MvcResult r = mvc.perform(b).andExpect(status().is(status)).andReturn();
    return r.getResponse().getContentAsString();
  }

  JsonNode node(String s) throws Exception {
    return json.readTree(s);
  }

  String register(String username, String email, String role) throws Exception {
    return node(call(
            "POST",
            "/api/auth/register",
            null,
            "{\"username\":\""
                + username
                + "\",\"email\":\""
                + email
                + "\",\"password\":\"StrongPass1!\",\"role\":\""
                + role
                + "\",\"firstName\":\"Test\",\"lastName\":\"User\"}",
            201))
        .get("token")
        .asText();
  }

  @Test
  void completeVenueArtistCustomerWorkflow() throws Exception {
    String venue = register("venueflow", "venueflow@test.dev", "VENUE"),
        artist = register("artistflow", "artistflow@test.dev", "ARTIST"),
        customer = register("customerflow", "customerflow@test.dev", "CUSTOMER"),
        recipient = register("recipientflow", "recipientflow@test.dev", "CUSTOMER");
    assertThat(node(call("GET", "/api/auth/me", customer, null, 200)).get("username").asText())
        .isEqualTo("customerflow");
    assertThat(
            node(call(
                    "PUT",
                    "/api/auth/me",
                    customer,
                    "{\"email\":\"customerflow@test.dev\",\"firstName\":\"Updated\",\"lastName\":\"Customer\"}",
                    200))
                .get("firstName")
                .asText())
        .isEqualTo("Updated");
    long venueId =
        node(call(
                "PUT",
                "/api/venues/me",
                venue,
                "{\"name\":\"Flow Hall\",\"address\":\"1 Main"
                    + " St\",\"city\":\"Austin\",\"capacity\":500,\"description\":\"Test venue\"}",
                200))
            .get("id")
            .asLong();
    long artistId =
        node(call(
                "PUT",
                "/api/artists/me",
                artist,
                "{\"stageName\":\"Flow Artist\",\"genre\":\"Rock\",\"bio\":\"Test artist\"}",
                200))
            .get("id")
            .asLong();
    assertThat(artistId).isPositive();
    long slotId =
        node(call(
                "POST",
                "/api/venues/" + venueId + "/slots",
                venue,
                "{\"startAt\":\"2030-06-01T19:00:00Z\",\"endAt\":\"2030-06-01T23:00:00Z\"}",
                201))
            .get("id")
            .asLong();
    call(
        "POST",
        "/api/artist/slots/" + slotId + "/book",
        venue,
        "{\"title\":\"Denied\",\"description\":\"Wrong role\"}",
        403);
    JsonNode pendingEvent =
        node(
            call(
                "POST",
                "/api/artist/slots/" + slotId + "/book",
                artist,
                "{\"title\":\"Flow Concert\",\"description\":\"Core workflow\"}",
                201));
    long eventId = pendingEvent.get("id").asLong();
    assertThat(pendingEvent.get("artistId").asLong()).isEqualTo(artistId);
    assertThat(pendingEvent.get("venueId").asLong()).isEqualTo(venueId);
    assertThat(pendingEvent.get("artistName").asText()).isEqualTo("Flow Artist");
    assertThat(pendingEvent.get("status").asText()).isEqualTo("PENDING");
    assertThat(
            node(call("GET", "/api/artist/events", artist, null, 200))
                .get(0)
                .get("status")
                .asText())
        .isEqualTo("PENDING");
    JsonNode venueBooking = node(call("GET", "/api/venue/bookings", venue, null, 200)).get(0);
    assertThat(venueBooking.get("artistName").asText()).isEqualTo("Flow Artist");
    assertThat(venueBooking.get("status").asText()).isEqualTo("PENDING");
    assertThat(
            node(call("GET", "/api/venue/slots", venue, null, 200))
                .get(0)
                .get("artistName")
                .asText())
        .isEqualTo("Flow Artist");
    assertThat(
            node(call("PATCH", "/api/venue/bookings/" + eventId + "/approve", venue, null, 200))
                .get("status")
                .asText())
        .isEqualTo("CONFIRMED");
    assertThat(
            node(call("GET", "/api/artist/events", artist, null, 200))
                .get(0)
                .get("status")
                .asText())
        .isEqualTo("CONFIRMED");
    assertThat(
            node(call(
                    "PUT",
                    "/api/events/" + eventId,
                    venue,
                    "{\"title\":\"Flow Concert Updated\",\"description\":\"Updated"
                        + " workflow\",\"startAt\":\"2030-06-01T19:30:00Z\",\"endAt\":\"2030-06-01T22:30:00Z\"}",
                    200))
                .get("title")
                .asText())
        .isEqualTo("Flow Concert Updated");
    long spareSlot =
        node(call(
                "POST",
                "/api/venues/" + venueId + "/slots",
                venue,
                "{\"startAt\":\"2030-06-08T19:00:00Z\",\"endAt\":\"2030-06-08T23:00:00Z\"}",
                201))
            .get("id")
            .asLong();
    call(
        "PUT",
        "/api/venue/slots/" + spareSlot,
        venue,
        "{\"startAt\":\"2030-06-08T20:00:00Z\",\"endAt\":\"2030-06-08T23:30:00Z\"}",
        200);
    call("DELETE", "/api/venue/slots/" + spareSlot, venue, null, 204);
    long tierId =
        node(call(
                "POST",
                "/api/events/" + eventId + "/tiers",
                venue,
                "{\"name\":\"Reserved\",\"price\":\"42.50\",\"quantity\":20}",
                201))
            .get("id")
            .asLong();
    JsonNode seatList =
        node(
            call(
                "POST",
                "/api/events/" + eventId + "/seats",
                venue,
                "{\"tierId\":"
                    + tierId
                    + ",\"section\":\"Floor\",\"row\":\"A\",\"firstNumber\":1,\"count\":4}",
                201));
    long seatId = seatList.get(0).get("id").asLong();
    long reservationId =
        node(call(
                "POST",
                "/api/reservations",
                customer,
                "{\"tierId\":" + tierId + ",\"quantity\":1,\"seatId\":" + seatId + "}",
                201))
            .get("id")
            .asLong();
    JsonNode order =
        node(
            call(
                "POST",
                "/api/checkout",
                customer,
                "{\"reservationId\":"
                    + reservationId
                    + ",\"paymentMethod\":\"CARD\",\"idempotencyKey\":\"workflow-card-1\"}",
                200));
    assertThat(order.get("status").asText()).isEqualTo("PAID");
    JsonNode same =
        node(
            call(
                "POST",
                "/api/checkout",
                customer,
                "{\"reservationId\":"
                    + reservationId
                    + ",\"paymentMethod\":\"CARD\",\"idempotencyKey\":\"workflow-card-1\"}",
                200));
    assertThat(same.get("id").asLong()).isEqualTo(order.get("id").asLong());
    JsonNode ticketList = node(call("GET", "/api/tickets", customer, null, 200));
    assertThat(ticketList).hasSize(1);
    long ticketId = ticketList.get(0).get("id").asLong();
    JsonNode transferred =
        node(
            call(
                "POST",
                "/api/tickets/" + ticketId + "/transfer",
                customer,
                "{\"recipientEmail\":\"recipientflow@test.dev\"}",
                200));
    assertThat(transferred.get("ownerUsername").asText()).isEqualTo("recipientflow");
    assertThat(node(call("GET", "/api/tickets", recipient, null, 200))).hasSize(1);
    long usdcReservation =
        node(call(
                "POST",
                "/api/reservations",
                customer,
                "{\"tierId\":" + tierId + ",\"quantity\":2}",
                201))
            .get("id")
            .asLong();
    JsonNode usdc =
        node(
            call(
                "POST",
                "/api/checkout",
                customer,
                "{\"reservationId\":"
                    + usdcReservation
                    + ",\"paymentMethod\":\"USDC\",\"idempotencyKey\":\"workflow-usdc-1\"}",
                200));
    assertThat(usdc.get("status").asText()).isEqualTo("PENDING");
    assertThat(
            node(call(
                    "GET",
                    "/api/orders/" + usdc.get("id").asLong() + "/status",
                    customer,
                    null,
                    200))
                .get("status")
                .asText())
        .isEqualTo("PAID");
    long paypalReservation =
        node(call(
                "POST",
                "/api/reservations",
                customer,
                "{\"tierId\":" + tierId + ",\"quantity\":1}",
                201))
            .get("id")
            .asLong();
    assertThat(
            node(call(
                    "POST",
                    "/api/checkout",
                    customer,
                    "{\"reservationId\":"
                        + paypalReservation
                        + ",\"paymentMethod\":\"PAYPAL\",\"idempotencyKey\":\"workflow-paypal-1\"}",
                    200))
                .get("status")
                .asText())
        .isEqualTo("PAID");
    long releasedId =
        node(call(
                "POST",
                "/api/reservations",
                customer,
                "{\"tierId\":" + tierId + ",\"quantity\":1}",
                201))
            .get("id")
            .asLong();
    assertThat(
            node(call("DELETE", "/api/reservations/" + releasedId, customer, null, 200))
                .get("status")
                .asText())
        .isEqualTo("RELEASED");
    assertThat(node(call("GET", "/api/orders", customer, null, 200))).hasSize(3);
    JsonNode events = node(call("GET", "/api/events?q=artist", null, null, 200));
    assertThat(events.toString()).contains("Flow Concert Updated");
    assertThat(
            node(call("DELETE", "/api/events/" + eventId, venue, null, 200)).get("status").asText())
        .isEqualTo("CANCELLED");
  }

  @Test
  void publicBrowseWorksAndProtectedRouteRejectsAnonymous() throws Exception {
    mvc.perform(get("/api/artists")).andExpect(status().isOk());
    mvc.perform(get("/api/venues")).andExpect(status().isOk());
    mvc.perform(get("/api/events")).andExpect(status().isOk());
    mvc.perform(get("/api/orders"))
        .andExpect(status().isUnauthorized())
        .andExpect(content().contentTypeCompatibleWith("application/problem+json"));
  }

  @Test
  void validationAndLoginFailuresReturnStructuredErrors() throws Exception {
    mvc.perform(
            post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    "{\"username\":\"x\",\"email\":\"bad\",\"password\":\"tiny\",\"role\":\"CUSTOMER\",\"firstName\":\"\",\"lastName\":\"\"}"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.errors").exists());
    mvc.perform(
            post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"missing\",\"password\":\"wrongpass\"}"))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.detail").value("Invalid username or password"));
  }

  @ParameterizedTest
  @ValueSource(
      strings = {"http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:4173"})
  void corsPreflightAllowsConfiguredReactOriginsAndRequiredHeaders(String origin) throws Exception {
    assertThat(context.getBeansOfType(SecurityFilterChain.class)).hasSize(1);
    mvc.perform(
            options("/api/checkout")
                .header("Origin", origin)
                .header("Access-Control-Request-Method", "PATCH")
                .header(
                    "Access-Control-Request-Headers",
                    "Authorization, Content-Type, Idempotency-Key"))
        .andExpect(status().isOk())
        .andExpect(header().string("Access-Control-Allow-Origin", origin))
        .andExpect(header().string("Access-Control-Allow-Credentials", "true"))
        .andExpect(
            header()
                .string(
                    "Access-Control-Allow-Methods", org.hamcrest.Matchers.containsString("PATCH")))
        .andExpect(
            header()
                .string(
                    "Access-Control-Allow-Headers",
                    org.hamcrest.Matchers.containsString("Authorization")))
        .andExpect(
            header()
                .string(
                    "Access-Control-Allow-Headers",
                    org.hamcrest.Matchers.containsString("Content-Type")))
        .andExpect(
            header()
                .string(
                    "Access-Control-Allow-Headers",
                    org.hamcrest.Matchers.containsString("Idempotency-Key")));
  }

  @Test
  void venueCanRejectBookingWhileOtherVenueCannotDecideIt() throws Exception {
    String venue = register("venuereject", "venuereject@test.dev", "VENUE");
    String otherVenue = register("venueother", "venueother@test.dev", "VENUE");
    String artist = register("artistreject", "artistreject@test.dev", "ARTIST");
    MvcResult publication =
        mvc.perform(
                post("/api/venues")
                    .header("Authorization", "Bearer " + venue)
                    .header("Origin", "http://localhost:5173")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        "{\"name\":\"Reject Hall\",\"address\":\"2 Main"
                            + " St\",\"city\":\"Austin\",\"capacity\":300,\"description\":\"Published"
                            + " venue\"}"))
            .andExpect(status().isCreated())
            .andExpect(
                header().string("Location", org.hamcrest.Matchers.startsWith("/api/venues/")))
            .andExpect(
                header()
                    .string(
                        "Access-Control-Expose-Headers",
                        org.hamcrest.Matchers.containsString("Location")))
            .andReturn();
    long venueId = node(publication.getResponse().getContentAsString()).get("id").asLong();
    mvc.perform(get("/api/venues/me").header("Authorization", "Bearer " + venue))
        .andExpect(status().isOk());
    call(
        "PUT",
        "/api/venues/me",
        otherVenue,
        "{\"name\":\"Other Hall\",\"address\":\"3 Main"
            + " St\",\"city\":\"Dallas\",\"capacity\":400,\"description\":\"Other venue\"}",
        200);
    call(
        "PUT",
        "/api/artists/me",
        artist,
        "{\"stageName\":\"Reject Artist\",\"genre\":\"Soul\",\"bio\":\"Test artist\"}",
        200);
    long slotId =
        node(call(
                "POST",
                "/api/venues/" + venueId + "/slots",
                venue,
                "{\"startAt\":\"2031-07-01T19:00:00Z\",\"endAt\":\"2031-07-01T23:00:00Z\"}",
                201))
            .get("id")
            .asLong();
    long eventId =
        node(call(
                "POST",
                "/api/artist/slots/" + slotId + "/book",
                artist,
                "{\"title\":\"Rejected Show\",\"description\":\"Lifecycle test\"}",
                201))
            .get("id")
            .asLong();
    call("PATCH", "/api/events/" + eventId + "/reject", otherVenue, null, 403);
    assertThat(
            node(call("PATCH", "/api/events/" + eventId + "/reject", venue, null, 200))
                .get("status")
                .asText())
        .isEqualTo("REJECTED");
    assertThat(node(call("GET", "/api/artist/events", artist, null, 200))).isEmpty();
    assertThat(
            node(call("GET", "/api/venue/slots", venue, null, 200))
                .get(0)
                .get("bookingStatus")
                .asText())
        .isEqualTo("REJECTED");
  }

  @Test
  void venueProfileFieldsAndPublicationStateArePersisted() throws Exception {
    String venue = register("venueprofile", "venueprofile@test.dev", "VENUE");
    String profile =
        "{\"name\":\"Profile Hall\",\"address\":\"50 Music Way\",\"city\":\"Austin\","
            + "\"capacity\":850,\"description\":\"Flexible independent venue\","
            + "\"contactEmail\":\"bookings@profile.test\",\"website\":\"https://profile.test\","
            + "\"genres\":[\"Rock\",\"Electronic\"],\"amenities\":[\"Accessible\",\"Green room\"],"
            + "\"published\":false}";
    JsonNode created = node(call("POST", "/api/venues", venue, profile, 201));
    long venueId = created.get("id").asLong();
    assertThat(created.get("published").asBoolean()).isTrue();
    assertThat(created.get("contactEmail").asText()).isEqualTo("bookings@profile.test");
    assertThat(created.get("genres")).hasSize(2);
    assertThat(created.get("amenities")).hasSize(2);
    call("GET", "/api/venues/" + venueId, null, null, 200);

    JsonNode unpublished = node(call("PUT", "/api/venues/me", venue, profile, 200));
    assertThat(unpublished.get("published").asBoolean()).isFalse();
    call("GET", "/api/venues/" + venueId, null, null, 404);

    String republished = profile.replace("\"published\":false", "\"published\":true");
    assertThat(
            node(call("PUT", "/api/venues/me", venue, republished, 200))
                .get("published")
                .asBoolean())
        .isTrue();
    call("GET", "/api/venues/" + venueId, null, null, 200);
  }
}
