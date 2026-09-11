import axios from "axios";
import type {
  Artist,
  AuthPayload,
  AvailabilitySlot,
  BookingPayload,
  CheckoutPayload,
  CreateSlotPayload,
  DashboardStats,
  Event,
  Order,
  RegisterPayload,
  Role,
  SearchFilters,
  TicketTier,
  User,
  Venue,
} from "../types";
import { PRODUCTION_API_URL, USE_MOCKS, dashboardStats } from "../types";
import { filterEvents, normalizeQuery, queryString } from "../lib/utils";

const TOKEN_STORAGE_KEY = "ticketgenie-access-token";
const usesStandaloneApi = USE_MOCKS || import.meta.env.MODE === "test";

export const apiClient = axios.create({
  baseURL: PRODUCTION_API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: { Accept: "application/json", "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const body = error.response?.data;
    const message =
      body?.detail || body?.message || error.message || "Request failed";
    return Promise.reject(new Error(message));
  },
);

const unwrap = async <T>(request: Promise<{ data: T }>): Promise<T> =>
  (await request).data;
const asId = (value: string | number | null | undefined) => String(value ?? "");
const localDate = (value: string) => value.slice(0, 10);
const localTime = (value: string) =>
  new Date(value).toLocaleTimeString("en-CA", {
    hour: "numeric",
    minute: "2-digit",
  });
const regionByCity: Record<string, string> = {
  Austin: "TX",
  Seattle: "WA",
  Portland: "OR",
  Nashville: "TN",
  Chicago: "IL",
  Denver: "CO",
};
const regionFor = (city: string) => regionByCity[city] ?? "";

interface SpringAccount {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

interface SpringAuthResponse {
  token: string;
  account: SpringAccount;
}

export interface SpringEvent {
  id: number;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  status: string;
  artistId: number;
  artistName: string;
  venueId: number;
  venueName: string;
  city: string;
}

export interface SpringTier {
  id: number;
  eventId: number;
  name: string;
  price: number;
  totalQuantity: number;
  availableQuantity: number;
}

export interface SpringVenue {
  id: number;
  accountId: number;
  username: string;
  name: string;
  address: string;
  city: string;
  capacity: number;
  description: string;
  contactEmail?: string;
  website?: string;
  genres?: string[];
  amenities?: string[];
  published?: boolean;
}

export interface SpringArtist {
  id: number;
  accountId: number;
  username: string;
  stageName: string;
  genre: string;
  bio: string;
}

export interface SpringSlot {
  id: number;
  venueId: number;
  venueName: string;
  startAt: string;
  endAt: string;
  status: "OPEN" | "BOOKED" | "CANCELLED";
  eventId?: number;
  artistId?: number;
  artistName?: string;
  bookingStatus?: "PENDING" | "CONFIRMED" | "CANCELLED" | "REJECTED";
}

interface SpringReservation {
  id: number;
  eventId: number;
  eventTitle: string;
  tierId: number;
  tierName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  status: string;
  expiresAt: string;
}

interface SpringOrder {
  id: number;
  reservationId: number;
  paymentMethod: "CARD" | "PAYPAL" | "USDC";
  status: "PENDING" | "PAID" | "CANCELLED";
  total: number;
  createdAt: string;
  paidAt?: string;
}

interface SpringTicket {
  id: number;
  orderId: number;
  eventId: number;
  eventTitle: string;
  venueName: string;
  eventStart: string;
  tierId: number;
  tierName: string;
  seatLabel?: string;
  ownerId: number;
  ownerUsername: string;
  status: string;
}

const accountToUser = (account: SpringAccount): User => ({
  id: asId(account.id),
  firstName: account.firstName,
  lastName: account.lastName,
  email: account.email,
  role: account.role,
  displayName: `${account.firstName} ${account.lastName}`.trim(),
});

export const mapSpringEventForUi = (event: SpringEvent): Event => ({
  id: asId(event.id),
  title: event.title,
  artistId: asId(event.artistId),
  artist: event.artistName,
  venueId: asId(event.venueId),
  venue: event.venueName,
  city: event.city,
  region: regionFor(event.city),
  date: localDate(event.startAt),
  time: localTime(event.startAt),
  genre: "Live",
  priceFrom: 0,
  description: event.description,
  status: ["PENDING", "CONFIRMED", "CANCELLED", "REJECTED"].includes(
    event.status,
  )
    ? (event.status as Event["status"])
    : "CONFIRMED",
  tierIds: [],
});

const tierToUi = (tier: SpringTier): TicketTier => ({
  id: asId(tier.id),
  name: tier.name,
  description: `${tier.availableQuantity} of ${tier.totalQuantity} tickets available`,
  price: Number(tier.price),
  inventory: tier.availableQuantity,
  color: "#7c3aed",
});

export const mapSpringVenueForUi = (venue: SpringVenue): Venue => ({
  id: asId(venue.id),
  name: venue.name,
  city: venue.city,
  region: regionFor(venue.city),
  address: venue.address,
  capacity: venue.capacity,
  description: venue.description,
  genres: venue.genres?.length ? venue.genres : ["Live"],
  amenities: venue.amenities?.length
    ? venue.amenities
    : ["Accessible venue information"],
  contactEmail: venue.contactEmail,
  website: venue.website,
  published: venue.published ?? true,
});

export const mapSpringArtistForUi = (artist: SpringArtist): Artist => ({
  id: asId(artist.id),
  name: artist.stageName,
  genre: artist.genre,
  city: "",
  followers: 0,
  bio: artist.bio,
});

export const mapSpringSlotForUi = (slot: SpringSlot): AvailabilitySlot => ({
  id: asId(slot.id),
  venueId: asId(slot.venueId),
  date: localDate(slot.startAt),
  start: localTime(slot.startAt),
  end: localTime(slot.endAt),
  status:
    slot.bookingStatus === "PENDING"
      ? "PENDING"
      : slot.bookingStatus === "REJECTED"
        ? "REJECTED"
        : slot.bookingStatus === "CANCELLED" || slot.status === "CANCELLED"
          ? "CANCELLED"
          : slot.status === "BOOKED"
            ? "CONFIRMED"
            : "OPEN",
  artist: slot.artistName,
  eventId:
    slot.eventId === null || slot.eventId === undefined
      ? undefined
      : asId(slot.eventId),
});

export const mapSpringBookingForUi = (
  event: SpringEvent,
): AvailabilitySlot => ({
  id: asId(event.id),
  eventId: asId(event.id),
  venueId: asId(event.venueId),
  date: localDate(event.startAt),
  start: localTime(event.startAt),
  end: localTime(event.endAt),
  status:
    event.status === "PENDING"
      ? "PENDING"
      : event.status === "REJECTED"
        ? "REJECTED"
        : event.status === "CANCELLED"
          ? "CANCELLED"
          : "CONFIRMED",
  artist: event.artistName,
  title: event.title,
});

export const mapEventCatalogForUi = (
  source: SpringEvent[],
  tiersByEvent: Map<string, TicketTier[]>,
  artists: SpringArtist[] = [],
): Event[] => {
  const artistById = new Map(
    artists.map((artist) => [asId(artist.id), artist]),
  );
  return source.map((item) => {
    const event = mapSpringEventForUi(item);
    const tiers = tiersByEvent.get(event.id) ?? [];
    const artist = artistById.get(event.artistId);
    return {
      ...event,
      genre: artist?.genre || event.genre,
      tierIds: tiers.map((tier) => tier.id),
      priceFrom: tiers.length
        ? Math.min(...tiers.map((tier) => Number(tier.price)))
        : event.priceFrom,
    };
  });
};

const orderStatus = (status: SpringOrder["status"]): Order["status"] =>
  status === "PAID" ? "CONFIRMED" : status === "PENDING" ? "PENDING" : "FAILED";

const storeAuth = (response: SpringAuthResponse) => {
  localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
  return accountToUser(response.account);
};

export const clearAuthToken = () => localStorage.removeItem(TOKEN_STORAGE_KEY);

const springEvents = async (filters: SearchFilters = {}) => {
  const [data, artists] = await Promise.all([
    unwrap<SpringEvent[]>(apiClient.get("/events")),
    unwrap<SpringArtist[]>(apiClient.get("/artists")),
  ]);
  const tierLists = await Promise.all(
    data.map((event) => springTiers(asId(event.id))),
  );
  const tiersByEvent = new Map(
    data.map((event, index) => [asId(event.id), tierLists[index]]),
  );
  return filterEvents(
    mapEventCatalogForUi(data, tiersByEvent, artists),
    filters,
  );
};

const springTiers = async (eventId?: string) => {
  if (!eventId) return [];
  const data = await unwrap<SpringTier[]>(
    apiClient.get(`/events/${eventId}/tiers`),
  );
  return data.map(tierToUi);
};

const toInstant = (date: string, time: string) => {
  const normalized = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!normalized) return new Date(`${date}T${time}`).toISOString();
  let hour = Number(normalized[1]) % 12;
  if (normalized[3].toUpperCase() === "PM") hour += 12;
  return new Date(
    `${date}T${String(hour).padStart(2, "0")}:${normalized[2]}:00`,
  ).toISOString();
};

const productionCheckout = async (
  payload: CheckoutPayload,
  idempotencyKey: string,
): Promise<Order> => {
  const tiers = await unwrap<SpringTier[]>(
    apiClient.get(`/events/${payload.eventId}/tiers`),
  );
  const tier =
    tiers.find((candidate) => candidate.name === payload.tierName) ?? tiers[0];
  if (!tier) throw new Error("No purchasable ticket tier is available");
  const reservation = await unwrap<SpringReservation>(
    apiClient.post("/reservations", {
      tierId: tier.id,
      quantity: payload.quantity,
    }),
  );
  const result = await unwrap<SpringOrder>(
    apiClient.post("/checkout", {
      reservationId: reservation.id,
      paymentMethod: payload.method,
      idempotencyKey,
    }),
  );
  return {
    ...payload,
    id: asId(result.id),
    userId: "",
    method: result.paymentMethod,
    status: orderStatus(result.status),
    createdAt: result.createdAt,
    total: Number(result.total),
  };
};

const productionOrders = async (): Promise<Order[]> => {
  const [orders, tickets] = await Promise.all([
    unwrap<SpringOrder[]>(apiClient.get("/orders")),
    unwrap<SpringTicket[]>(apiClient.get("/tickets")),
  ]);
  return orders.map((order) => {
    const related = tickets.filter((ticket) => ticket.orderId === order.id);
    const first = related[0];
    return {
      id: asId(order.id),
      userId: first ? asId(first.ownerId) : "",
      eventId: first ? asId(first.eventId) : "",
      method: order.paymentMethod,
      status: orderStatus(order.status),
      quantity: related.length || 1,
      subtotal: Number(order.total),
      fees: 0,
      total: Number(order.total),
      createdAt: order.createdAt,
      tierName: first?.tierName ?? "Ticket order",
      seats: related
        .map((ticket) => ticket.seatLabel)
        .filter(Boolean) as string[],
      billingEmail: "",
    };
  });
};

export const api = {
  events: (filters: SearchFilters = {}) =>
    usesStandaloneApi
      ? unwrap<Event[]>(apiClient.get(`/events?${queryString(filters)}`))
      : springEvents(filters),
  event: async (id: string) => {
    if (usesStandaloneApi) return unwrap<Event>(apiClient.get(`/events/${id}`));
    const [source, tiers, artists] = await Promise.all([
      unwrap<SpringEvent>(apiClient.get(`/events/${id}`)),
      springTiers(id),
      unwrap<SpringArtist[]>(apiClient.get("/artists")),
    ]);
    return mapEventCatalogForUi([source], new Map([[id, tiers]]), artists)[0];
  },
  tiers: (eventId?: string) =>
    usesStandaloneApi
      ? unwrap<TicketTier[]>(apiClient.get("/tiers"))
      : springTiers(eventId),
  addTier: async (
    eventId: string,
    values: { name: string; price: number; quantity: number },
  ) => {
    if (usesStandaloneApi)
      return unwrap<TicketTier>(
        apiClient.post(`/events/${eventId}/tiers`, values),
      );
    const tier = await unwrap<SpringTier>(
      apiClient.post(`/events/${eventId}/tiers`, values),
    );
    return tierToUi(tier);
  },
  venues: async (filters: SearchFilters = {}) => {
    if (usesStandaloneApi)
      return unwrap<Venue[]>(apiClient.get(`/venues?${queryString(filters)}`));
    const [data, events, artists] = await Promise.all([
      unwrap<SpringVenue[]>(apiClient.get("/venues")),
      unwrap<SpringEvent[]>(apiClient.get("/events")),
      unwrap<SpringArtist[]>(apiClient.get("/artists")),
    ]);
    const genresByArtist = new Map(
      artists.map((artist) => [asId(artist.id), artist.genre]),
    );
    return data
      .map((source) => {
        const venue = mapSpringVenueForUi(source);
        const genres = Array.from(
          new Set(
            events
              .filter((event) => asId(event.venueId) === venue.id)
              .map((event) => genresByArtist.get(asId(event.artistId)))
              .filter(Boolean) as string[],
          ),
        );
        return { ...venue, genres: genres.length ? genres : venue.genres };
      })
      .filter((venue) => {
        const query = normalizeQuery(filters.query);
        const location = normalizeQuery(filters.location).split(",")[0];
        return (
          `${venue.name} ${venue.city} ${venue.genres.join(" ")}`
            .toLowerCase()
            .includes(query) &&
          (!location ||
            filters.location === "All locations" ||
            normalizeQuery(venue.city).includes(location)) &&
          (!filters.genre ||
            filters.genre === "All genres" ||
            venue.genres.includes(filters.genre))
        );
      });
  },
  venue: async (id: string) =>
    usesStandaloneApi
      ? unwrap<Venue>(apiClient.get(`/venues/${id}`))
      : mapSpringVenueForUi(
          await unwrap<SpringVenue>(apiClient.get(`/venues/${id}`)),
        ),
  artists: async (filters: SearchFilters = {}) => {
    if (usesStandaloneApi)
      return unwrap<Artist[]>(
        apiClient.get(`/artists?${queryString(filters)}`),
      );
    const [data, events] = await Promise.all([
      unwrap<SpringArtist[]>(apiClient.get("/artists")),
      unwrap<SpringEvent[]>(apiClient.get("/events")),
    ]);
    return data
      .map((source) => {
        const artist = mapSpringArtistForUi(source);
        const event = events.find(
          (candidate) => asId(candidate.artistId) === artist.id,
        );
        return { ...artist, city: event?.city ?? artist.city };
      })
      .filter((artist) => {
        const query = normalizeQuery(filters.query);
        const location = normalizeQuery(filters.location).split(",")[0];
        return (
          `${artist.name} ${artist.city} ${artist.genre}`
            .toLowerCase()
            .includes(query) &&
          (!filters.genre ||
            filters.genre === "All genres" ||
            artist.genre === filters.genre) &&
          (!location ||
            filters.location === "All locations" ||
            normalizeQuery(artist.city).includes(location))
        );
      });
  },
  artist: async (id: string) =>
    usesStandaloneApi
      ? unwrap<Artist>(apiClient.get(`/artists/${id}`))
      : mapSpringArtistForUi(
          await unwrap<SpringArtist>(apiClient.get(`/artists/${id}`)),
        ),
  myArtist: async () =>
    usesStandaloneApi
      ? unwrap<Artist>(apiClient.get("/artists/me"))
      : mapSpringArtistForUi(
          await unwrap<SpringArtist>(apiClient.get("/artists/me")),
        ),
  myVenue: async () =>
    usesStandaloneApi
      ? unwrap<Venue>(apiClient.get("/venues/me"))
      : mapSpringVenueForUi(
          await unwrap<SpringVenue>(apiClient.get("/venues/me")),
        ),
  artistEvents: async () => {
    if (usesStandaloneApi)
      return unwrap<Event[]>(apiClient.get("/artist/events"));
    const events = await unwrap<SpringEvent[]>(apiClient.get("/artist/events"));
    const tierLists = await Promise.all(
      events.map((event) =>
        event.status === "CONFIRMED" ? springTiers(asId(event.id)) : [],
      ),
    );
    return mapEventCatalogForUi(
      events,
      new Map(events.map((event, index) => [asId(event.id), tierLists[index]])),
    );
  },
  venueBookings: async () =>
    usesStandaloneApi
      ? unwrap<AvailabilitySlot[]>(apiClient.get("/venue/bookings"))
      : (await unwrap<SpringEvent[]>(apiClient.get("/venue/bookings"))).map(
          mapSpringBookingForUi,
        ),
  updateBooking: async (id: string, approved: boolean) => {
    if (usesStandaloneApi)
      return unwrap<AvailabilitySlot>(
        apiClient.patch(`/bookings/${id}`, { approved }),
      );
    const action = approved ? "approve" : "reject";
    return mapSpringBookingForUi(
      await unwrap<SpringEvent>(
        apiClient.patch(`/venue/bookings/${id}/${action}`),
      ),
    );
  },
  saveArtistProfile: async (values: {
    stageName: string;
    genre: string;
    bio: string;
  }) => {
    if (usesStandaloneApi)
      return unwrap<Artist>(
        apiClient.patch("/profiles/artist-details", values),
      );
    const result = await unwrap<SpringArtist>(
      apiClient.put("/artists/me", values),
    );
    return mapSpringArtistForUi(result);
  },
  saveVenueProfile: async (values: Record<string, unknown>) => {
    if (usesStandaloneApi)
      return unwrap<Venue>(apiClient.patch("/profiles/venue-details", values));
    const result = await unwrap<SpringVenue>(
      apiClient.put("/venues/me", {
        name: String(values.displayName ?? ""),
        address: String(values.address ?? ""),
        city: String(values.city ?? ""),
        capacity: Number(values.capacity ?? 1),
        description: String(values.description ?? ""),
        contactEmail: String(values.email ?? ""),
        website: String(values.website ?? ""),
        genres: Array.isArray(values.genres) ? values.genres : [],
        amenities: Array.isArray(values.amenities) ? values.amenities : [],
        published: Boolean(values.published),
      }),
    );
    return {
      ...mapSpringVenueForUi(result),
      genres: Array.isArray(values.genres)
        ? (values.genres as string[])
        : ["Live"],
      amenities: Array.isArray(values.amenities)
        ? (values.amenities as string[])
        : [],
      contactEmail: result.contactEmail ?? String(values.email ?? ""),
      website: result.website ?? String(values.website ?? ""),
      published: result.published ?? Boolean(values.published),
    };
  },
  login: async (payload: AuthPayload) => {
    if (usesStandaloneApi)
      return unwrap<User>(apiClient.post("/auth/login", payload));
    return storeAuth(
      await unwrap<SpringAuthResponse>(
        apiClient.post("/auth/login", {
          username: payload.email,
          password: payload.password,
        }),
      ),
    );
  },
  register: async (payload: RegisterPayload) => {
    if (usesStandaloneApi)
      return unwrap<User>(apiClient.post("/auth/register", payload));
    return storeAuth(
      await unwrap<SpringAuthResponse>(
        apiClient.post("/auth/register", {
          username: payload.username,
          email: payload.email,
          password: payload.password,
          role: payload.role,
          firstName: payload.firstName,
          lastName: payload.lastName,
        }),
      ),
    );
  },
  slots: async (venueId?: string) => {
    if (usesStandaloneApi)
      return unwrap<AvailabilitySlot[]>(
        apiClient.get(`/slots${venueId ? `?venueId=${venueId}` : ""}`),
      );
    if (venueId) {
      const data = await unwrap<SpringSlot[]>(
        apiClient.get(`/venues/${venueId}/slots`),
      );
      return data.map(mapSpringSlotForUi);
    }
    const venues = await unwrap<SpringVenue[]>(apiClient.get("/venues"));
    const lists = await Promise.all(
      venues.map((venue) =>
        unwrap<SpringSlot[]>(apiClient.get(`/venues/${venue.id}/slots`)),
      ),
    );
    return lists.flat().map(mapSpringSlotForUi);
  },
  mySlots: async () => {
    if (usesStandaloneApi)
      return unwrap<AvailabilitySlot[]>(apiClient.get("/venue/slots"));
    return (await unwrap<SpringSlot[]>(apiClient.get("/venue/slots"))).map(
      mapSpringSlotForUi,
    );
  },
  createSlot: async (payload: CreateSlotPayload) => {
    if (usesStandaloneApi)
      return unwrap<AvailabilitySlot>(apiClient.post("/slots", payload));
    const venue = await unwrap<SpringVenue>(apiClient.get("/venues/me"));
    const result = await unwrap<SpringSlot>(
      apiClient.post(`/venues/${venue.id}/slots`, {
        startAt: toInstant(payload.date, payload.start),
        endAt: toInstant(payload.date, payload.end),
      }),
    );
    return mapSpringSlotForUi(result);
  },
  requestBooking: async (payload: BookingPayload) => {
    if (usesStandaloneApi)
      return unwrap<AvailabilitySlot>(apiClient.post("/bookings", payload));
    const result = await unwrap<SpringEvent>(
      apiClient.post(`/artist/slots/${payload.slotId}/book`, {
        title: `${payload.artistName} Live`,
        description: "Artist booking created through TicketGenie.",
      }),
    );
    return {
      id: asId(result.id),
      venueId: asId(result.venueId),
      date: localDate(result.startAt),
      start: localTime(result.startAt),
      end: localTime(result.endAt),
      status: "PENDING",
      artist: result.artistName,
    } as AvailabilitySlot;
  },
  orders: () =>
    usesStandaloneApi
      ? unwrap<Order[]>(apiClient.get("/orders"))
      : productionOrders(),
  checkout: (payload: CheckoutPayload, idempotencyKey: string) =>
    usesStandaloneApi
      ? unwrap<Order>(
          apiClient.post("/checkout", payload, {
            headers: { "Idempotency-Key": idempotencyKey },
          }),
        )
      : productionCheckout(payload, idempotencyKey),
  paymentStatus: async (id: string) => {
    if (usesStandaloneApi)
      return unwrap<Order>(apiClient.get(`/payments/${id}`));
    const result = await unwrap<SpringOrder>(
      apiClient.get(`/orders/${id}/status`),
    );
    const existing = (await productionOrders()).find(
      (order) => order.id === id,
    );
    if (!existing) throw new Error("Order not found");
    return {
      ...existing,
      status: orderStatus(result.status),
      total: Number(result.total),
    };
  },
  dashboard: () =>
    usesStandaloneApi
      ? unwrap<DashboardStats>(apiClient.get("/dashboard"))
      : Promise.resolve(dashboardStats),
  saveProfile: async (role: Role, values: Record<string, unknown>) => {
    if (usesStandaloneApi)
      return unwrap<User>(
        apiClient.patch(`/profiles/${role.toLowerCase()}`, values),
      );
    const displayName = String(values.displayName ?? "").trim();
    const email = String(values.email ?? "").trim();
    if (role === "CUSTOMER") {
      const [firstName, ...rest] = displayName.split(/\s+/);
      return accountToUser(
        await unwrap<SpringAccount>(
          apiClient.put("/auth/me", {
            email,
            firstName: firstName || "Customer",
            lastName: rest.join(" ") || "User",
          }),
        ),
      );
    }
    if (role === "ARTIST") {
      await apiClient.put("/artists/me", {
        stageName: displayName,
        genre: Array.isArray(values.genres) ? values.genres[0] : "Live",
        bio: `Based in ${String(values.city ?? "")}`,
      });
    } else {
      const currentVenue = await unwrap<SpringVenue>(
        apiClient.get("/venues/me"),
      );
      await apiClient.put("/venues/me", {
        name: displayName,
        address: String(values.address ?? currentVenue.address),
        city: String(values.city ?? currentVenue.city),
        capacity: Number(values.capacity ?? currentVenue.capacity),
        description: String(values.description ?? currentVenue.description),
      });
    }
    const account = await unwrap<SpringAccount>(apiClient.get("/auth/me"));
    return { ...accountToUser(account), displayName };
  },
};

export type TicketGenieApi = typeof api;
export default api;
