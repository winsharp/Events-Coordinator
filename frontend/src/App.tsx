import { Button, Container, Stack, Text, Title } from "@mantine/core";
import { Link, Route, Routes } from "react-router-dom";
import { DashboardLayout, PublicLayout } from "./components/Shell";
import { RequireAuth, RequireRole } from "./components/RouteGuards";
import {
  ArtistBookingPage,
  ArtistEventsPage,
  ArtistProfilePage,
} from "./pages/ArtistPages";
import { LoginPage, RegisterPage } from "./pages/AuthPages";
import { CheckoutPage, CheckoutSuccessPage } from "./pages/CheckoutPages";
import {
  CustomerHubPage,
  CustomerOrdersPage,
  CustomerProfilePage,
  CustomerTicketsPage,
} from "./pages/CustomerPages";
import { EventDetailPage } from "./pages/EventPage";
import {
  ArtistsPage,
  EventsPage,
  HomePage,
  PublicArtistDetailPage,
  PublicVenueDetailPage,
  VenuesPage,
} from "./pages/PublicPages";
import {
  VenueAvailabilityPage,
  VenueBookingsPage,
  VenueDashboardPage,
  VenueProfilePage,
} from "./pages/VenuePages";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="events/:id" element={<EventDetailPage />} />
        <Route path="venues" element={<VenuesPage />} />
        <Route path="venues/:id" element={<PublicVenueDetailPage />} />
        <Route path="artists" element={<ArtistsPage />} />
        <Route path="artists/:id" element={<PublicArtistDetailPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route
          path="customer"
          element={
            <RequireRole role="CUSTOMER">
              <CustomerHubPage />
            </RequireRole>
          }
        />
        <Route
          path="customer/profile"
          element={
            <RequireRole role="CUSTOMER">
              <CustomerProfilePage />
            </RequireRole>
          }
        />
        <Route
          path="customer/orders"
          element={
            <RequireRole role="CUSTOMER">
              <CustomerOrdersPage />
            </RequireRole>
          }
        />
        <Route
          path="customer/tickets"
          element={
            <RequireRole role="CUSTOMER">
              <CustomerTicketsPage />
            </RequireRole>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route
        path="venue"
        element={
          <RequireRole role="VENUE">
            <DashboardLayout role="VENUE" />
          </RequireRole>
        }
      >
        <Route index element={<VenueDashboardPage />} />
        <Route path="availability" element={<VenueAvailabilityPage />} />
        <Route path="bookings" element={<VenueBookingsPage />} />
        <Route path="profile" element={<VenueProfilePage />} />
      </Route>
      <Route
        path="artist"
        element={
          <RequireRole role="ARTIST">
            <DashboardLayout role="ARTIST" />
          </RequireRole>
        }
      >
        <Route index element={<ArtistBookingPage />} />
        <Route path="events" element={<ArtistEventsPage />} />
        <Route path="profile" element={<ArtistProfilePage />} />
      </Route>
      <Route
        path="checkout"
        element={
          <RequireAuth>
            <CheckoutPage />
          </RequireAuth>
        }
      />
      <Route
        path="checkout/success/:id"
        element={
          <RequireAuth>
            <CheckoutSuccessPage />
          </RequireAuth>
        }
      />
    </Routes>
  );
}

function NotFoundPage() {
  return (
    <Container size="sm" py={120}>
      <Stack align="center" ta="center">
        <Text className="eyebrow">404 · ENCORE?</Text>
        <Title>That page missed the show</Title>
        <Text c="dimmed">
          The route may have moved, but your next event is one click away.
        </Text>
        <Button component={Link} to="/events">
          Browse live events
        </Button>
      </Stack>
    </Container>
  );
}
