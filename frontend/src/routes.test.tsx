import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { useLocation } from "react-router-dom";
import App from "./App";
import { renderApp } from "./test/render";
import { CART_STORAGE_KEY, HOLD_SECONDS } from "./types";

const setCheckoutCart = () => {
  localStorage.setItem(
    CART_STORAGE_KEY,
    JSON.stringify({
      eventId: "evt-neon",
      quantities: { "tier-ga": 1 },
      seats: [],
      expiresAt: Date.now() + HOLD_SECONDS * 1000,
    }),
  );
};

function LocationProbe() {
  return <span data-testid="current-route">{useLocation().pathname}</span>;
}

describe("application route smoke coverage", () => {
  it("renders public discovery", async () => {
    renderApp(<App />);
    expect(
      screen.getByText("Find your next unforgettable night"),
    ).toBeInTheDocument();
    expect(await screen.findByText("Trending near you")).toBeInTheDocument();
  });

  it("renders event browse", async () => {
    renderApp(<App />, { route: "/events" });
    expect(
      screen.getByRole("heading", { name: "Live events" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("6 events found")).toBeInTheDocument();
  });

  it("renders event details", async () => {
    renderApp(<App />, { route: "/events/evt-neon" });
    expect(
      await screen.findByRole("heading", { name: "Neon Skyline World Tour" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Choose tickets")).toBeInTheDocument();
  });

  it("renders venues", async () => {
    renderApp(<App />, { route: "/venues" });
    expect(await screen.findByText("Aurora Theatre")).toBeInTheDocument();
  });

  it("renders venue details and related shows", async () => {
    renderApp(<App />, { route: "/venues/ven-aurora" });
    expect(
      await screen.findByRole("heading", { name: "Aurora Theatre" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Upcoming at Aurora Theatre")).toBeInTheDocument();
  });

  it("renders artists", async () => {
    renderApp(<App />, { route: "/artists" });
    expect(await screen.findByText("The Midnight Echoes")).toBeInTheDocument();
  });

  it("renders artist details and related shows", async () => {
    renderApp(<App />, { route: "/artists/art-echoes" });
    expect(
      await screen.findByRole("heading", { name: "The Midnight Echoes" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Upcoming shows")).toBeInTheDocument();
  });

  it("renders login", () => {
    renderApp(<App />, { route: "/login" });
    expect(
      screen.getByRole("heading", { name: "Welcome back" }),
    ).toBeInTheDocument();
  });

  it("renders registration with username and role selection", () => {
    renderApp(<App />, { route: "/register" });
    expect(
      screen.getByRole("heading", {
        name: "Create your TicketGenie account",
      }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
  });

  it("redirects a protected customer route when anonymous", async () => {
    renderApp(<App />, { route: "/customer" });
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Welcome back" }),
      ).toBeInTheDocument(),
    );
  });

  it("blocks a mismatched role from another dashboard", async () => {
    renderApp(<App />, { route: "/venue", role: "CUSTOMER" });
    expect(
      await screen.findByText("Different backstage pass"),
    ).toBeInTheDocument();
  });

  it("renders customer hub for the Customer role", async () => {
    renderApp(<App />, { route: "/customer", role: "CUSTOMER" });
    expect(await screen.findByText(/Good evening, Alex/)).toBeInTheDocument();
  });

  it("renders order history with related Customer fixtures", async () => {
    renderApp(<App />, { route: "/customer/orders", role: "CUSTOMER" });
    expect(await screen.findByText("TG-10482")).toBeInTheDocument();
  });

  it("renders Customer digital tickets", async () => {
    renderApp(<App />, { route: "/customer/tickets", role: "CUSTOMER" });
    expect(
      await screen.findByRole("heading", { name: "Your tickets" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("OFFICIAL DIGITAL TICKET").length,
    ).toBeGreaterThan(0);
  });

  it("updates the Customer profile through MSW", async () => {
    renderApp(<App />, { route: "/customer/profile", role: "CUSTOMER" });
    const displayName = await screen.findByLabelText("Display name");
    fireEvent.change(displayName, { target: { value: "Alex Rivera Updated" } });
    await userEvent.click(screen.getByRole("button", { name: "Save profile" }));
    expect(
      await screen.findByText("Customer profile updated"),
    ).toBeInTheDocument();
  });

  it("renders Artist venue booking and sends a request", async () => {
    renderApp(<App />, { route: "/artist", role: "ARTIST" });
    expect(
      await screen.findByRole("heading", { name: "Book a venue" }),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Request this slot" }),
    );
    expect(
      await screen.findByText("The venue received your booking request."),
    ).toBeInTheDocument();
  });

  it("renders Artist confirmed events", async () => {
    renderApp(<App />, { route: "/artist/events", role: "ARTIST" });
    expect(
      await screen.findByRole("heading", { name: "Confirmed events" }),
    ).toBeInTheDocument();
  });

  it("updates the Artist profile through MSW", async () => {
    renderApp(<App />, { route: "/artist/profile", role: "ARTIST" });
    expect(
      await screen.findByRole("heading", { name: "Artist profile" }),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Save artist profile" }),
    );
    expect(
      await screen.findByText("Artist profile updated"),
    ).toBeInTheDocument();
  });

  it("renders the Venue analytics overview", async () => {
    renderApp(<App />, { route: "/venue", role: "VENUE" });
    expect(
      await screen.findByRole("heading", { name: "Performance overview" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Revenue mix")).toBeInTheDocument();
  });

  it("renders Venue availability", async () => {
    renderApp(<App />, { route: "/venue/availability", role: "VENUE" });
    expect(
      await screen.findByRole("heading", { name: "Venue availability" }),
    ).toBeInTheDocument();
  });

  it("opens the Venue availability form", async () => {
    renderApp(<App />, { route: "/venue/availability", role: "VENUE" });
    await screen.findByRole("heading", { name: "Venue availability" });
    await userEvent.click(
      screen.getAllByRole("button", { name: "Add availability" })[0],
    );
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("Date")).toBeInTheDocument();
  });

  it("renders Venue bookings", async () => {
    renderApp(<App />, { route: "/venue/bookings", role: "VENUE" });
    expect(
      await screen.findByRole("heading", { name: "Bookings" }),
    ).toBeInTheDocument();
    expect(screen.getByText("The Midnight Echoes")).toBeInTheDocument();
  });

  it("updates the Venue profile through MSW", async () => {
    renderApp(<App />, { route: "/venue/profile", role: "VENUE" });
    expect(
      await screen.findByRole("heading", { name: "Venue profile" }),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Save venue profile" }),
    );
    expect(
      await screen.findByText("Venue profile updated"),
    ).toBeInTheDocument();
  });

  it("renders Card checkout from a held cart", async () => {
    setCheckoutCart();
    renderApp(<App />, { route: "/checkout", role: "CUSTOMER" });
    expect(
      await screen.findByRole("heading", { name: "Choose a payment method" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Complete demo card payment" }),
    ).toBeInTheDocument();
  });

  it("switches checkout to PayPal", async () => {
    setCheckoutCart();
    renderApp(<App />, { route: "/checkout", role: "CUSTOMER" });
    await screen.findByRole("heading", { name: "Choose a payment method" });
    await userEvent.click(screen.getByText("PayPal"));
    expect(
      screen.getByRole("button", { name: "Authorize demo PayPal payment" }),
    ).toBeInTheDocument();
  });

  it("switches checkout to the USDC QR workflow", async () => {
    setCheckoutCart();
    renderApp(<App />, { route: "/checkout", role: "CUSTOMER" });
    await screen.findByRole("heading", { name: "Choose a payment method" });
    await userEvent.click(screen.getByText("USDC"));
    expect(
      screen.getByRole("button", { name: "Continue to USDC QR" }),
    ).toBeInTheDocument();
  });

  it("renders fallback route", () => {
    renderApp(<App />, { route: "/not-real" });
    expect(screen.getByText("That page missed the show")).toBeInTheDocument();
  });

  it.each(["Mezz", "Balcony"])(
    "centers the %s seating section beneath the stage",
    async (section) => {
      renderApp(<App />, { route: "/events/evt-neon" });
      await screen.findByRole("heading", { name: "Neon Skyline World Tour" });
      await userEvent.click(screen.getByText(section));
      const centers = Array.from(
        screen.getByTestId("seat-chart").querySelectorAll("circle"),
      ).map((circle) => Number(circle.getAttribute("cx")));
      expect((Math.min(...centers) + Math.max(...centers)) / 2).toBe(260);
    },
  );

  it("changes the Venue revenue reporting range", async () => {
    renderApp(<App />, { route: "/venue", role: "VENUE" });
    await screen.findByRole("heading", { name: "Performance overview" });
    const range = screen.getByRole("combobox", { name: "Revenue range" });
    await userEvent.click(range);
    await userEvent.keyboard("{ArrowUp}{Enter}");
    expect(screen.getByTestId("revenue-chart")).toHaveAttribute(
      "data-points",
      "1",
    );
  });

  it("navigates the Venue calendar and returns to the current month", async () => {
    const now = new Date();
    const current = new Intl.DateTimeFormat("en-CA", {
      month: "long",
      year: "numeric",
    }).format(now);
    const next = new Intl.DateTimeFormat("en-CA", {
      month: "long",
      year: "numeric",
    }).format(new Date(now.getFullYear(), now.getMonth() + 1, 1));
    renderApp(<App />, { route: "/venue/availability", role: "VENUE" });
    expect(await screen.findByRole("heading", { name: current })).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByRole("heading", { name: next })).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "Today" }));
    expect(screen.getByRole("heading", { name: current })).toBeVisible();
  });

  it("opens booking details and approves a pending Artist request", async () => {
    renderApp(<App />, { route: "/venue/bookings", role: "VENUE" });
    await screen.findByText("Luna Park");
    await userEvent.click(
      screen.getAllByRole("button", { name: "View details" })[1],
    );
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent("Luna Park");
    await userEvent.click(dialog.querySelector("button")!);
    await userEvent.click(screen.getByRole("button", { name: "Approve" }));
    expect(await screen.findByText("Booking approved")).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Approve" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("rejects a pending Artist request and removes it from bookings", async () => {
    renderApp(<App />, { route: "/venue/bookings", role: "VENUE" });
    await screen.findByText("Luna Park");
    await userEvent.click(screen.getByRole("button", { name: "Reject" }));
    await waitFor(() =>
      expect(screen.queryByText("Luna Park")).not.toBeInTheDocument(),
    );
  });

  it("explicitly unpublishes and republishes the Venue profile", async () => {
    renderApp(<App />, { route: "/venue/profile", role: "VENUE" });
    await screen.findByRole("heading", { name: "Venue profile" });
    await userEvent.click(
      screen.getByRole("button", { name: "Publish venue" }),
    );
    await waitFor(() =>
      expect(screen.getByText("Published")).toBeInTheDocument(),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Unpublish venue" }),
    );
    await waitFor(() =>
      expect(screen.getByText("Unpublished")).toBeInTheDocument(),
    );
  });

  it("completes Card checkout and redirects directly to Customer tickets", async () => {
    setCheckoutCart();
    renderApp(
      <>
        <App />
        <LocationProbe />
      </>,
      { route: "/checkout", role: "CUSTOMER" },
    );
    await screen.findByRole("heading", { name: "Choose a payment method" });
    const terms = screen.getByLabelText(
      "I agree to the demonstration purchase terms",
    );
    fireEvent.click(terms);
    expect(terms).toBeChecked();
    await userEvent.click(
      screen.getByRole("button", { name: "Complete demo card payment" }),
    );
    await waitFor(() =>
      expect(screen.getByTestId("current-route")).toHaveTextContent(
        "/customer/tickets",
      ),
    );
  });
});
