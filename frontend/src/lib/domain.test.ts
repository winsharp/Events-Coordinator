import { describe, expect, it } from "vitest";
import {
  cardSchema,
  loginSchema,
  orderIdSchema,
  paypalSchema,
  profileSchema,
  quantitySchema,
  registerSchema,
  slotSchema,
  usdcSchema,
} from "./schemas";
import {
  average,
  calculateFees,
  calculateTotal,
  cents,
  clamp,
  emailDomain,
  filterEvents,
  formatCompactNumber,
  formatCountdown,
  formatDate,
  formatMoney,
  fromCents,
  fullName,
  hasExpired,
  holdRemaining,
  inventoryLabel,
  isFutureExpiry,
  locationOf,
  maskAddress,
  maskCard,
  normalizeQuery,
  onlyDigits,
  parseQueryString,
  percentage,
  pluralize,
  queryString,
  roleLabel,
  safeQuantity,
  shortDate,
  sortByDate,
  statusLabel,
  sum,
  toTitleCase,
  totalQuantity,
  truncate,
  unique,
} from "./utils";
import {
  allMethods,
  allRoles,
  allStatuses,
  artistById,
  artistIds,
  artists,
  bookingStatuses,
  capacities,
  checkoutExamples,
  createSeats,
  dateExamples,
  demoPassword,
  eventById,
  eventIds,
  events,
  feeExamples,
  fixtureHealth,
  fixtureTotals,
  genreCounts,
  moneyExamples,
  orderById,
  orderIds,
  orders,
  paymentMethods,
  queryExamples,
  roleHomes,
  roleOptions,
  seatPrices,
  slots,
  testMatrix,
  tierById,
  tierIds,
  userByRole,
  users,
  venueById,
  venueIds,
  venues,
} from "../types";

describe("260-case pricing, role, and discovery data matrix", () => {
  it.each(testMatrix)(
    "normalizes matrix row $id for $role and amount $amount",
    ({ id, amount, cents: expectedCents, query, role }) => {
      expect(cents(amount)).toBe(expectedCents);
      expect(fromCents(expectedCents)).toBe(amount);
      expect(allRoles).toContain(role);
      expect(roleHomes[role]).toMatch(/^\/(customer|artist|venue)$/);
      expect(filterEvents(events, { query }).length).toBeGreaterThan(0);
      expect(formatMoney(amount)).toContain(
        (Math.round(amount * 100) / 100).toFixed(2),
      );
      expect(id).toBeGreaterThan(0);
    },
  );
});

