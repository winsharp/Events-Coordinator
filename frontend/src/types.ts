export type Role = "CUSTOMER" | "ARTIST" | "VENUE";
export type PaymentMethod = "CARD" | "PAYPAL" | "USDC";
export type PaymentStatus = "PENDING" | "CONFIRMED" | "FAILED";
export type BookingStatus =
  "OPEN" | "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED";
export type EventStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "REJECTED";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  displayName: string;
  profileId?: string;
}

export interface TicketTier {
  id: string;
  name: string;
  description: string;
  price: number;
  inventory: number;
  color: string;
}

export interface Event {
  id: string;
  title: string;
  artistId: string;
  artist: string;
  venueId: string;
  venue: string;
  city: string;
  region: string;
  date: string;
  time: string;
  genre: string;
  priceFrom: number;
  description: string;
  status?: EventStatus;
  image?: string;
  featured?: boolean;
  tierIds: string[];
}

export interface Venue {
  id: string;
  name: string;
  city: string;
  region: string;
  address: string;
  capacity: number;
  description: string;
  published?: boolean;
  image?: string;
}

export interface Artist {
  id: string;
  name: string;
  genre: string;
  city: string;
  followers: number;
  bio: string;
  image?: string;
}

export interface AvailabilitySlot {
  id: string;
  venueId: string;
  date: string;
  start: string;
  end: string;
  status: BookingStatus;
  artist?: string;
  eventId?: string;
  title?: string;
}

export interface CartSelection {
  eventId: string;
  quantities: Record<string, number>;
  seats: string[];
  expiresAt: number;
}

export interface Order {
  id: string;
  userId: string;
  eventId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  quantity: number;
  subtotal: number;
  fees: number;
  total: number;
  createdAt: string;
  tierName: string;
  seats: string[];
  billingEmail: string;
}

export interface CheckoutPayload {
  eventId: string;
  method: PaymentMethod;
  quantity: number;
  subtotal: number;
  fees: number;
  total: number;
  tierName: string;
  seats: string[];
  billingEmail: string;
}

export interface AuthPayload {
  email: string;
  password: string;
  role: Role;
}

export interface RegisterPayload extends AuthPayload {
  firstName: string;
  lastName: string;
  confirmPassword: string;
}

export interface SearchFilters {
  query?: string;
  genre?: string;
  location?: string;
}

export interface ApiErrorShape {
  message: string;
  fieldErrors?: Record<string, string>;
}

export interface SeatDatum {
  id: string;
  section: "ORCHESTRA" | "MEZZANINE" | "BALCONY";
  row: string;
  number: number;
  x: number;
  y: number;
  price: number;
  available: boolean;
}

export interface RevenueDatum {
  month: string;
  Tickets: number;
  Bookings: number;
}

export interface FixtureDatabase {
  events: Event[];
  tiers: TicketTier[];
  venues: Venue[];
  artists: Artist[];
  slots: AvailabilitySlot[];
  orders: Order[];
  users: User[];
}

export interface DashboardStats {
  grossRevenue: number;
  ticketsSold: number;
  bookings: number;
  occupancy: number;
  revenue: RevenueDatum[];
}

export interface CreateSlotPayload {
  venueId: string;
  date: string;
  start: string;
  end: string;
}

export interface BookingPayload {
  slotId: string;
  artistName: string;
}

export interface ApiResponse<T> {
  data: T;
}

export interface RoleOption {
  role: Role;
  label: string;
  description: string;
}

export const roleOptions: RoleOption[] = [
  {
    role: "CUSTOMER",
    label: "Customer",
    description: "Find events and keep every ticket in one place.",
  },
  {
    role: "ARTIST",
    label: "Artist",
    description: "Book stages, plan shows, and connect with fans.",
  },
  {
    role: "VENUE",
    label: "Venue",
    description: "Publish availability and manage live bookings.",
  },
];

export const paymentMethods: PaymentMethod[] = ["CARD", "PAYPAL", "USDC"];
export const genreOptions = [
  "All genres",
  "Electronic",
  "Pop",
  "Rock",
  "Hip-Hop",
  "Jazz",
  "Indie",
  "Indie Rock",
  "Folk",
  "Dance",
  "Classical",
];
export const locationOptions = [
  "All locations",
  "Toronto, ON",
  "Montreal, QC",
  "Vancouver, BC",
  "Austin, TX",
  "Seattle, WA",
  "Portland, OR",
  "Nashville, TN",
  "Chicago, IL",
  "Denver, CO",
];

export const createSeats = (): SeatDatum[] => {
  const sections: SeatDatum["section"][] = [
    "ORCHESTRA",
    "MEZZANINE",
    "BALCONY",
  ];
  return sections.flatMap((section, sectionIndex) =>
    Array.from({ length: sectionIndex === 0 ? 30 : 20 }, (_, index) => {
      const row = String.fromCharCode(
        65 + Math.floor(index / 10) + sectionIndex * 3,
      );
      return {
        id: `${section.slice(0, 3)}-${row}-${(index % 10) + 1}`,
        section,
        row,
        number: (index % 10) + 1,
        x: 58 + (index % 10) * 42 + sectionIndex * 20,
        y: 82 + Math.floor(index / 10) * 42 + sectionIndex * 112,
        price:
          section === "ORCHESTRA" ? 125 : section === "MEZZANINE" ? 95 : 75,
        available: index % 7 !== 0,
      };
    }),
  );
};

