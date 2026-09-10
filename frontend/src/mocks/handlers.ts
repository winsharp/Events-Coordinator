import { delay, http, HttpResponse, type JsonBodyType } from "msw";
import type {
  AuthPayload,
  BookingPayload,
  CheckoutPayload,
  CreateSlotPayload,
  RegisterPayload,
  Role,
  SearchFilters,
} from "../types";
import { mockLatency } from "../types";
import { fixtureService } from "./db";

const ok = async <T extends JsonBodyType>(data: T, status = 200) => {
  await delay(mockLatency);
  return HttpResponse.json(data, { status });
};
const notFound = (entity: string) =>
  HttpResponse.json({ message: `${entity} not found` }, { status: 404 });
const filtersFrom = (url: URL): SearchFilters => ({
  query: url.searchParams.get("query") ?? "",
  genre: url.searchParams.get("genre") ?? "",
  location: url.searchParams.get("location") ?? "",
});

export const handlers = [
  http.get("*/events", ({ request }) =>
    ok(fixtureService.events(filtersFrom(new URL(request.url)))),
  ),
  http.get("*/events/:id", ({ params }) =>
    fixtureService.event(String(params.id))
      ? ok(fixtureService.event(String(params.id)))
      : notFound("Event"),
  ),
  http.get("*/tiers", () => ok(fixtureService.tiers())),
  http.get("*/venues", ({ request }) =>
    ok(fixtureService.venues(filtersFrom(new URL(request.url)))),
  ),
  http.get("*/venues/me", () => ok(fixtureService.myVenue())),
  http.get("*/venues/:id", ({ params }) =>
    fixtureService.venue(String(params.id))
      ? ok(fixtureService.venue(String(params.id)))
      : notFound("Venue"),
  ),
  http.get("*/artists", ({ request }) =>
    ok(fixtureService.artists(filtersFrom(new URL(request.url)))),
  ),
  http.get("*/artists/me", () => ok(fixtureService.myArtist())),
  http.get("*/artist/events", () => ok(fixtureService.artistEvents())),
  http.get("*/artists/:id", ({ params }) =>
    fixtureService.artist(String(params.id))
      ? ok(fixtureService.artist(String(params.id)))
      : notFound("Artist"),
  ),
  http.post("*/auth/login", async ({ request }) => {
    const user = fixtureService.login((await request.json()) as AuthPayload);
    return user
      ? ok(user)
      : HttpResponse.json(
          { message: "Invalid demo credentials for the selected role" },
          { status: 401 },
        );
  }),
  http.post("*/auth/register", async ({ request }) =>
    ok(fixtureService.register((await request.json()) as RegisterPayload), 201),
  ),
  http.get("*/slots", ({ request }) =>
    ok(
      fixtureService.slots(
        new URL(request.url).searchParams.get("venueId") ?? undefined,
      ),
    ),
  ),
  http.get("*/venue/slots", () =>
    ok(fixtureService.slots(fixtureService.myVenue()?.id)),
  ),
  http.get("*/venue/bookings", () => ok(fixtureService.venueBookings())),
  http.post("*/slots", async ({ request }) =>
    ok(
      fixtureService.createSlot((await request.json()) as CreateSlotPayload),
      201,
    ),
  ),
  http.post("*/bookings", async ({ request }) => {
    const booking = fixtureService.requestBooking(
      (await request.json()) as BookingPayload,
    );
    return booking
      ? ok(booking, 201)
      : HttpResponse.json(
          { message: "This slot is no longer available" },
          { status: 409 },
        );
  }),
  http.patch("*/bookings/:id", async ({ params, request }) => {
    const body = (await request.json()) as { approved: boolean };
    const booking = fixtureService.resolveBooking(
      String(params.id),
      body.approved,
    );
    return booking ? ok(booking) : notFound("Booking");
  }),
  http.get("*/orders", () => ok(fixtureService.orders())),
  http.post("*/checkout", async ({ request }) => {
    const key = request.headers.get("Idempotency-Key") || "checkout-default";
    return ok(
      fixtureService.checkout((await request.json()) as CheckoutPayload, key),
      201,
    );
  }),
  http.get("*/payments/:id", ({ params }) => {
    const order = fixtureService.confirmPayment(String(params.id));
    return order ? ok(order) : notFound("Payment");
  }),
  http.get("*/dashboard", () => ok(fixtureService.dashboard())),
  http.patch("*/profiles/venue-details", async ({ request }) => {
    const venue = fixtureService.saveVenueProfile(
      (await request.json()) as Record<string, unknown>,
    );
    return venue ? ok(venue) : notFound("Venue profile");
  }),
  http.patch("*/profiles/:role", async ({ params, request }) => {
    const role = String(params.role).toUpperCase() as Role;
    const user = fixtureService.saveProfile(
      role,
      (await request.json()) as Record<string, unknown>,
    );
    return user ? ok(user) : notFound("Profile");
  }),
];
