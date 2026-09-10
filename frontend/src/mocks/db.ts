import type {
  AuthPayload,
  BookingPayload,
  CheckoutPayload,
  CreateSlotPayload,
  FixtureDatabase,
  Order,
  RegisterPayload,
  Role,
  SearchFilters,
  User,
} from "../types";
import {
  dashboardStats,
  cloneFixtures,
  demoCredentials,
  demoPassword,
} from "../types";
import { filterEvents, orderNumber, randomId } from "../lib/utils";

let database: FixtureDatabase = cloneFixtures();
const checkoutByKey = new Map<string, Order>();

export const resetDatabase = () => {
  database = cloneFixtures();
  checkoutByKey.clear();
};

export const getDatabase = () => database;

export const fixtureService = {
  events: (filters: SearchFilters = {}) =>
    filterEvents(database.events, filters),
  event: (id: string) => database.events.find((event) => event.id === id),
  tiers: () => database.tiers,
  venues: (filters: SearchFilters = {}) =>
    database.venues.filter((venue) => {
      const query = (filters.query ?? "").toLowerCase();
      const location = `${venue.city}, ${venue.region}`;
      return (
        `${venue.name} ${venue.city} ${venue.genres.join(" ")}`
          .toLowerCase()
          .includes(query) &&
        (!filters.location ||
          filters.location === "All locations" ||
          filters.location === location) &&
        (!filters.genre ||
          filters.genre === "All genres" ||
          venue.genres.includes(filters.genre))
      );
    }),
  venue: (id: string) => database.venues.find((venue) => venue.id === id),
  artists: (filters: SearchFilters = {}) =>
    database.artists.filter((artist) => {
      const query = (filters.query ?? "").toLowerCase();
      return (
        `${artist.name} ${artist.city} ${artist.genre}`
          .toLowerCase()
          .includes(query) &&
        (!filters.genre ||
          filters.genre === "All genres" ||
          filters.genre === artist.genre) &&
        (!filters.location ||
          filters.location === "All locations" ||
          filters.location.toLowerCase().startsWith(artist.city.toLowerCase()))
      );
    }),
  artist: (id: string) => database.artists.find((artist) => artist.id === id),
  myArtist: () => {
    const account = database.users.find((user) => user.role === "ARTIST");
    return (
      database.artists.find((artist) => artist.name === account?.displayName) ??
      database.artists[0]
    );
  },
  myVenue: () => {
    const account = database.users.find((user) => user.role === "VENUE");
    return (
      database.venues.find((venue) => venue.name === account?.displayName) ??
      database.venues[0]
    );
  },
  artistEvents: () => {
    const artist = fixtureService.myArtist();
    if (!artist) return [];
    const requests = database.slots
      .filter(
        (slot) => slot.artist === artist.name && slot.status === "PENDING",
      )
      .map((slot) => ({
        id: slot.eventId ?? `request-${slot.id}`,
        title: slot.title ?? `${artist.name} Live`,
        artistId: artist.id,
        artist: artist.name,
        venueId: slot.venueId,
        venue:
          database.venues.find((venue) => venue.id === slot.venueId)?.name ??
          "Venue",
        city:
          database.venues.find((venue) => venue.id === slot.venueId)?.city ??
          "",
        region:
          database.venues.find((venue) => venue.id === slot.venueId)?.region ??
          "",
        date: slot.date,
        time: slot.start,
        genre: artist.genre,
        priceFrom: 0,
        description: "Awaiting venue approval.",
        status: "PENDING" as const,
        tierIds: [],
      }));
    return [
      ...database.events
        .filter((event) => event.artistId === artist.id)
        .map((event) => ({ ...event, status: "CONFIRMED" as const })),
      ...requests,
    ];
  },
  venueBookings: () => {
    const venue = fixtureService.myVenue();
    return database.slots.filter(
      (slot) => slot.venueId === venue?.id && slot.status !== "OPEN",
    );
  },
  login: (payload: AuthPayload) => {
    const role = payload.role as Role;
    if (
      demoCredentials[role] !== payload.email ||
      payload.password !== demoPassword
    )
      return undefined;
    return database.users.find((user) => user.role === role);
  },
  register: (payload: RegisterPayload): User => {
    const user: User = {
      id: randomId("usr"),
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      role: payload.role,
      displayName: `${payload.firstName} ${payload.lastName}`,
    };
    database.users.push(user);
    return user;
  },
  slots: (venueId?: string) =>
    database.slots.filter((slot) => !venueId || slot.venueId === venueId),
  createSlot: (payload: CreateSlotPayload) => {
    const slot = { id: randomId("slot"), ...payload, status: "OPEN" as const };
    database.slots.push(slot);
    return slot;
  },
  requestBooking: (payload: BookingPayload) => {
    const slot = database.slots.find(
      (candidate) => candidate.id === payload.slotId,
    );
    if (!slot || slot.status !== "OPEN") return undefined;
    slot.status = "PENDING";
    slot.artist = payload.artistName;
    slot.eventId = randomId("event");
    slot.title = `${payload.artistName} Live`;
    return slot;
  },
  resolveBooking: (id: string, approved: boolean) => {
    const slot = database.slots.find((candidate) => candidate.id === id);
    if (!slot || slot.status !== "PENDING") return undefined;
    if (approved) {
      slot.status = "CONFIRMED";
      const artist = database.artists.find(
        (candidate) => candidate.name === slot.artist,
      );
      const venue = database.venues.find(
        (candidate) => candidate.id === slot.venueId,
      );
      if (artist && venue) {
        database.events.push({
          id: slot.eventId ?? randomId("event"),
          title: slot.title ?? `${artist.name} Live`,
          artistId: artist.id,
          artist: artist.name,
          venueId: venue.id,
          venue: venue.name,
          city: venue.city,
          region: venue.region,
          date: slot.date,
          time: slot.start,
          genre: artist.genre,
          priceFrom: 75,
          description: "A newly confirmed artist booking.",
          status: "CONFIRMED",
          tierIds: [database.tiers[0]?.id].filter(Boolean),
        });
      }
    } else {
      slot.status = "OPEN";
      delete slot.artist;
      delete slot.eventId;
      delete slot.title;
    }
    return slot;
  },
  saveVenueProfile: (values: Record<string, unknown>) => {
    const venue = fixtureService.myVenue();
    if (!venue) return undefined;
    if (typeof values.displayName === "string") venue.name = values.displayName;
    if (typeof values.city === "string") venue.city = values.city;
    if (typeof values.address === "string") venue.address = values.address;
    if (typeof values.capacity === "number") venue.capacity = values.capacity;
    if (typeof values.description === "string")
      venue.description = values.description;
    if (Array.isArray(values.genres)) venue.genres = values.genres as string[];
    if (Array.isArray(values.amenities))
      venue.amenities = values.amenities as string[];
    if (typeof values.email === "string") venue.contactEmail = values.email;
    if (typeof values.website === "string") venue.website = values.website;
    if (typeof values.published === "boolean")
      venue.published = values.published;
    return venue;
  },
  orders: () => database.orders,
  checkout: (payload: CheckoutPayload, key: string) => {
    const existing = checkoutByKey.get(key);
    if (existing) return existing;
    const order: Order = {
      ...payload,
      id: orderNumber(),
      userId: "usr-customer",
      status: payload.method === "USDC" ? "PENDING" : "CONFIRMED",
      createdAt: new Date().toISOString(),
    };
    checkoutByKey.set(key, order);
    database.orders.unshift(order);
    return order;
  },
  confirmPayment: (id: string) => {
    const order = database.orders.find((candidate) => candidate.id === id);
    if (order) order.status = "CONFIRMED";
    return order;
  },
  dashboard: () => dashboardStats,
  saveProfile: (role: Role, values: Record<string, unknown>) => {
    const user = database.users.find((candidate) => candidate.role === role);
    if (!user) return undefined;
    if (typeof values.displayName === "string")
      user.displayName = values.displayName;
    if (typeof values.email === "string") user.email = values.email;
    return user;
  },
};

export default fixtureService;