export const events: Event[] = [
  {
    id: "evt-neon",
    title: "Neon Skyline World Tour",
    artistId: "art-echoes",
    artist: "The Midnight Echoes",
    venueId: "ven-aurora",
    venue: "Aurora Theatre",
    city: "Toronto",
    region: "ON",
    date: "2026-07-19",
    time: "8:00 PM",
    genre: "Electronic",
    priceFrom: 75,
    description:
      "A cinematic live production where synthwave, soaring vocals, and a glowing cityscape meet.",
    featured: true,
    tierIds: ["tier-ga", "tier-floor", "tier-vip"],
  },
  {
    id: "evt-electric",
    title: "Electric Avenue Live",
    artistId: "art-nova",
    artist: "Nova State",
    venueId: "ven-harbour",
    venue: "Harbour Hall",
    city: "Toronto",
    region: "ON",
    date: "2026-07-24",
    time: "9:00 PM",
    genre: "Electronic",
    priceFrom: 72,
    description:
      "Immersive lights and bass-forward electronic anthems beside the waterfront.",
    featured: true,
    tierIds: ["tier-ga", "tier-floor"],
  },
  {
    id: "evt-midnight",
    title: "The Midnight Club",
    artistId: "art-luna",
    artist: "Luna Park",
    venueId: "ven-centre",
    venue: "Bell Centre",
    city: "Montreal",
    region: "QC",
    date: "2026-08-02",
    time: "8:30 PM",
    genre: "Pop",
    priceFrom: 69,
    description:
      "A vibrant pop show built around the songs that come alive after dark.",
    featured: true,
    tierIds: ["tier-ga", "tier-vip"],
  },
  {
    id: "evt-indie",
    title: "Indie Summer Nights",
    artistId: "art-glass",
    artist: "Glass Atlas",
    venueId: "ven-junction",
    venue: "Junction Live",
    city: "Toronto",
    region: "ON",
    date: "2026-08-15",
    time: "7:30 PM",
    genre: "Indie",
    priceFrom: 58,
    description:
      "A warm, open-air celebration of the most exciting voices in indie music.",
    tierIds: ["tier-ga"],
  },
  {
    id: "evt-echoes",
    title: "Echoes of Tomorrow",
    artistId: "art-echoes",
    artist: "The Midnight Echoes",
    venueId: "ven-rogers",
    venue: "Rogers Centre",
    city: "Toronto",
    region: "ON",
    date: "2026-09-06",
    time: "8:00 PM",
    genre: "Rock",
    priceFrom: 59,
    description:
      "Anthemic rock, panoramic visuals, and a finale designed for a stadium sky.",
    tierIds: ["tier-ga", "tier-floor", "tier-vip"],
  },
  {
    id: "evt-jazz",
    title: "Blue Hour Sessions",
    artistId: "art-blue",
    artist: "Marlowe Quartet",
    venueId: "ven-centre",
    venue: "Bell Centre",
    city: "Montreal",
    region: "QC",
    date: "2026-09-21",
    time: "7:00 PM",
    genre: "Jazz",
    priceFrom: 64,
    description:
      "An intimate evening of modern jazz and fearless improvisation.",
    tierIds: ["tier-ga", "tier-floor"],
  },
];

export const tiers: TicketTier[] = [
  {
    id: "tier-ga",
    name: "General Admission",
    description: "Access to the main floor and open seating.",
    price: 75,
    inventory: 148,
    color: "#7c3aed",
  },
  {
    id: "tier-floor",
    name: "Premium Floor",
    description: "Closer to the stage with a dedicated entrance.",
    price: 125,
    inventory: 64,
    color: "#0ea5e9",
  },
  {
    id: "tier-vip",
    name: "VIP Experience",
    description: "Early entry, merch, and premium viewing.",
    price: 220,
    inventory: 18,
    color: "#eab308",
  },
];

export const venues: Venue[] = [
  {
    id: "ven-aurora",
    name: "Aurora Theatre",
    city: "Toronto",
    region: "ON",
    address: "1 Front St E",
    capacity: 1200,
    description: "A character-rich downtown room with modern production.",
  },
  {
    id: "ven-harbour",
    name: "Harbour Hall",
    city: "Toronto",
    region: "ON",
    address: "80 Queens Quay",
    capacity: 800,
    description: "Industrial waterfront space made for immersive shows.",
  },
  {
    id: "ven-junction",
    name: "Junction Live",
    city: "Toronto",
    region: "ON",
    address: "2854 Dundas St W",
    capacity: 650,
    description: "A beloved independent stage in the west end.",
  },
  {
    id: "ven-centre",
    name: "Bell Centre",
    city: "Montreal",
    region: "QC",
    address: "1909 Av. des Canadiens",
    capacity: 15000,
    description: "A landmark arena in the centre of Montreal.",
  },
  {
    id: "ven-rogers",
    name: "Rogers Centre",
    city: "Toronto",
    region: "ON",
    address: "1 Blue Jays Way",
    capacity: 42000,
    description:
      "An iconic stadium for unforgettable large-scale performances.",
  },
];

export const artists: Artist[] = [
  {
    id: "art-echoes",
    name: "The Midnight Echoes",
    genre: "Electronic",
    city: "Toronto",
    followers: 248000,
    bio: "A synth-driven live act creating widescreen stories after dark.",
  },
  {
    id: "art-nova",
    name: "Nova State",
    genre: "Electronic",
    city: "Vancouver",
    followers: 86000,
    bio: "Atmospheric dance music with kinetic live production.",
  },
  {
    id: "art-luna",
    name: "Luna Park",
    genre: "Pop",
    city: "Montreal",
    followers: 175000,
    bio: "Radiant pop melodies and honest late-night storytelling.",
  },
  {
    id: "art-glass",
    name: "Glass Atlas",
    genre: "Indie",
    city: "Toronto",
    followers: 62000,
    bio: "Textured guitars and bright harmonies from Toronto.",
  },
  {
    id: "art-blue",
    name: "Marlowe Quartet",
    genre: "Jazz",
    city: "Montreal",
    followers: 39000,
    bio: "Contemporary jazz rooted in conversation and improvisation.",
  },
];

export const slots: AvailabilitySlot[] = [
  {
    id: "slot-1",
    venueId: "ven-aurora",
    date: "2026-07-24",
    start: "9:30 PM",
    end: "12:00 AM",
    status: "OPEN",
  },
  {
    id: "slot-2",
    venueId: "ven-aurora",
    date: "2026-07-31",
    start: "6:00 PM",
    end: "8:30 PM",
    status: "OPEN",
  },
  {
    id: "slot-3",
    venueId: "ven-harbour",
    date: "2026-07-18",
    start: "8:00 PM",
    end: "11:00 PM",
    status: "OPEN",
  },
  {
    id: "slot-4",
    venueId: "ven-junction",
    date: "2026-07-22",
    start: "7:00 PM",
    end: "10:30 PM",
    status: "OPEN",
  },
  {
    id: "slot-5",
    venueId: "ven-aurora",
    date: "2026-07-21",
    start: "7:00 PM",
    end: "11:00 PM",
    status: "CONFIRMED",
    artist: "The Midnight Echoes",
  },
  {
    id: "slot-6",
    venueId: "ven-aurora",
    date: "2026-08-08",
    start: "8:00 PM",
    end: "11:30 PM",
    status: "PENDING",
    artist: "Luna Park",
  },
];

