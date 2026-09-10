import type { Event, SearchFilters } from "../types";
import { SERVICE_FEE_RATE, locale } from "../types";

export const formatMoney = (value: number, currency = "CAD") =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);

export const formatDate = (
  value: string,
  options?: Intl.DateTimeFormatOptions,
) =>
  new Intl.DateTimeFormat(
    locale,
    options ?? {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    },
  ).format(new Date(`${value}T12:00:00Z`));

export const formatCompactNumber = (value: number) =>
  new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

export const formatCountdown = (seconds: number) => {
  const safe = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
};

export const calculateFees = (subtotal: number) =>
  Math.round(subtotal * SERVICE_FEE_RATE * 100) / 100;
export const calculateTotal = (subtotal: number) =>
  Math.round((subtotal + calculateFees(subtotal)) * 100) / 100;
export const onlyDigits = (value: string) => value.replace(/\D/g, "");
export const normalizeQuery = (value = "") => value.trim().toLowerCase();
export const locationOf = (event: Pick<Event, "city" | "region">) =>
  `${event.city}, ${event.region}`;

export const filterEvents = (events: Event[], filters: SearchFilters) => {
  const query = normalizeQuery(filters.query);
  return events.filter((event) => {
    const haystack =
      `${event.title} ${event.artist} ${event.venue} ${event.city} ${event.genre}`.toLowerCase();
    const genreMatches =
      !filters.genre ||
      filters.genre === "All genres" ||
      event.genre === filters.genre;
    const selectedLocation = normalizeQuery(filters.location).split(",")[0];
    const locationMatches =
      !selectedLocation ||
      filters.location === "All locations" ||
      normalizeQuery(locationOf(event)).includes(selectedLocation);
    return haystack.includes(query) && genreMatches && locationMatches;
  });
};

export const readStoredJson = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

export const writeStoredJson = <T>(key: string, value: T) =>
  localStorage.setItem(key, JSON.stringify(value));
export const initials = (value: string) =>
  value
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
export const orderNumber = () =>
  `TG-${Math.floor(10000 + Math.random() * 89999)}`;
export const unique = <T>(items: T[]) => Array.from(new Set(items));
export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
export const isFutureExpiry = (value: string, now = new Date()) => {
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(value);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  return (
    year > now.getFullYear() ||
    (year === now.getFullYear() && month >= now.getMonth() + 1)
  );
};
export const classNames = (
  ...values: Array<string | false | null | undefined>
) => values.filter(Boolean).join(" ");
export const sleep = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));
export const percentage = (value: number, total: number) =>
  total ? Math.round((value / total) * 100) : 0;
export const pluralize = (
  value: number,
  singular: string,
  plural = `${singular}s`,
) => `${value} ${value === 1 ? singular : plural}`;
export const dateKey = (value: Date) => value.toISOString().slice(0, 10);
export const randomId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
export const withTax = (value: number, rate = 0) =>
  Math.round(value * (1 + rate) * 100) / 100;
export const truncate = (value: string, max: number) =>
  value.length <= max ? value : `${value.slice(0, max - 1)}…`;
export const sortByDate = <T extends { date: string }>(items: T[]) =>
  [...items].sort((a, b) => a.date.localeCompare(b.date));
export const range = (length: number) =>
  Array.from({ length }, (_, index) => index);
export const sum = (values: number[]) =>
  values.reduce((total, value) => total + value, 0);
export const average = (values: number[]) =>
  values.length ? sum(values) / values.length : 0;
export const toTitleCase = (value: string) =>
  value.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
export const roleLabel = (value: string) => toTitleCase(value);
export const maskCard = (value: string) =>
  `•••• ${onlyDigits(value).slice(-4)}`;
export const maskAddress = (value: string) =>
  `${value.slice(0, 6)}…${value.slice(-4)}`;
export const queryString = (filters: SearchFilters) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(
    ([key, value]) =>
      value && !value.startsWith("All ") && params.set(key, value),
  );
  return params.toString();
};
export const parseQueryString = (search: string): SearchFilters => {
  const params = new URLSearchParams(search);
  return {
    query: params.get("query") ?? "",
    genre: params.get("genre") ?? "All genres",
    location: params.get("location") ?? "All locations",
  };
};
export const holdRemaining = (expiresAt: number, now = Date.now()) =>
  Math.max(0, Math.ceil((expiresAt - now) / 1000));
export const hasExpired = (expiresAt: number, now = Date.now()) =>
  expiresAt <= now;
export const fullName = (firstName: string, lastName: string) =>
  `${firstName.trim()} ${lastName.trim()}`.trim();
export const sameDay = (a: string, b: string) =>
  a.slice(0, 10) === b.slice(0, 10);
export const eventSearchText = (event: Event) =>
  [
    event.title,
    event.artist,
    event.venue,
    event.city,
    event.region,
    event.genre,
  ]
    .join(" ")
    .toLowerCase();
export const byId = <T extends { id: string }>(items: T[], id?: string) =>
  items.find((item) => item.id === id);
export const inventoryLabel = (inventory: number) =>
  inventory === 0
    ? "Sold out"
    : inventory <= 20
      ? "Limited availability"
      : "In stock";
export const statusLabel = (status: string) =>
  toTitleCase(status.replace("_", " "));
export const safeQuantity = (value: number, max = 6) =>
  clamp(Math.floor(value || 0), 0, max);
export const totalQuantity = (quantities: Record<string, number>) =>
  sum(Object.values(quantities));
export const shortDate = (value: string) =>
  formatDate(value, { month: "short", day: "numeric", timeZone: "UTC" });
export const monthName = (value: string) =>
  formatDate(`${value}-01`, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
export const nonEmpty = (value?: string | null) => Boolean(value?.trim());
export const emailDomain = (email: string) => email.split("@")[1] ?? "";
export const cents = (value: number) => Math.round(value * 100);
export const fromCents = (value: number) => value / 100;
export const isValidAmount = (value: number) =>
  Number.isFinite(value) && value >= 0;
export const noOp = () => undefined;
export const identity = <T>(value: T) => value;
export const escapeSearch = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export const matches = (value: string, query: string) =>
  new RegExp(escapeSearch(query), "i").test(value);
export const endOfUtils = true;