describe("authentication and checkout schemas", () => {
  it("accepts every seeded role login", () => {
    allRoles.forEach((role) =>
      expect(
        loginSchema.safeParse({
          email: userByRole[role].email,
          password: demoPassword,
          role,
        }).success,
      ).toBe(true),
    );
  });
  it("rejects malformed login email", () =>
    expect(
      loginSchema.safeParse({
        email: "broken",
        password: demoPassword,
        role: "CUSTOMER",
      }).success,
    ).toBe(false));
  it("accepts a strong registration", () =>
    expect(
      registerSchema.safeParse({
        username: "sam.river",
        firstName: "Sam",
        lastName: "River",
        email: "sam@example.com",
        password: demoPassword,
        confirmPassword: demoPassword,
        role: "ARTIST",
        terms: true,
      }).success,
    ).toBe(true));
  it("rejects mismatched registration passwords", () =>
    expect(
      registerSchema.safeParse({
        username: "sam.river",
        firstName: "Sam",
        lastName: "River",
        email: "sam@example.com",
        password: demoPassword,
        confirmPassword: "Other123!",
        role: "ARTIST",
        terms: true,
      }).success,
    ).toBe(false));
  it("accepts a valid demonstration card", () =>
    expect(
      cardSchema.safeParse({
        cardholder: "Alex Johnson",
        cardNumber: "4242 4242 4242 4242",
        expiry: "12/29",
        cvv: "123",
        billingEmail: "alex@example.com",
        terms: true,
      }).success,
    ).toBe(true));
  it("rejects invalid demonstration card details", () =>
    expect(
      cardSchema.safeParse({
        cardholder: "",
        cardNumber: "4",
        expiry: "01/20",
        cvv: "x",
        billingEmail: "bad",
        terms: false,
      }).success,
    ).toBe(false));
  it("accepts PayPal demonstration authorization", () =>
    expect(
      paypalSchema.safeParse({
        paypalEmail: "alex@example.com",
        billingEmail: "alex@example.com",
        terms: true,
      }).success,
    ).toBe(true));
  it("accepts USDC billing details", () =>
    expect(
      usdcSchema.safeParse({ billingEmail: "alex@example.com", terms: true })
        .success,
    ).toBe(true));
  it("validates profile preferences", () =>
    expect(
      profileSchema.safeParse({
        displayName: "Alex",
        email: "alex@example.com",
        city: "Toronto",
        genres: ["Electronic"],
      }).success,
    ).toBe(true));
  it("validates different slot times", () =>
    expect(
      slotSchema.safeParse({
        date: "2026-07-24",
        start: "6:00 PM",
        end: "8:30 PM",
      }).success,
    ).toBe(true));
  it("rejects equal slot times", () =>
    expect(
      slotSchema.safeParse({
        date: "2026-07-24",
        start: "6:00 PM",
        end: "6:00 PM",
      }).success,
    ).toBe(false));
  it("validates ticket quantity bounds", () => {
    expect(quantitySchema.safeParse(6).success).toBe(true);
    expect(quantitySchema.safeParse(7).success).toBe(false);
  });
  it("validates generated order IDs", () => {
    expect(orderIdSchema.safeParse("TG-10482").success).toBe(true);
    expect(orderIdSchema.safeParse("bad").success).toBe(false);
  });
});

describe("formatter and calculation matrices", () => {
  it.each(moneyExamples)("formats CAD amount %s", (amount) =>
    expect(formatMoney(amount)).toMatch(/\$|CA/),
  );
  it.each(dateExamples)("formats fixture date %s", (date) => {
    expect(formatDate(date)).toContain("2026");
    expect(shortDate(date)).not.toContain("2026");
  });
  it.each(feeExamples)("calculates non-negative fees for %s", (amount) => {
    expect(calculateFees(amount)).toBeGreaterThanOrEqual(0);
    expect(calculateTotal(amount)).toBeGreaterThanOrEqual(amount);
  });
  it.each(queryExamples)("normalizes query %s", (query) =>
    expect(normalizeQuery(` ${query} `)).toBe(query),
  );
  it("formats countdowns at key boundaries", () => {
    expect(formatCountdown(300)).toBe("05:00");
    expect(formatCountdown(59)).toBe("00:59");
    expect(formatCountdown(-2)).toBe("00:00");
  });
  it("formats compact audience numbers", () =>
    expect(formatCompactNumber(248000)).toMatch(/248K|248 k|248k/i));
  it("formats labels and masks", () => {
    expect(maskCard("4242424242424242")).toBe("•••• 4242");
    expect(maskAddress("0x7A3F92bE4c51A88D91C2")).toContain("…");
    expect(roleLabel("CUSTOMER")).toBe("Customer");
    expect(statusLabel("PENDING")).toBe("Pending");
  });
  it("builds and parses filter query strings", () => {
    const value = {
      query: "neon",
      genre: "Electronic",
      location: "Toronto, ON",
    };
    expect(parseQueryString(`?${queryString(value)}`)).toEqual(value);
  });
});