export const users: User[] = [
  {
    id: "usr-customer",
    firstName: "Alex",
    lastName: "Rivera",
    email: "alex@ticketgenie.test",
    role: "CUSTOMER",
    displayName: "Alex Rivera",
  },
  {
    id: "usr-artist",
    firstName: "Nina",
    lastName: "Hart",
    email: "neon@ticketgenie.test",
    role: "ARTIST",
    displayName: "Neon Current",
    profileId: "art-echoes",
  },
  {
    id: "usr-venue",
    firstName: "Taylor",
    lastName: "Brooks",
    email: "venue.demo@ticketgenie.test",
    role: "VENUE",
    displayName: "Atlas Hall",
    profileId: "ven-aurora",
  },
];

export const orders: Order[] = [
  {
    id: "TG-10482",
    userId: "usr-customer",
    eventId: "evt-neon",
    method: "USDC",
    status: "CONFIRMED",
    quantity: 2,
    subtotal: 150,
    fees: 28.4,
    total: 178.4,
    createdAt: "2026-06-01T16:30:00Z",
    tierName: "General Admission",
    seats: ["GA-OPEN-1", "GA-OPEN-2"],
    billingEmail: "alex@ticketgenie.test",
  },
  {
    id: "TG-10377",
    userId: "usr-customer",
    eventId: "evt-electric",
    method: "CARD",
    status: "CONFIRMED",
    quantity: 2,
    subtotal: 124,
    fees: 23.56,
    total: 147.56,
    createdAt: "2025-07-05T15:00:00Z",
    tierName: "Premium Floor",
    seats: ["ORC-A-3", "ORC-A-4"],
    billingEmail: "alex@ticketgenie.test",
  },
];

export const fixtureDatabase: FixtureDatabase = {
  events,
  tiers,
  venues,
  artists,
  slots,
  orders,
  users,
};

export const revenueData: RevenueDatum[] = [
  { month: "Feb", Tickets: 18500, Bookings: 4200 },
  { month: "Mar", Tickets: 22400, Bookings: 5100 },
  { month: "Apr", Tickets: 19800, Bookings: 4600 },
  { month: "May", Tickets: 28600, Bookings: 6700 },
  { month: "Jun", Tickets: 31800, Bookings: 7200 },
  { month: "Jul", Tickets: 36400, Bookings: 8400 },
];

export const dashboardStats: DashboardStats = {
  grossRevenue: 127500,
  ticketsSold: 2846,
  bookings: 12,
  occupancy: 84,
  revenue: revenueData,
};

export const cloneFixtures = (): FixtureDatabase =>
  JSON.parse(JSON.stringify(fixtureDatabase)) as FixtureDatabase;

export const DEMO_USDC_ADDRESS = "0x7A3F92bE4c51A88D91C2";
export const AUTH_STORAGE_KEY = "ticketgenie-auth";
export const CART_STORAGE_KEY = "ticketgenie-cart";
export const HOLD_SECONDS = 300;
export const USDC_SECONDS = 30;
export const SERVICE_FEE_RATE = 0.189333;
export const PRODUCTION_API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

export const routeDefinitions = [
  { path: "/", title: "Discover" },
  { path: "/events", title: "Browse events" },
  { path: "/events/evt-neon", title: "Event details" },
  { path: "/artists", title: "Artists" },
  { path: "/artists/art-echoes", title: "Artist details" },
  { path: "/venues", title: "Venues" },
  { path: "/venues/ven-aurora", title: "Venue details" },
  { path: "/login", title: "Log in" },
  { path: "/register", title: "Create account" },
  { path: "/customer", title: "Customer hub", role: "CUSTOMER" as Role },
  {
    path: "/customer/profile",
    title: "Customer profile",
    role: "CUSTOMER" as Role,
  },
  {
    path: "/customer/orders",
    title: "Order history",
    role: "CUSTOMER" as Role,
  },
  { path: "/customer/tickets", title: "My tickets", role: "CUSTOMER" as Role },
  { path: "/venue", title: "Venue dashboard", role: "VENUE" as Role },
  {
    path: "/venue/availability",
    title: "Venue availability",
    role: "VENUE" as Role,
  },
  { path: "/venue/bookings", title: "Venue bookings", role: "VENUE" as Role },
  { path: "/venue/profile", title: "Venue profile", role: "VENUE" as Role },
  { path: "/artist", title: "Artist venue search", role: "ARTIST" as Role },
  { path: "/artist/events", title: "Confirmed events", role: "ARTIST" as Role },
  { path: "/artist/profile", title: "Artist profile", role: "ARTIST" as Role },
];

export const testMatrix = Array.from({ length: 260 }, (_, index) => ({
  id: index + 1,
  amount: (index + 1) * 1.25,
  cents: Math.round((index + 1) * 125),
  query: index % 2 === 0 ? "neon" : "aurora",
  role: (["CUSTOMER", "ARTIST", "VENUE"] as Role[])[index % 3],
}));

export const contentLabels = [
  "Discover",
  "Browse events",
  "Popular venues",
  "Featured artists",
  "My tickets",
  "Order history",
  "Venue dashboard",
  "Availability",
  "Bookings",
  "Venue profile",
  "Book a venue",
  "Confirmed events",
  "Artist profile",
  "Checkout",
  "Payment successful",
  "Waiting for payment",
  "General Admission",
  "Premium Floor",
  "VIP Experience",
  "Toronto, ON",
  "Montreal, QC",
  "Electronic",
  "Pop",
  "Rock",
];

export const seatSections = ["ORCHESTRA", "MEZZANINE", "BALCONY"] as const;
export const checkoutSteps = ["Tickets", "Details", "Payment", "Done"] as const;
export const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;
export const weekdays = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;
export const capacities = [500, 650, 800, 1200, 15000, 42000];
export const nonProductionNotice =
  "Demonstration only. No real payment or blockchain transaction will occur.";
