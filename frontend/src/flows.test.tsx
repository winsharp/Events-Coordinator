import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Routes, Route } from "react-router-dom";
import { AppContextProvider, useAuth, useCart } from "./context/AppContext";
import { LoginPage } from "./pages/AuthPages";
import { cardSchema, paypalSchema, usdcSchema } from "./lib/schemas";
import { demoCredentials, demoPassword, events, HOLD_SECONDS } from "./types";
import { HoldTimer } from "./components/Cards";
import { renderApp } from "./test/render";

function CartHarness() {
  const { cart, holdSeconds, updateTier } = useCart();
  return (
    <>
      <button onClick={() => updateTier(events[0].id, "tier-ga", 2)}>
        Reserve
      </button>
      <span>{cart.eventId || "empty"}</span>
      <HoldTimer seconds={holdSeconds} />
      <span data-testid="quantity">{cart.quantities["tier-ga"] ?? 0}</span>
    </>
  );
}

function EventSwitchHarness() {
  const { cart, updateTier, toggleSeat } = useCart();
  return (
    <>
      <button onClick={() => updateTier(events[0].id, "tier-ga", 2)}>
        Reserve first event
      </button>
      <button onClick={() => updateTier(events[1].id, "tier-floor", 1)}>
        Reserve second event
      </button>
      <button onClick={() => toggleSeat(events[2].id, "MEZ-D-2")}>
        Seat at third event
      </button>
      <span data-testid="cart-event">{cart.eventId || "empty"}</span>
      <span data-testid="ga-count">{cart.quantities["tier-ga"] ?? 0}</span>
      <span data-testid="floor-count">
        {cart.quantities["tier-floor"] ?? 0}
      </span>
      <span data-testid="seat-count">{cart.seats.length}</span>
    </>
  );
}

function AuthHarness() {
  const { user } = useAuth();
  return <span>{user?.role ?? "anonymous"}</span>;
}

describe("reservation, authentication, and checkout behavior", () => {
  it("starts a five minute hold and releases it after expiry", async () => {
    vi.useFakeTimers();
    renderApp(
      <AppContextProvider>
        <CartHarness />
      </AppContextProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Reserve" }));
    expect(screen.getByText("05:00")).toBeInTheDocument();
    expect(screen.getByTestId("quantity")).toHaveTextContent("2");
    await act(async () => {
      vi.advanceTimersByTime((HOLD_SECONDS + 1) * 1000);
    });
    expect(screen.getByTestId("quantity")).toHaveTextContent("0");
    expect(screen.getByText("empty")).toBeInTheDocument();
  });
  it("releases the previous Event selection when another Event is chosen", () => {
    renderApp(
      <AppContextProvider>
        <EventSwitchHarness />
      </AppContextProvider>,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Reserve first event" }),
    );
    expect(screen.getByTestId("cart-event")).toHaveTextContent(events[0].id);
    expect(screen.getByTestId("ga-count")).toHaveTextContent("2");

    fireEvent.click(
      screen.getByRole("button", { name: "Reserve second event" }),
    );
    expect(screen.getByTestId("cart-event")).toHaveTextContent(events[1].id);
    expect(screen.getByTestId("ga-count")).toHaveTextContent("0");
    expect(screen.getByTestId("floor-count")).toHaveTextContent("1");

    fireEvent.click(
      screen.getByRole("button", { name: "Seat at third event" }),
    );
    expect(screen.getByTestId("cart-event")).toHaveTextContent(events[2].id);
    expect(screen.getByTestId("floor-count")).toHaveTextContent("0");
    expect(screen.getByTestId("seat-count")).toHaveTextContent("1");
  });
  it("logs in the seeded customer account", async () => {
    renderApp(
      <>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/customer" element={<AuthHarness />} />
        </Routes>
      </>,
      { route: "/login" },
    );
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));
    await waitFor(() =>
      expect(screen.getByText("CUSTOMER")).toBeInTheDocument(),
    );
  });
  it("switches login fields to seeded venue credentials", async () => {
    renderApp(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
      </Routes>,
      { route: "/login" },
    );
    await userEvent.click(screen.getByRole("button", { name: /Venue/ }));
    expect(screen.getByLabelText("Email")).toHaveValue(demoCredentials.VENUE);
    expect(screen.getByLabelText("Password")).toHaveValue(demoPassword);
  });
  it("accepts valid standard card data", () =>
    expect(
      cardSchema.parse({
        cardholder: "Alex Johnson",
        cardNumber: "4242424242424242",
        expiry: "12/29",
        cvv: "123",
        billingEmail: "alex@example.com",
        terms: true,
      }).cardNumber,
    ).toBe("4242424242424242"));
  it("accepts valid PayPal data", () =>
    expect(
      paypalSchema.parse({
        paypalEmail: "alex@example.com",
        billingEmail: "alex@example.com",
        terms: true,
      }).terms,
    ).toBe(true));
  it("accepts valid USDC billing data", () =>
    expect(
      usdcSchema.parse({ billingEmail: "alex@example.com", terms: true })
        .billingEmail,
    ).toBe("alex@example.com"));
});
