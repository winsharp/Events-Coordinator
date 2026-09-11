import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Group,
  Loader,
  Paper,
  Progress,
  RingProgress,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  IconArrowRight,
  IconBuilding,
  IconCalendarEvent,
  IconClock,
  IconMapPin,
  IconRefresh,
  IconTicket,
  IconUsers,
} from "@tabler/icons-react";
import { QRCodeSVG } from "qrcode.react";
import { Link } from "react-router-dom";
import type { Artist, Event, Order, Venue } from "../types";
import { ticketQrPrefix } from "../types";
import {
  formatCompactNumber,
  formatCountdown,
  formatDate,
  formatMoney,
  initials,
} from "../lib/utils";
import {
  artistImage as resolveArtistImage,
  eventImage,
  venueImage,
} from "../lib/assets";

export function EventCard({
  event,
  compact = false,
}: {
  event: Event;
  compact?: boolean;
}) {
  return (
    <Card
      className="event-card"
      radius="lg"
      padding={0}
      data-testid="event-card"
    >
      <div
        className="event-image"
        style={{
          backgroundImage: `linear-gradient(180deg,transparent,rgba(4,8,24,.55)),url(${eventImage(event)})`,
        }}
      >
        <Badge>{event.genre}</Badge>
        <span className="event-price">From {formatMoney(event.priceFrom)}</span>
      </div>
      <Box p="md">
        <Group align="flex-start" wrap="nowrap">
          <div className="date-block">
            <strong>
              {
                formatDate(event.date, {
                  month: "short",
                  timeZone: "UTC",
                }).split(" ")[0]
              }
            </strong>
            <span>{new Date(`${event.date}T12:00:00Z`).getUTCDate()}</span>
          </div>
          <Box flex={1}>
            <Text fw={800} lineClamp={1}>
              {event.title}
            </Text>
            <Text size="sm" c="dimmed">
              {event.artist}
            </Text>
            <Group gap={5} mt={5} c="dimmed">
              <IconMapPin size={14} />
              <Text size="xs">
                {event.venue}, {event.city}
              </Text>
            </Group>
          </Box>
        </Group>
        {!compact && (
          <Button
            component={Link}
            to={`/events/${event.id}`}
            fullWidth
            mt="md"
            variant="outline"
          >
            View event
          </Button>
        )}
      </Box>
    </Card>
  );
}

export function VenueCard({ venue }: { venue: Venue }) {
  return (
    <Card className="venue-card" radius="lg" p="lg" data-testid="venue-card">
      <div
        className="venue-image"
        style={{ backgroundImage: `url(${venueImage(venue)})` }}
      >
        <IconBuilding size={42} />
      </div>
      <Group justify="space-between" mt="md">
        <Title order={3}>{venue.name}</Title>
        <Badge color="teal">Available</Badge>
      </Group>
      <Group gap={5} c="dimmed">
        <IconMapPin size={15} />
        <Text size="sm">
          {venue.city}, {venue.region}
        </Text>
      </Group>
      <Group mt="md" gap="lg">
        <Group gap={5}>
          <IconUsers size={17} />
          <Text size="sm">{venue.capacity.toLocaleString()}</Text>
        </Group>
      </Group>
      <Text size="sm" c="dimmed" mt="sm" lineClamp={2}>
        {venue.description}
      </Text>
      <Button
        component={Link}
        to={`/venues/${venue.id}`}
        variant="light"
        mt="md"
        rightSection={<IconArrowRight size={16} />}
      >
        View venue
      </Button>
    </Card>
  );
}

export function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <Card
      className="artist-card"
      radius="lg"
      p="lg"
      ta="center"
      data-testid="artist-card"
    >
      <Avatar src={resolveArtistImage(artist)} size={96} mx="auto" />
      <Title order={3} mt="md">
        {artist.name}
      </Title>
      <Text c="violet" fw={700}>
        {artist.genre}
      </Text>
      <Text size="sm" c="dimmed">
        {artist.city} · {formatCompactNumber(artist.followers)} followers
      </Text>
      <Button
        component={Link}
        to={`/artists/${artist.id}`}
        variant="subtle"
        mt="sm"
      >
        View artist
      </Button>
    </Card>
  );
}

export function LoadingState({ cards = 3 }: { cards?: number }) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
      {Array.from({ length: cards }, (_, index) => (
        <Card key={index} p="lg">
          <Skeleton h={150} radius="md" />
          <Skeleton h={18} mt="md" />
          <Skeleton h={12} mt="sm" w="70%" />
        </Card>
      ))}
    </SimpleGrid>
  );
}

export function FullLoadingState() {
  return (
    <Stack align="center" justify="center" mih={400}>
      <Loader size="lg" />
      <Text c="dimmed">Loading TicketGenie</Text>
    </Stack>
  );
}
export function EmptyState({
  title = "Nothing here yet",
  description = "Try another filter or return soon.",
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <Paper className="state-card" p="xl" ta="center">
      <IconTicket size={44} color="var(--tg-purple)" />
      <Title order={3} mt="sm">
        {title}
      </Title>
      <Text c="dimmed" mt={6}>
        {description}
      </Text>
      {action && <Box mt="md">{action}</Box>}
    </Paper>
  );
}
export function ErrorState({
  message = "Something went wrong",
  retry,
}: {
  message?: string;
  retry?: () => void;
}) {
  return (
    <Alert color="red" title="We hit a snag" icon={<IconRefresh size={18} />}>
      {message}
      {retry && (
        <Button mt="sm" size="xs" color="red" onClick={retry}>
          Try again
        </Button>
      )}
    </Alert>
  );
}