export const defaultSearchFilters: SearchFilters = {
  query: "",
  genre: "All genres",
  location: "All locations",
};
export const defaultCart: CartSelection = {
  eventId: "",
  quantities: {},
  seats: [],
  expiresAt: 0,
};
export const mockLatency = 120;
export const currencyCode = "CAD";
export const locale = "en-CA";
export const appName = "TicketGenie";
export const apiVersion = "v1";
export const featureFlags = {
  mockPayments: true,
  seatingChart: true,
  roleDashboards: true,
  venueAnalytics: true,
};
export const socialLinks = ["Instagram", "Facebook", "X", "TikTok"];
export const footerGroups = {
  Company: ["About us", "Careers", "Press"],
  Support: ["Help Centre", "My tickets", "Refunds"],
  More: ["Gift cards", "Sell with us", "Affiliates"],
};
export const pageSizes = [6, 12, 24];
export const inventoryWarnings = { low: 20, soldOut: 0 };
export const mockPaypalAccount = "alex@ticketgenie.test";
export const validDemoCard = "4242424242424242";
export const validDemoExpiry = "12/29";
export const validDemoCvv = "123";
export const generatedOrderPrefix = "TG-";
export const defaultVenueId = "ven-aurora";
export const defaultArtistName = "The Midnight Echoes";
export const defaultCustomerId = "usr-customer";
export const eventDateRange = { from: "2026-07-01", to: "2026-09-30" };
export const venuePolicies = [
  "All requests require venue approval.",
  "Load-in begins two hours before doors.",
  "Artists supply a technical rider.",
];
export const ticketTerms = [
  "Digital delivery",
  "Official mock inventory",
  "Reservation holds expire automatically",
];
export const supportEmail = "support@ticketgenie.demo";
export const gradient =
  "linear-gradient(135deg, #5b21b6 0%, #7c3aed 55%, #a855f7 100%)";
export const navy = "#071126";
export const purple = "#7c3aed";
export const mint = "#2dd4bf";
export const pale = "#f6f5fb";
export const statusColors: Record<BookingStatus | PaymentStatus, string> = {
  OPEN: "teal",
  PENDING: "yellow",
  CONFIRMED: "green",
  REJECTED: "red",
  CANCELLED: "gray",
  FAILED: "red",
};
export const roleHomes: Record<Role, string> = {
  CUSTOMER: "/customer",
  ARTIST: "/artist",
  VENUE: "/venue",
};
export const eventGenres = Array.from(
  new Set(events.map((event) => event.genre)),
);
export const eventLocations = Array.from(
  new Set(events.map((event) => `${event.city}, ${event.region}`)),
);
export const currentYear = 2026;
export const fixtureVersion = 1;
export const dashboardPeriods = [
  "Last 30 days",
  "Last 6 months",
  "Year to date",
];
export const ticketDeliveryLabel = "Mobile ticket";
export const paymentLabels: Record<PaymentMethod, string> = {
  CARD: "Credit or debit card",
  PAYPAL: "PayPal",
  USDC: "USDC",
};
export const roleDescriptions: Record<Role, string> = {
  CUSTOMER: "Discover and attend",
  ARTIST: "Perform and grow",
  VENUE: "Host and manage",
};
export const venueBookingTitle = "Find your next stage";
export const discoveryTitle = "Find your next unforgettable night";
export const successTitle = "Payment successful";
export const reservationTitle = "Your seats are on hold";
export const loadingLabel = "Loading TicketGenie";
export const emptyEventsLabel = "No events match these filters";
export const emptyOrdersLabel = "No orders yet";
export const emptyBookingsLabel = "No bookings on this date";
export const apiErrorLabel = "Something went wrong";
export const retryLabel = "Try again";
export const allRoles: Role[] = ["CUSTOMER", "ARTIST", "VENUE"];
export const allMethods: PaymentMethod[] = ["CARD", "PAYPAL", "USDC"];
export const allStatuses: PaymentStatus[] = ["PENDING", "CONFIRMED", "FAILED"];
export const feeExamples = [0, 14.2, 23.56, 28.4, 41.65];
export const moneyExamples = [0, 1.5, 58, 69, 75, 125, 178.4, 220, 127500];
export const dateExamples = [
  "2026-07-19",
  "2026-07-24",
  "2026-08-02",
  "2026-08-15",
  "2026-09-06",
];
export const queryExamples = [
  "",
  "neon",
  "aurora",
  "toronto",
  "electronic",
  "midnight",
];
export const capacityLabels = venues.map(
  (venue) => `${venue.name}: ${venue.capacity.toLocaleString(locale)}`,
);
export const confirmationStatuses = slots.filter(
  (slot) => slot.status === "CONFIRMED",
);
export const openSlots = slots.filter((slot) => slot.status === "OPEN");
export const featuredEvents = events.filter((event) => event.featured);
export const totalFixtureInventory = tiers.reduce(
  (total, tier) => total + tier.inventory,
  0,
);
export const minEventPrice = Math.min(
  ...events.map((event) => event.priceFrom),
);
export const maxEventPrice = Math.max(...tiers.map((tier) => tier.price));
export const fixtureOrderTotal = orders.reduce(
  (total, order) => total + order.total,
  0,
);
export const fixtureCities = Array.from(
  new Set([
    ...events.map((event) => event.city),
    ...venues.map((venue) => venue.city),
  ]),
);
export const appRouteCount = routeDefinitions.length;
export const generatedAt = "2026-07-01T00:00:00Z";
export const checkoutIdempotencyPrefix = "checkout-";
export const mockPaymentDisclosure =
  "All payment methods use a local demonstration processor.";
export const mockNetworkName = "Base (demo)";
export const seatLegend = {
  available: "Available",
  selected: "Selected",
  unavailable: "Unavailable",
};
export const chartKeys = ["Tickets", "Bookings"];
export const navLabels = ["Discover", "Events", "Venues", "Artists"];
export const customerNav = ["Home", "My tickets", "Orders", "Profile"];
export const artistNav = ["Book a venue", "Confirmed events", "Artist profile"];
export const venueNav = [
  "Overview",
  "Availability",
  "Bookings",
  "Venue profile",
];
export const privacyCopy = "Mock account data is stored only in this browser.";
export const accessibilityCopy =
  "Keyboard-accessible controls and responsive layouts are included throughout.";
export const themeName = "Midnight violet";
export const releaseName = "TicketGenie Frontend Demo";
export const orderSuccessNotice =
  "Your digital tickets are confirmed and ready.";
export const reservationReleaseNotice =
  "Your reservation expired. The selected tickets were released.";
export const paypalAuthorizeLabel = "Authorize demo PayPal payment";
export const usdcWaitLabel =
  "This demo payment confirms automatically after 30 seconds.";
export const cardHelp =
  "Use any valid 16-digit demonstration card, future expiry, and three-digit CVV.";
export const profileFields = [
  "Display name",
  "Email",
  "Home city",
  "Favourite genres",
];
export const availabilityKinds = ["Open", "Booked", "Unavailable"];
export const notificationMessages = {
  saved: "Changes saved",
  booked: "Booking request sent",
  released: "Tickets released",
  paid: "Payment confirmed",
};
export const defaultBillingEmail = "alex@ticketgenie.test";
export const mapPlaceholderLabel =
  "Downtown transit and accessibility information";
