import { describe, expect, it } from "vitest";
import {
  api,
  mapEventCatalogForUi,
  mapSpringBookingForUi,
  mapSpringEventForUi,
  mapSpringSlotForUi,
  mapSpringVenueForUi,
  type SpringEvent,
} from "./client";
import { demoPassword, sampleCheckout, userByRole } from "../types";

const springEvent = (status = "CONFIRMED"): SpringEvent => ({
  id: 42,
  title: "Comets Homecoming",
  description: "Headline concert",
  startAt: "2027-05-01T19:30:00Z",
  endAt: "2027-05-01T22:30:00Z",
  status,
  artistId: 7,
  artistName: "The Comets",
  venueId: 9,
  venueName: "Atlas Hall",
  city: "Austin",
});

describe("centralized API client with MSW", () => {
  it("lists all events", async () =>
    expect((await api.events({})).length).toBeGreaterThan(5));
  it("filters events by text", async () =>
    expect(
      (await api.events({ query: "neon" })).map((event) => event.id),
    ).toEqual(["evt-neon"]));
  it("gets one event", async () =>
    expect((await api.event("evt-neon")).title).toBe(
      "Neon Skyline World Tour",
    ));
  it("lists ticket tiers", async () =>
    expect(await api.tiers()).toHaveLength(3));
  it("filters venues by city", async () =>
    expect(
      (await api.venues({ location: "Montreal, QC" })).every(
        (venue) => venue.city === "Montreal",
      ),
    ).toBe(true));
  it("gets one venue", async () =>
    expect((await api.venue("ven-aurora")).capacity).toBe(1200));
  it("filters artists by genre", async () =>
    expect((await api.artists({ genre: "Jazz" }))[0].name).toBe(
      "Marlowe Quartet",
    ));
  it("gets one artist", async () =>
    expect((await api.artist("art-echoes")).followers).toBe(248000));
  it("logs in every seeded role", async () => {
    for (const role of ["CUSTOMER", "ARTIST", "VENUE"] as const)
      expect(
        (
          await api.login({
            email: userByRole[role].email,
            password: demoPassword,
            role,
          })
        ).role,
      ).toBe(role);
  });
  it("rejects invalid credentials", async () =>
    await expect(
      api.login({
        email: "bad@example.com",
        password: "wrong",
        role: "CUSTOMER",
      }),
    ).rejects.toThrow("Invalid demo credentials"));
  it("registers a new user", async () =>
    expect(
      (
        await api.register({
          firstName: "Sam",
          lastName: "River",
          email: "sam@example.com",
          password: demoPassword,
          confirmPassword: demoPassword,
          role: "ARTIST",
        })
      ).displayName,
    ).toBe("Sam River"));
  it("creates venue availability", async () =>
    expect(
      (
        await api.createSlot({
          venueId: "ven-aurora",
          date: "2026-09-30",
          start: "6:00 PM",
          end: "9:00 PM",
        })
      ).status,
    ).toBe("OPEN"));
  it("requests an open slot", async () =>
    expect(
      (
        await api.requestBooking({
          slotId: "slot-1",
          artistName: "The Midnight Echoes",
        })
      ).status,
    ).toBe("PENDING"));
  it("creates idempotent checkout orders", async () => {
    const first = await api.checkout(sampleCheckout, "same-key");
    const second = await api.checkout(sampleCheckout, "same-key");
    expect(first.id).toBe(second.id);
    expect(first.status).toBe("CONFIRMED");
  });
  it("creates and confirms USDC then returns analytics", async () => {
    const pending = await api.checkout(
      { ...sampleCheckout, method: "USDC" },
      "usdc-key",
    );
    expect(pending.status).toBe("PENDING");
    expect((await api.paymentStatus(pending.id)).status).toBe("CONFIRMED");
    expect((await api.dashboard()).revenue).toHaveLength(6);
  });
});

describe("Spring REST response adapters", () => {
  it("keeps numeric event IDs and lifecycle status route-safe", () => {
    const event = mapSpringEventForUi(springEvent("PENDING"));
    expect(event).toMatchObject({
      id: "42",
      artistId: "7",
      venueId: "9",
      status: "PENDING",
    });
  });

  it("enriches catalog prices and genres from tiers and artists", () => {
    const events = mapEventCatalogForUi(
      [springEvent()],
      new Map([
        [
          "42",
          [
            {
              id: "tier-a",
              name: "Reserved",
              description: "",
              price: 89,
              inventory: 10,
              color: "#7c3aed",
            },
            {
              id: "tier-b",
              name: "General Admission",
              description: "",
              price: 37,
              inventory: 100,
              color: "#7c3aed",
            },
          ],
        ],
      ]),
      [
        {
          id: 7,
          accountId: 4,
          stageName: "The Comets",
          genre: "Indie Rock",
          bio: "Anthemic guitars",
        },
      ],
    );
    expect(events[0]).toMatchObject({
      priceFrom: 37,
      genre: "Indie Rock",
      tierIds: ["tier-a", "tier-b"],
    });
  });

  it("maps complete Venue profile and publication state", () => {
    expect(
      mapSpringVenueForUi({
        id: 9,
        accountId: 3,
        name: "Atlas Hall",
        address: "100 Market Street",
        city: "Austin",
        capacity: 1200,
        description: "Historic downtown hall",
        published: false,
      }),
    ).toMatchObject({
      id: "9",
      published: false,
    });
  });

  it("uses event IDs and artist names for Venue booking decisions", () => {
    expect(mapSpringBookingForUi(springEvent("PENDING"))).toMatchObject({
      id: "42",
      eventId: "42",
      venueId: "9",
      artist: "The Comets",
      status: "PENDING",
      title: "Comets Homecoming",
    });
  });

  it("maps slot booking metadata without confusing slot and event IDs", () => {
    expect(
      mapSpringSlotForUi({
        id: 12,
        venueId: 9,
        venueName: "Atlas Hall",
        startAt: "2027-05-01T19:00:00Z",
        endAt: "2027-05-01T23:00:00Z",
        status: "BOOKED",
        eventId: 42,
        artistId: 7,
        artistName: "The Comets",
        bookingStatus: "PENDING",
      }),
    ).toMatchObject({
      id: "12",
      eventId: "42",
      artist: "The Comets",
      status: "PENDING",
    });
  });

  it.each([
    ["PENDING", "PENDING"],
    ["CONFIRMED", "CONFIRMED"],
    ["REJECTED", "REJECTED"],
    ["CANCELLED", "CANCELLED"],
  ])("maps %s booking lifecycle responses", (source, expected) => {
    expect(mapSpringBookingForUi(springEvent(source)).status).toBe(expected);
  });
});