export function HoldTimer({
  seconds,
  label = "Reservation hold",
}: {
  seconds: number;
  label?: string;
}) {
  const percentage = Math.min(100, Math.max(0, (seconds / 300) * 100));
  return (
    <Paper
      className={`hold-timer ${seconds <= 60 ? "urgent" : ""}`}
      p="sm"
      withBorder
      data-testid="hold-timer"
    >
      <Group wrap="nowrap">
        <RingProgress
          size={48}
          thickness={5}
          roundCaps
          sections={[
            { value: percentage, color: seconds <= 60 ? "orange" : "violet" },
          ]}
          label={
            <IconClock size={18} style={{ margin: "auto", display: "block" }} />
          }
        />
        <Box>
          <Text size="xs" c="dimmed">
            {label}
          </Text>
          <Text fw={800} aria-label="Reservation time remaining">
            {formatCountdown(seconds)}
          </Text>
        </Box>
      </Group>
    </Paper>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof IconTicket;
}) {
  return (
    <Paper className="metric-card" p="lg" radius="lg">
      <Group justify="space-between">
        <Box>
          <Text size="sm" c="dimmed">
            {label}
          </Text>
          <Title order={2} mt={4}>
            {value}
          </Title>
          <Text size="xs" c="teal" mt={4}>
            {detail}
          </Text>
        </Box>
        <div className="metric-icon">
          <Icon size={24} />
        </div>
      </Group>
    </Paper>
  );
}

export function OrderSummary({
  event,
  quantity,
  subtotal,
  fees,
  total,
  tierName,
}: {
  event: Event;
  quantity: number;
  subtotal: number;
  fees: number;
  total: number;
  tierName: string;
}) {
  return (
    <Card className="order-summary" radius="lg" p="lg">
      <Title order={3}>Order summary</Title>
      <div
        className="summary-art"
        style={{ backgroundImage: `url(${eventImage(event)})` }}
      />
      <Title order={3}>{event.title}</Title>
      <Group gap={6} mt="xs">
        <IconCalendarEvent size={16} />
        <Text size="sm">
          {formatDate(event.date)} · {event.time}
        </Text>
      </Group>
      <Group gap={6}>
        <IconMapPin size={16} />
        <Text size="sm">
          {event.venue} · {event.city}, {event.region}
        </Text>
      </Group>
      <Group justify="space-between" mt="lg">
        <Text>
          {quantity} × {tierName}
        </Text>
        <Text>{formatMoney(subtotal)}</Text>
      </Group>
      <Progress value={100} color="violet" size={2} my="md" />
      <Group justify="space-between">
        <Text c="dimmed">Fees</Text>
        <Text>{formatMoney(fees)}</Text>
      </Group>
      <Group justify="space-between" mt="md">
        <Title order={3}>Total</Title>
        <Title order={2} c="violet">
          {formatMoney(total)}
        </Title>
      </Group>
      <Alert mt="lg" color="violet" variant="light">
        Demonstration checkout. No real payment will be processed.
      </Alert>
    </Card>
  );
}

export function DigitalTicket({
  order,
  event,
  index = 0,
}: {
  order: Order;
  event: Event;
  index?: number;
}) {
  return (
    <Card className="digital-ticket" p={0} data-testid="digital-ticket">
      <Box className="ticket-top">
        <Text className="ticket-logo">
          Ticket<strong>Genie</strong>
        </Text>
        <Text className="ticket-kicker">OFFICIAL DIGITAL TICKET</Text>
        <Title order={2}>{event.title}</Title>
        <Text>
          {formatDate(event.date)} · {event.time}
        </Text>
        <Text>
          {event.venue}, {event.city}
        </Text>
      </Box>
      <Box className="ticket-stub">
        <Group justify="space-between">
          <Box>
            <Text size="xs" c="violet.2">
              SECTION
            </Text>
            <Text fw={800}>{order.seats[index]?.split("-")[0] || "GA"}</Text>
          </Box>
          <Box ta="right">
            <Text size="xs" c="violet.2">
              TICKET
            </Text>
            <Text fw={800}>
              {index + 1} OF {order.quantity}
            </Text>
          </Box>
        </Group>
        <Box className="ticket-qr">
          <QRCodeSVG
            value={`${ticketQrPrefix}${order.id}:${index + 1}`}
            size={112}
          />
        </Box>
        <Text ta="center" size="xs" c="gray.4">
          Order {order.id}
        </Text>
      </Box>
    </Card>
  );
}

export function ProfileAvatar({ name, role }: { name: string; role: string }) {
  return (
    <Stack align="center">
      <Avatar size={92} color="violet">
        {initials(name)}
      </Avatar>
      <Title order={3}>{name}</Title>
      <Badge variant="light">{role}</Badge>
    </Stack>
  );
}