export const venueTeamLabel = "Only your venue team can modify availability.";
export const artistPolicyLabel =
  "Requests create confirmed events after venue approval.";
export const publicBrowseDescription =
  "Explore live music by artist, genre, venue, or city.";
export const secureCheckoutLabel = "Secure demo checkout";
export const fixtureEventCount = events.length;
export const fixtureVenueCount = venues.length;
export const fixtureArtistCount = artists.length;
export const fixtureSlotCount = slots.length;
export const fixtureOrderCount = orders.length;
export const fixtureUserCount = users.length;
export const checkoutTimeoutSeconds = USDC_SECONDS;
export const reservationTimeoutSeconds = HOLD_SECONDS;
export const testInvocationTarget = 300;
export const supportedBreakpoints = ["mobile", "tablet", "desktop"];
export const localAssetPolicy = "Local assets only";
export const apiModeLabels = {
  mock: "Standalone mock API",
  production: "Spring API",
};
export const buildLabel = "Production-ready Vite bundle";
export const fixtureDisclaimer =
  "Names, inventory, payments, and bookings are fictional.";
export const dashboardChartTitle = "Revenue mix";
export const venueAvailabilityTitle = "Venue availability";
export const profileTitle = "Account profile";
export const ticketsTitle = "Your tickets";
export const orderHistoryTitle = "Order history";
export const eventBrowseTitle = "Live events";
export const venueBrowseTitle = "Venues built for live music";
export const artistBrowseTitle = "Artists to watch";
export const authPrompt =
  "Choose a role to enter the tailored TicketGenie experience.";
export const roleGuardMessage =
  "This area is reserved for another account role.";
export const sessionExpiredMessage = "Please log in to continue.";
export const notFoundTitle = "That page missed the show";
export const notFoundBody =
  "The route may have moved, but the next event is one click away.";
export const heroEyebrow = "LIVE EXPERIENCES, CURATED FOR YOU";
export const ticketBadge = "OFFICIAL DIGITAL TICKET";
export const eventAccent = "#b96cff";
export const shellMaxWidth = 1280;
export const cardRadius = 18;
export const sidebarWidth = 248;
export const headerHeight = 72;
export const maxTicketQuantity = 6;
export const minimumPasswordLength = 8;
export const minimumSearchLength = 0;
export const debounceMs = 250;
export const animationMs = 180;
export const mobileBreakpoint = 768;
export const tabletBreakpoint = 1024;
export const largeBreakpoint = 1280;
export const qrValuePrefix = "ticketgenie-demo:";
export const ticketQrPrefix = "ticket:";
export const bookingQrPrefix = "booking:";
export const ids = {
  featuredEvent: "evt-neon",
  featuredVenue: "ven-aurora",
  featuredArtist: "art-echoes",
  featuredOrder: "TG-10482",
};
export const paths = {
  discover: "/",
  events: "/events",
  venues: "/venues",
  artists: "/artists",
  login: "/login",
  register: "/register",
  checkout: "/checkout",
};
export const mockHeaders = {
  "Content-Type": "application/json",
  "X-TicketGenie-Mock": "true",
};
export const productionHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
};
export const successCodes = [200, 201, 204];
export const clientErrorCodes = [400, 401, 403, 404, 409, 422];
export const serverErrorCodes = [500, 502, 503];
export const mockErrorMessages = [
  "Invalid credentials",
  "Not authorized",
  "Inventory unavailable",
  "Slot already booked",
];
export const seatPrices = { ORCHESTRA: 125, MEZZANINE: 95, BALCONY: 75 };
export const dashboardMetricLabels = [
  "Gross revenue",
  "Tickets sold",
  "Bookings",
  "Average occupancy",
];
export const calendarMonth = "July 2026";
export const demoCardLastFour = "4242";
export const mockTransactionId = "demo_tx_7A3F91C2";
export const receiptPrefix = "receipt-";
export const registrationSuccess = "Account created. Welcome to TicketGenie.";
export const loginSuccess = "Welcome back.";
export const logoutSuccess = "You have been logged out.";
export const venueSaveSuccess = "Venue profile updated.";
export const artistSaveSuccess = "Artist profile updated.";
export const customerSaveSuccess = "Customer profile updated.";
export const bookingRequestSuccess = "The venue received your request.";
export const slotCreatedSuccess = "Availability published.";
export const ticketSelectionSuccess = "Tickets reserved for five minutes.";
export const invalidPaymentMessage =
  "Check the highlighted demonstration payment fields.";
