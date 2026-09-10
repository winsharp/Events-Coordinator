import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";
import {
  ArtistCard,
  DigitalTicket,
  EmptyState,
  ErrorState,
  EventCard,
  HoldTimer,
  LoadingState,
  OrderSummary,
  ProfileAvatar,
  VenueCard,
} from "./Cards";
import { RequireAuth, RequireRole } from "./RouteGuards";
import { SeatingChart } from "../pages/EventPage";
import { events, orders, artists, venues } from "../types";
import { renderApp } from "../test/render";

describe("shared presentation components", () => {
  it("renders an event card and link", () => {
    renderApp(<EventCard event={events[0]} />);
    expect(screen.getByText(events[0].title)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View event" })).toHaveAttribute(
      "href",
      `/events/${events[0].id}`,
    );
  });
  it("renders compact event without action", () => {
    renderApp(<EventCard event={events[0]} compact />);
    expect(
      screen.queryByRole("link", { name: "View event" }),
    ).not.toBeInTheDocument();
  });
  it("renders venue facts", () => {
    renderApp(<VenueCard venue={venues[0]} />);
    expect(screen.getByText("1,200")).toBeInTheDocument();
    expect(screen.getByText(venues[0].name)).toBeInTheDocument();
  });
  it("renders artist audience facts", () => {
    renderApp(<ArtistCard artist={artists[0]} />);
    expect(screen.getByText(/248K/i)).toBeInTheDocument();
  });
  it("renders loading skeleton cards", () => {
    const { container } = renderApp(<LoadingState cards={4} />);
    expect(container.querySelectorAll(".mantine-Skeleton-root")).toHaveLength(
      12,
    );
  });
  it("renders empty state action", () => {
    renderApp(
      <EmptyState
        title="No shows"
        description="Try again"
        action={<button>Reset</button>}
      />,
    );
    expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
  });
  it("invokes error retry", () => {
    const retry = vi.fn();
    renderApp(<ErrorState retry={retry} />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledOnce();
  });
  it("formats hold timer", () => {
    renderApp(<HoldTimer seconds={125} />);
    expect(screen.getByText("02:05")).toBeInTheDocument();
  });
  it("marks urgent hold timer", () => {
    const { container } = renderApp(<HoldTimer seconds={40} />);
    expect(container.querySelector(".urgent")).toBeInTheDocument();
  });
  it("renders order summary values", () => {
    renderApp(
      <OrderSummary
        event={events[0]}
        quantity={2}
        subtotal={150}
        fees={28.4}
        total={178.4}
        tierName="General Admission"
      />,
    );
    expect(screen.getByText(/178\.40/)).toBeInTheDocument();
    expect(screen.getByText("2 × General Admission")).toBeInTheDocument();
  });
  it("renders a digital ticket QR", () => {
    const { container } = renderApp(
      <DigitalTicket order={orders[0]} event={events[0]} index={0} />,
    );
    expect(screen.getByText("1 OF 2")).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
  it("renders profile initials", () => {
    renderApp(<ProfileAvatar name="Alex Johnson" role="Customer" />);
    expect(screen.getByText("AJ")).toBeInTheDocument();
  });
  it("selects available seats", () => {
    const onToggle = vi.fn();
    renderApp(<SeatingChart selected={[]} onToggle={onToggle} />);
    fireEvent.click(screen.getByLabelText(/Seat ORC-A-2 available/));
    expect(onToggle).toHaveBeenCalledOnce();
  });
  it("does not select unavailable seats", () => {
    const onToggle = vi.fn();
    renderApp(<SeatingChart selected={[]} onToggle={onToggle} />);
    fireEvent.click(screen.getByLabelText(/Seat ORC-A-1 unavailable/));
    expect(onToggle).not.toHaveBeenCalled();
  });
  it("redirects anonymous protected access", () => {
    renderApp(
      <Routes>
        <Route path="/login" element={<div>Login route</div>} />
        <Route
          path="/secret"
          element={
            <RequireAuth>
              <div>Secret</div>
            </RequireAuth>
          }
        />
      </Routes>,
      { route: "/secret" },
    );
    expect(screen.getByText("Login route")).toBeInTheDocument();
  });
  it("shows role mismatch instead of protected content", () => {
    renderApp(
      <RequireRole role="VENUE">
        <div>Venue only</div>
      </RequireRole>,
      { role: "CUSTOMER" },
    );
    expect(screen.getByText("Different backstage pass")).toBeInTheDocument();
    expect(screen.queryByText("Venue only")).not.toBeInTheDocument();
  });
});
