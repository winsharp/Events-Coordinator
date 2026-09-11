import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Group,
  NumberInput,
  Paper,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Group as VisxGroup } from "@visx/group";
import { scaleOrdinal } from "@visx/scale";
import {
  IconCalendarEvent,
  IconChevronRight,
  IconMapPin,
  IconShieldCheck,
  IconSparkles,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import {
  EmptyState,
  ErrorState,
  FullLoadingState,
  HoldTimer,
} from "../components/Cards";
import { useCart } from "../context/AppContext";
import {
  calculateFees,
  formatDate,
  formatMoney,
  inventoryLabel,
  totalQuantity,
} from "../lib/utils";
import {
  createSeats,
  maxTicketQuantity,
  type SeatDatum,
  type TicketTier,
} from "../types";
import { eventImage } from "../lib/assets";

export function SeatingChart({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (seat: SeatDatum) => void;
}) {
  const [section, setSection] = useState<SeatDatum["section"]>("ORCHESTRA");
  const seats = useMemo(
    () => createSeats().filter((seat) => seat.section === section),
    [section],
  );
  const colors = scaleOrdinal({
    domain: ["available", "selected", "unavailable"],
    range: ["#d8d7e3", "#7c3aed", "#9ca3af"],
  });
  const minX = Math.min(...seats.map((seat) => seat.x));
  const maxX = Math.max(...seats.map((seat) => seat.x));
  const minY = Math.min(...seats.map((seat) => seat.y));
  const xOffset = 260 - (minX + maxX) / 2;
  return (
    <Paper p="md" radius="lg" className="seat-panel">
      <Group justify="space-between" mb="md">
        <Box>
          <Text fw={800}>Choose exact seats</Text>
          <Text size="sm" c="dimmed">
            Select up to six seats
          </Text>
        </Box>
        <SegmentedControl
          size="xs"
          value={section}
          onChange={(value) => setSection(value as SeatDatum["section"])}
          data={[
            { label: "Floor", value: "ORCHESTRA" },
            { label: "Mezz", value: "MEZZANINE" },
            { label: "Balcony", value: "BALCONY" },
          ]}
        />
      </Group>
      <div className="stage">STAGE</div>
      <svg
        viewBox="0 0 520 190"
        width="100%"
        role="img"
        aria-label="Interactive seating chart"
        data-testid="seat-chart"
      >
        <VisxGroup>
          {seats.map((seat) => {
            const state = !seat.available
              ? "unavailable"
              : selected.includes(seat.id)
                ? "selected"
                : "available";
            return (
              <Tooltip
                key={seat.id}
                label={`${seat.id} · ${formatMoney(seat.price)}`}
              >
                <circle
                  aria-label={`Seat ${seat.id} ${state}`}
                  tabIndex={seat.available ? 0 : -1}
                  cx={seat.x + xOffset}
                  cy={seat.y - minY + 55}
                  r={14}
                  fill={colors(state)}
                  stroke={state === "selected" ? "#4c1d95" : "#fff"}
                  strokeWidth={3}
                  style={{ cursor: seat.available ? "pointer" : "not-allowed" }}
                  onClick={() => seat.available && onToggle(seat)}
                  onKeyDown={(event) => {
                    if (
                      seat.available &&
                      (event.key === "Enter" || event.key === " ")
                    )
                      onToggle(seat);
                  }}
                />
              </Tooltip>
            );
          })}
        </VisxGroup>
      </svg>
      <Group justify="center" gap="lg" mt="xs">
        <Legend color="#d8d7e3" label="Available" />
        <Legend color="#7c3aed" label="Selected" />
        <Legend color="#9ca3af" label="Unavailable" />
      </Group>
    </Paper>
  );
}
const Legend = ({ color, label }: { color: string; label: string }) => (
  <Group gap={5}>
    <span className="legend-dot" style={{ background: color }} />
    <Text size="xs">{label}</Text>
  </Group>
);

function TierRow({
  tier,
  quantity,
  onChange,
}: {
  tier: TicketTier;
  quantity: number;
  onChange: (value: number) => void;
}) {
  return (
    <Card className="tier-row" p="md" style={{ borderLeftColor: tier.color }}>
      <Group justify="space-between" wrap="nowrap">
        <Box>
          <Text fw={800}>{tier.name}</Text>
          <Text size="xs" c="dimmed" maw={250}>
            {tier.description}
          </Text>
          <Text size="xs" c={tier.inventory <= 20 ? "orange" : "teal"}>
            {inventoryLabel(tier.inventory)}
          </Text>
        </Box>
        <Box ta="right">
          <Text c="violet" fw={800}>
            {formatMoney(tier.price)}
          </Text>
          <NumberInput
            mt={8}
            w={110}
            min={0}
            max={maxTicketQuantity}
            value={quantity}
            onChange={(value) => onChange(Number(value))}
            allowDecimal={false}
          />
        </Box>
      </Group>
    </Card>
  );
}

export function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, holdSeconds, updateTier, toggleSeat } = useCart();
  const eventQuery = useQuery({
    queryKey: ["event", id],
    queryFn: () => api.event(id!),
  });
  const tiersQuery = useQuery({
    queryKey: ["tiers", id],
    queryFn: () => api.tiers(id),
  });
  if (eventQuery.isLoading || tiersQuery.isLoading) return <FullLoadingState />;
  if (eventQuery.isError)
    return (
      <Container size="xl" py={80}>
        <ErrorState
          message={eventQuery.error.message}
          retry={() => eventQuery.refetch()}
        />
      </Container>
    );
  if (!eventQuery.data)
    return (
      <Container size="xl" py={80}>
        <EmptyState title="Event not found" />
      </Container>
    );
  const event = eventQuery.data;
  const eventTiers =
    tiersQuery.data?.filter((tier) => event.tierIds.includes(tier.id)) ?? [];
  const quantities = cart.eventId === event.id ? cart.quantities : {};
  const seats = cart.eventId === event.id ? cart.seats : [];
  const tierSubtotal = eventTiers.reduce(
    (sum, tier) => sum + tier.price * (quantities[tier.id] ?? 0),
    0,
  );
  const selectedSeats = createSeats().filter((seat) => seats.includes(seat.id));
  const seatSubtotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  const subtotal = tierSubtotal + seatSubtotal;
  const fees = calculateFees(subtotal);
  const quantity = totalQuantity(quantities) + seats.length;
  return (
    <>
      <section
        className="event-banner"
        style={{
          backgroundImage: `linear-gradient(90deg,rgba(7,17,38,.82),rgba(36,11,72,.3)),url(${eventImage(event)})`,
        }}
      >
        <Container size="xl">
          <Text size="sm">Discover / Concerts / {event.title}</Text>
        </Container>
      </section>
      <Container size="xl" className="event-detail">
        <SimpleGrid cols={{ base: 1, lg: 5 }} spacing="xl">
          <Box style={{ gridColumn: "span 3" }}>
            <Group gap="sm">
              <Badge color="pink">Selling fast</Badge>
              <Badge color="teal">All ages</Badge>
            </Group>
            <Title className="event-title">{event.title}</Title>
            <Group>
              <div className="artist-orb">
                <IconSparkles size={22} />
              </div>
              <Text
                component={Link}
                to={`/artists/${event.artistId}`}
                c="violet"
                fw={800}
                size="lg"
              >
                {event.artist}
              </Text>
            </Group>
            <Stack gap="sm" mt="lg">
              <Group>
                <IconCalendarEvent size={20} />
                <Text fw={600}>
                  {formatDate(event.date, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "UTC",
                  })}{" "}
                  · {event.time}
                </Text>
              </Group>
              <Group>
                <IconMapPin size={20} />
                <Text fw={600}>
                  {event.venue} · {event.city}, {event.region}
                </Text>
              </Group>
            </Stack>
            <Text mt="lg" c="dimmed">
              {event.description}
            </Text>
            <Paper className="venue-info" p="lg" mt="xl">
              <Title order={3}>Venue information</Title>
              <div className="map-placeholder">
                <IconMapPin size={30} />
                <span>Downtown transit and accessibility information</span>
              </div>
              <Text component={Link} to={`/venues/${event.venueId}`} fw={800}>
                {event.venue}
              </Text>
              <Text size="sm" c="dimmed">
                Located in the heart of {event.city} with easy access to public
                transit.
              </Text>
            </Paper>
            <Paper p="lg" mt="md">
              <Title order={3}>About this event</Title>
              <Text c="dimmed" mt="sm">
                Step into a vivid live universe as {event.artist} brings their
                biggest production yet. Lineup subject to change. No refunds
                unless the event is cancelled.
              </Text>
            </Paper>
          </Box>
          <Box style={{ gridColumn: "span 2" }}>
            <Card className="ticket-selector" p="lg" radius="lg">
              <Group justify="space-between">
                <Title order={2}>Choose tickets</Title>
                {cart.eventId === event.id && holdSeconds > 0 && (
                  <HoldTimer seconds={holdSeconds} />
                )}
              </Group>
              <Stack mt="md" gap="sm">
                {eventTiers.map((tier) => (
                  <TierRow
                    key={tier.id}
                    tier={tier}
                    quantity={quantities[tier.id] ?? 0}
                    onChange={(value) => updateTier(event.id, tier.id, value)}
                  />
                ))}
                <Divider label="or choose exact seats" labelPosition="center" />
                <SeatingChart
                  selected={seats}
                  onToggle={(seat) => toggleSeat(event.id, seat.id)}
                />
              </Stack>
              <Divider my="md" />
              <Group justify="space-between">
                <Text>Subtotal</Text>
                <Text>{formatMoney(subtotal)}</Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Fees
                </Text>
                <Text size="sm">{formatMoney(fees)}</Text>
              </Group>
              <Group justify="space-between" mt="md">
                <Title order={3}>Total</Title>
                <Title order={2} c="violet">
                  {formatMoney(subtotal + fees)}
                </Title>
              </Group>
              <Button
                fullWidth
                size="lg"
                mt="lg"
                disabled={quantity === 0}
                rightSection={<IconChevronRight />}
                onClick={() => navigate("/checkout")}
              >
                Continue to checkout
              </Button>
              <Group justify="center" gap={5} mt="md">
                <IconShieldCheck size={15} />
                <Text size="xs" c="dimmed">
                  Secure demonstration checkout
                </Text>
              </Group>
            </Card>
          </Box>
        </SimpleGrid>
      </Container>
    </>
  );
}

export const eventPageReady = true;