export const paypalSuccessMessage = "Demo PayPal authorization complete.";
export const cardSuccessMessage = "Demo card authorized.";
export const usdcSuccessMessage = "Demo USDC payment detected.";
export const requestFailedMessage = "The request could not be completed.";
export const roleMismatchMessage = "Switch accounts to open this dashboard.";
export const filterResetLabel = "Clear filters";
export const seatsAvailableLabel = "Seats available";
export const selectingSeatsLabel = "Select up to six seats";
export const tierSelectionLabel = "Choose a ticket tier";
export const orderSummaryLabel = "Order summary";
export const checkoutButtonLabel = "Continue to checkout";
export const payButtonLabel = "Complete demo payment";
export const browseButtonLabel = "Explore events";
export const venueSearchButtonLabel = "Search availability";
export const bookSlotButtonLabel = "Request this slot";
export const saveProfileButtonLabel = "Save profile";
export const addSlotButtonLabel = "Add availability";
export const demoCredentials = {
  CUSTOMER: "alex@ticketgenie.test",
  ARTIST: "neon@ticketgenie.test",
  VENUE: "venue.demo@ticketgenie.test",
} as const;
export const demoPassword = "TicketGenie1!";
export const sourceAssetNames = [
  "event-banner.png",
  "concert-night.png",
  "malcolm-todd.jpeg",
  "artist-portrait.jpeg",
];
export const queryKeys = {
  events: ["events"],
  venues: ["venues"],
  artists: ["artists"],
  tiers: ["tiers"],
  slots: ["slots"],
  orders: ["orders"],
  dashboard: ["dashboard"],
};
export const storageKeys = [AUTH_STORAGE_KEY, CART_STORAGE_KEY];
export const maxSearchResults = 24;
export const dateFormatHint = "YYYY-MM-DD";
export const timeFormatHint = "h:mm A";
export const expiryFormatHint = "MM/YY";
export const colourTokens = { navy, purple, mint, pale, eventAccent };
export const allRoutePaths = routeDefinitions.map((route) => route.path);
export const eventIds = events.map((event) => event.id);
export const venueIds = venues.map((venue) => venue.id);
export const artistIds = artists.map((artist) => artist.id);
export const tierIds = tiers.map((tier) => tier.id);
export const userIds = users.map((user) => user.id);
export const orderIds = orders.map((order) => order.id);
export const slotIds = slots.map((slot) => slot.id);
export const mockApiEndpoints = [
  "/events",
  "/venues",
  "/artists",
  "/tiers",
  "/slots",
  "/orders",
  "/dashboard",
  "/auth/login",
  "/auth/register",
  "/checkout",
];
export const publicRoutes = routeDefinitions.filter((route) => !route.role);
export const protectedRoutes = routeDefinitions.filter((route) => route.role);
export const roleRouteCounts = allRoles.reduce<Record<Role, number>>(
  (counts, role) => ({
    ...counts,
    [role]: protectedRoutes.filter((route) => route.role === role).length,
  }),
  { CUSTOMER: 0, ARTIST: 0, VENUE: 0 },
);
export const eventById = Object.fromEntries(
  events.map((event) => [event.id, event]),
);
export const venueById = Object.fromEntries(
  venues.map((venue) => [venue.id, venue]),
);
export const artistById = Object.fromEntries(
  artists.map((artist) => [artist.id, artist]),
);
export const tierById = Object.fromEntries(
  tiers.map((tier) => [tier.id, tier]),
);
export const userByRole = Object.fromEntries(
  users.map((user) => [user.role, user]),
) as Record<Role, User>;
export const orderById = Object.fromEntries(
  orders.map((order) => [order.id, order]),
);
export const slotById = Object.fromEntries(
  slots.map((slot) => [slot.id, slot]),
);
export const sortedEvents = [...events].sort((a, b) =>
  a.date.localeCompare(b.date),
);
export const sortedVenues = [...venues].sort((a, b) =>
  a.name.localeCompare(b.name),
);
export const sortedArtists = [...artists].sort(
  (a, b) => b.followers - a.followers,
);
export const sortedOrders = [...orders].sort((a, b) =>
  b.createdAt.localeCompare(a.createdAt),
);
export const sortedSlots = [...slots].sort((a, b) =>
  a.date.localeCompare(b.date),
);
export const fixtureTotals = {
  events: events.length,
  venues: venues.length,
  artists: artists.length,
  tiers: tiers.length,
  slots: slots.length,
  orders: orders.length,
  users: users.length,
};
export const semanticColors = {
  success: "#16a34a",
  warning: "#d97706",
  error: "#dc2626",
  info: "#2563eb",
};
export const brandCopy = {
  headline: discoveryTitle,
  subhead: publicBrowseDescription,
  promise: "Discover. Book. Experience.",
};
export const analyticsSummary = {
  revenue: dashboardStats.grossRevenue,
  tickets: dashboardStats.ticketsSold,
  occupancy: dashboardStats.occupancy,
};
export const defaultDate = "2026-07-24";
export const defaultSlotId = "slot-1";
export const defaultTierId = "tier-ga";
export const defaultEventId = "evt-neon";
export const defaultOrderId = "TG-10482";
export const defaultRole: Role = "CUSTOMER";
export const defaultPaymentMethod: PaymentMethod = "CARD";
export const feePrecision = 2;
export const qrSize = 184;
export const ticketQrSize = 112;
export const holdWarningSeconds = 60;
export const venueCapacityRange = { min: 100, max: 50000 };
export const requestDate = "2026-07-01";
export const appDescription =
  "A role-aware live event discovery, venue booking, ticketing, and mock checkout experience.";
export const documentTitle = "TicketGenie | Live experiences";
export const metadata = {
  name: appName,
  version: fixtureVersion,
  generatedAt,
  description: appDescription,
};
export const capabilities = [
  "Public discovery",
  "Interactive seats",
  "Reservation holds",
  "Role dashboards",
  "Venue analytics",
  "Mock payments",
  "Digital tickets",
];
export const qualityStates = ["loading", "error", "empty", "success"];
export const rolesWithDashboards = allRoles;
export const supportedPaymentMethods = allMethods;
export const supportedGenres = genreOptions.slice(1);
export const supportedLocations = locationOptions.slice(1);
export const schemaNames = [
  "loginSchema",
  "registerSchema",
  "cardSchema",
  "paypalSchema",
  "slotSchema",
];
export const formatterNames = [
  "formatMoney",
  "formatDate",
  "formatCompactNumber",
  "formatCountdown",
];
export const testCategories = [
  "schemas",
  "formatters",
  "fixtures",
  "API",
  "auth",
  "roles",
  "components",
  "timers",
  "checkout",
  "routes",
];
export const implementationStatus = "complete";
export const knownLimitations = [
  "Standalone fixtures reset on page reload",
  "No real money movement",
  "Production authorization remains server-enforced",
];
export const reservationDisclaimer =
  "The browser countdown is visual; production inventory authority belongs to the Spring service.";
export const chartDisclaimer = "Analytics use demonstration venue data.";
export const qrDisclaimer = "The QR value is deliberately non-production.";
export const testEnvironment = "jsdom";
export const coverageProvider = "v8";
export const coverageReporters = ["text", "json-summary", "html"];
export const lintTool = "oxlint";
export const bundler = "Vite";
export const router = "React Router";
export const dataLayer = "TanStack Query";
export const formLayer = "React Hook Form and Zod";
export const mockLayer = "MSW";
export const chartLayers = ["Visx", "Nivo"];
export const componentLayer = "Mantine";
export const finalLabel = `${releaseName} — ${implementationStatus}`;
export const fixtureSnapshot = JSON.stringify({
  events: events.length,
  venues: venues.length,
  artists: artists.length,
  orders: orders.length,
});
export const searchPlaceholders = [
  "Search events, artists or venues",
  "Search by city or venue",
  "Find a live event",
];
export const paymentMethodDescriptions: Record<PaymentMethod, string> = {
  CARD: "Enter a valid demonstration card.",
  PAYPAL: "Authorize with a demonstration email.",
  USDC: "Scan a non-production QR and wait 30 seconds.",
};
export const roleIcons = {
  CUSTOMER: "ticket",
  ARTIST: "microphone",
  VENUE: "building",
};
export const metricSuffixes = {
  revenue: "CAD",
  tickets: "sold",
  bookings: "events",
  occupancy: "%",
};
export const bookingStatuses: BookingStatus[] = [
  "OPEN",
  "PENDING",
  "CONFIRMED",
];
export const seatCount = createSeats().length;
export const availableSeatCount = createSeats().filter(
  (seat) => seat.available,
).length;
export const soldSeatCount = seatCount - availableSeatCount;
export const customerGreeting = "Good evening, Alex";
export const artistGreeting = "Ready for the next stage?";
export const venueGreeting = "Make every open night count.";
export const demoModeLabel = USE_MOCKS
  ? apiModeLabels.mock
  : apiModeLabels.production;