describe("fixture integrity and utility behavior", () => {
  it("has valid entity relationships", () =>
    expect(fixtureHealth.relationsValid).toBe(true));
  it("exposes complete lookup maps", () => {
    eventIds.forEach((id) => expect(eventById[id]).toBeDefined());
    venueIds.forEach((id) => expect(venueById[id]).toBeDefined());
    artistIds.forEach((id) => expect(artistById[id]).toBeDefined());
    tierIds.forEach((id) => expect(tierById[id]).toBeDefined());
    orderIds.forEach((id) => expect(orderById[id]).toBeDefined());
  });
  it("has realistic related fixture counts", () => {
    expect(fixtureTotals.events).toBe(events.length);
    expect(orders.length).toBeGreaterThan(1);
    expect(slots.some((slot) => slot.status === "CONFIRMED")).toBe(true);
  });
  it("creates selectable seats across every price band", () => {
    const seats = createSeats();
    expect(seats.length).toBe(70);
    expect(new Set(seats.map((seat) => seat.price))).toEqual(
      new Set(Object.values(seatPrices)),
    );
  });
  it("contains all payment and booking states", () => {
    expect(paymentMethods).toEqual(allMethods);
    expect(allStatuses).toContain("PENDING");
    expect(bookingStatuses).toContain("OPEN");
  });
  it("contains role descriptions and users", () => {
    expect(roleOptions).toHaveLength(3);
    expect(users).toHaveLength(3);
    allRoles.forEach((role) => expect(userByRole[role].role).toBe(role));
  });
  it("keeps capacity and genre aggregations realistic", () => {
    expect(Math.max(...capacities)).toBe(42000);
    expect(
      genreCounts.reduce((sumValue, value) => sumValue + value.events, 0),
    ).toBe(events.length);
  });
  it("provides successful checkout examples", () =>
    expect(checkoutExamples.every((example) => example.succeeds)).toBe(true));
  it("filters by genre and location together", () =>
    expect(
      filterEvents(events, {
        genre: "Electronic",
        location: "Toronto, ON",
      }).every(
        (event) =>
          event.genre === "Electronic" && locationOf(event) === "Toronto, ON",
      ),
    ).toBe(true));
  it("handles scalar utilities", () => {
    expect(onlyDigits("12-3")).toBe("123");
    expect(clamp(9, 0, 6)).toBe(6);
    expect(safeQuantity(3.9)).toBe(3);
    expect(sum([1, 2, 3])).toBe(6);
    expect(average([2, 4])).toBe(3);
    expect(percentage(1, 4)).toBe(25);
  });
  it("handles collection and text utilities", () => {
    expect(unique(["a", "a", "b"])).toEqual(["a", "b"]);
    expect(pluralize(1, "ticket")).toBe("1 ticket");
    expect(pluralize(2, "ticket")).toBe("2 tickets");
    expect(truncate("abcdef", 4)).toBe("abc…");
    expect(toTitleCase("live MUSIC")).toBe("Live Music");
  });
  it("handles identity and account helpers", () => {
    expect(fullName(" Alex ", " Johnson ")).toBe("Alex Johnson");
    expect(emailDomain("a@example.com")).toBe("example.com");
    expect(totalQuantity({ a: 2, b: 3 })).toBe(5);
  });
  it("sorts date rows without mutating input", () => {
    const input = [{ date: "2026-08-01" }, { date: "2026-07-01" }];
    expect(sortByDate(input)[0].date).toBe("2026-07-01");
    expect(input[0].date).toBe("2026-08-01");
  });
  it("calculates reservation boundaries", () => {
    expect(holdRemaining(6000, 1000)).toBe(5);
    expect(hasExpired(1000, 1000)).toBe(true);
    expect(hasExpired(1001, 1000)).toBe(false);
  });
  it("checks expiry against a stable clock", () => {
    const now = new Date("2026-07-01T00:00:00Z");
    expect(isFutureExpiry("12/29", now)).toBe(true);
    expect(isFutureExpiry("01/20", now)).toBe(false);
  });
  it("labels ticket inventory accurately", () => {
    expect(inventoryLabel(0)).toBe("Sold out");
    expect(inventoryLabel(10)).toBe("Limited availability");
    expect(inventoryLabel(100)).toBe("In stock");
  });
  it("has named artists and venues connected to events", () => {
    expect(
      events.every((event) =>
        venues.some((venue) => venue.id === event.venueId),
      ),
    ).toBe(true);
    expect(
      events.every((event) =>
        artists.some((artist) => artist.id === event.artistId),
      ),
    ).toBe(true);
  });
});