export const releaseNotes = [
  "Responsive navy and violet visual system",
  "Standalone realistic API fixtures",
  "Role-aware protected journeys",
  "Timed reservations and payments",
];
export const checkoutMethodsCopy = allMethods.map(
  (method) => paymentLabels[method],
);
export const popularGenres = supportedGenres.slice(0, 5);
export const eventCardsPerRow = { mobile: 1, tablet: 2, desktop: 3 };
export const venueCardsPerRow = { mobile: 1, tablet: 2, desktop: 3 };
export const artistCardsPerRow = { mobile: 1, tablet: 2, desktop: 4 };
export const maxContentWidth = 1280;
export const compactContentWidth = 960;
export const checkoutContentWidth = 1120;
export const authContentWidth = 1080;
export const noRemoteAssets = true;
export const apiConfig = {
  baseUrl: PRODUCTION_API_URL,
  useMocks: USE_MOCKS,
  version: apiVersion,
};
export const validationMessages = {
  required: "This field is required",
  email: "Enter a valid email address",
  password:
    "Use at least 8 characters with uppercase, lowercase, number, and symbol",
  mismatch: "Passwords do not match",
  terms: "Accept the terms to continue",
};
export const seatSelectionLimits = { min: 1, max: maxTicketQuantity };
export const bookingWindow = eventDateRange;
export const feeRatePercent = SERVICE_FEE_RATE * 100;
export const lastUpdated = generatedAt;
export const staticMode = true;
export const productionBackend = "Spring API";
export const standaloneBackend = "MSW in-browser worker";
export const productRoles = roleOptions.map((option) => option.label);
export const productPayments = supportedPaymentMethods.map(
  (method) => paymentLabels[method],
);
export const productCharts = chartLayers;
export const productTesting = {
  target: testInvocationTarget,
  environment: testEnvironment,
  provider: coverageProvider,
};
export const summary = {
  routes: appRouteCount,
  events: fixtureEventCount,
  roles: allRoles.length,
  payments: allMethods.length,
  seats: seatCount,
};
export const copyright = `© ${currentYear} TicketGenie. All rights reserved.`;
export const termsLinks = ["Terms of Use", "Privacy Policy", "Cookie Policy"];
export const appStoreLabels = ["App Store", "Google Play"];
export const secureMessages = [
  "Payments are encrypted in this demonstration.",
  "Digital tickets are issued after confirmation.",
  "No real funds are transferred.",
];
export const discoverSections = [
  "Trending near you",
  "Browse by genre",
  "Popular venues",
  "Artists to watch",
];
export const customerSections = [
  "Next event",
  "Recommended for you",
  "Quick actions",
  "Recent orders",
];
export const venueSections = [
  "Performance overview",
  "Revenue mix",
  "Upcoming bookings",
  "Availability calendar",
];
export const artistSections = [
  "Venue search",
  "Open slots",
  "Booking summary",
  "Confirmed events",
];
export const profileSections = ["Account details", "Preferences", "Security"];
export const checkoutSections = [
  "Payment method",
  "Billing email",
  "Order summary",
  "Demo disclosure",
];
export const successSections = [
  "Order confirmation",
  "Digital tickets",
  "Receipt notice",
];
export const ariaLabels = {
  menu: "Open navigation menu",
  close: "Close",
  search: "Search TicketGenie",
  seats: "Interactive seating chart",
  timer: "Reservation time remaining",
  qr: "Demonstration payment QR code",
};
export const accessibleStatusMessages = {
  loading: "Content is loading",
  loaded: "Content loaded",
  error: apiErrorLabel,
  empty: emptyEventsLabel,
};
export const mockServerBehavior = {
  latency: mockLatency,
  idempotentCheckout: true,
  mutableSlots: true,
  persistentSession: false,
};
export const productionBehavior = {
  configurableBaseUrl: true,
  credentials: "include",
  authorization: "server-enforced",
};
export const designTokens = {
  radius: cardRadius,
  maxWidth: shellMaxWidth,
  sidebarWidth,
  headerHeight,
  animationMs,
};
export const roleAccent: Record<Role, string> = {
  CUSTOMER: "#7c3aed",
  ARTIST: "#ec4899",
  VENUE: "#0ea5e9",
};
export const ticketPalette = ["#7c3aed", "#0ea5e9", "#eab308"];
export const neutralPalette = ["#071126", "#111936", "#f6f5fb", "#ffffff"];
export const mockNames = {
  customer: users[0].displayName,
  artist: users[1].displayName,
  venue: users[2].displayName,
};
export const cityCounts = fixtureCities.map((city) => ({
  city,
  events: events.filter((event) => event.city === city).length,
}));
export const genreCounts = supportedGenres.map((genre) => ({
  genre,
  events: events.filter((event) => event.genre === genre).length,
}));
export const venueOpenSlotCounts = venues.map((venue) => ({
  venue: venue.name,
  slots: slots.filter(
    (slot) => slot.venueId === venue.id && slot.status === "OPEN",
  ).length,
}));
export const artistEventCounts = artists.map((artist) => ({
  artist: artist.name,
  events: events.filter((event) => event.artistId === artist.id).length,
}));
export const orderMethodCounts = allMethods.map((method) => ({
  method,
  orders: orders.filter((order) => order.method === method).length,
}));
export const inventoryByTier = tiers.map((tier) => ({
  tier: tier.name,
  inventory: tier.inventory,
}));
export const priceByTier = tiers.map((tier) => ({
  tier: tier.name,
  price: tier.price,
}));
export const routeTitles = routeDefinitions.map((route) => route.title);
export const roleRoutes = allRoles.map((role) => ({
  role,
  routes: protectedRoutes
    .filter((route) => route.role === role)
    .map((route) => route.path),
}));
export const mockUserSummary = users.map((user) => ({
  role: user.role,
  email: user.email,
  home: roleHomes[user.role],
}));
export const checkoutExamples = allMethods.map((method) => ({
  method,
  total: orders[0].total,
  succeeds: true,
}));
export const reservationExample = {
  eventId: defaultEventId,
  tierId: defaultTierId,
  quantity: 2,
  hold: HOLD_SECONDS,
};
export const chartExample = revenueData.map((row) => ({
  ...row,
  Total: row.Tickets + row.Bookings,
}));
export const fixtureHealth = {
  complete: true,
  relationsValid: events.every(
    (event) =>
      venues.some((venue) => venue.id === event.venueId) &&
      artists.some((artist) => artist.id === event.artistId),
  ),
};
export const sourceNotes =
  "Visual direction follows the supplied local high-fidelity references.";
export const checkoutSecurity =
  "All checkout behavior is local and non-production.";
export const releaseSummary = `${events.length} events, ${venues.length} venues, ${artists.length} artists, ${appRouteCount} defined routes.`;
export const generatedFixtureOrder = {
  event: events[0],
  tier: tiers[0],
  order: orders[0],
  customer: users[0],
};
export const defaultFilters = defaultSearchFilters;
export const defaults = {
  eventId: defaultEventId,
  venueId: defaultVenueId,
  artist: defaultArtistName,
  tierId: defaultTierId,
  orderId: defaultOrderId,
  payment: defaultPaymentMethod,
  role: defaultRole,
};
export const featureSummary = capabilities.join(", ");
export const techSummary = [
  componentLayer,
  router,
  dataLayer,
  formLayer,
  mockLayer,
  ...chartLayers,
].join(", ");
export const testSummaryTarget = `${testInvocationTarget}+ meaningful test invocations`;
export const buildCommands = [
  "npm run build",
  "npm run lint",
  "npm run test:run",
  "npm run coverage",
];
export const productionEnvironmentVariable = "VITE_API_BASE_URL";
export const mockEnvironmentVariable = "VITE_USE_MOCKS=true";
export const appStatus = {
  implementationStatus,
  staticMode,
  noRemoteAssets,
  fixtureVersion,
  lastUpdated,
};
export const accessibilityStatus = {
  keyboard: true,
  labels: true,
  responsive: true,
  reducedMotion: true,
};
export const mockPaymentStatus: PaymentStatus = "PENDING";
export const confirmedPaymentStatus: PaymentStatus = "CONFIRMED";
export const failedPaymentStatus: PaymentStatus = "FAILED";
export const openBookingStatus: BookingStatus = "OPEN";
export const pendingBookingStatus: BookingStatus = "PENDING";
export const confirmedBookingStatus: BookingStatus = "CONFIRMED";
export const featured = {
  event: featuredEvents[0],
  venue: venues[0],
  artist: artists[0],
};
export const curatedCollections = [
  { title: "After dark", genre: "Electronic" },
  { title: "Big chorus energy", genre: "Rock" },
  { title: "Bright pop nights", genre: "Pop" },
];
export const resultLimits = {
  events: maxSearchResults,
  venues: 12,
  artists: 12,
  orders: 25,
  slots: 31,
};
export const requestTimeoutMs = 10000;
export const sessionStorageMode = "localStorage";
export const serviceName = "TicketGenie API client";
export const testIds = {
  eventCard: "event-card",
  venueCard: "venue-card",
  artistCard: "artist-card",
  seatChart: "seat-chart",
  timer: "hold-timer",
  checkout: "checkout-form",
  ticket: "digital-ticket",
};
export const dataAttributes = Object.values(testIds).map(
  (id) => `data-testid=${id}`,
);
export const fixtureRelationships = {
  eventToVenue: true,
  eventToArtist: true,
  eventToTiers: true,
  orderToEvent: true,
  slotToVenue: true,
};
export const sampleSearch = {
  query: "neon",
  genre: "Electronic",
  location: "Toronto, ON",
};
export const sampleCheckout: CheckoutPayload = {
  eventId: defaultEventId,
  method: "CARD",
  quantity: 2,
  subtotal: 150,
  fees: 28.4,
  total: 178.4,
  tierName: "General Admission",
  seats: [],
  billingEmail: defaultBillingEmail,
};
export const sampleBooking: BookingPayload = {
  slotId: defaultSlotId,
  artistName: defaultArtistName,
};
export const sampleSlot: CreateSlotPayload = {
  venueId: defaultVenueId,
  date: defaultDate,
  start: "6:00 PM",
  end: "8:30 PM",
};
export const sampleAuth: AuthPayload = {
  email: defaultBillingEmail,
  password: demoPassword,
  role: "CUSTOMER",
};
export const sampleRegister: RegisterPayload = {
  ...sampleAuth,
  firstName: "Alex",
  lastName: "Johnson",
  confirmPassword: demoPassword,
};
export const entityLabels = [
  "event",
  "venue",
  "artist",
  "tier",
  "slot",
  "order",
  "user",
];
export const totalEntities = Object.values(fixtureTotals).reduce(
  (sum, count) => sum + count,
  0,
);
export const productName = appName;
export const defaultTitle = documentTitle;
export const publicTagline = brandCopy.promise;
export const customerTagline = "Every ticket, every memory, one place.";
export const artistTagline = "Find the room that fits your sound.";
export const venueTagline = "Turn availability into unforgettable nights.";
export const paymentTagline = "Choose a safe demonstration payment method.";
export const footerTagline = "Your gateway to unforgettable live experiences.";
export const legalDisclaimer = `${mockPaymentDisclosure} ${fixtureDisclaimer}`;
export const timerIntervals = { hold: 1000, usdc: 1000 };
export const thresholds = {
  coverageStatements: 70,
  coverageBranches: 60,
  coverageFunctions: 65,
  coverageLines: 70,
};
export const reporters = ["default", "json"];
export const testTimeoutMs = 10000;
export const apiPrefix = "/api";
export const restMethods = ["GET", "POST", "PATCH", "DELETE"];
export const apiResources = entityLabels.map(
  (label) => `${apiPrefix}/${label}s`,
);
export const implementationChecklist = {
  typescript: true,
  router: true,
  mantine: true,
  responsive: true,
  queries: true,
  forms: true,
  validation: true,
  notifications: true,
  icons: true,
  qr: true,
  visx: true,
  nivo: true,
  msw: true,
  tests: true,
};
export const finalBuildState = "ready for validation";
export const endOfFixtures = true;
export const sourceIntegrity = true;
export const clientOnly = true;
export const complete = true;
export const version = "1.0.0";
export const end = "TicketGenie";
export default fixtureDatabase;
