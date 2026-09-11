import {
  Alert,
  Badge,
  Box,
  Button,
  Checkbox,
  Container,
  Group,
  Modal,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Table,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ResponsiveBar } from "@nivo/bar";
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconCurrencyDollar,
  IconPlus,
  IconTicket,
  IconUsers,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import {
  EmptyState,
  FullLoadingState,
  MetricCard,
  ProfileAvatar,
} from "../components/Cards";
import { formatDate, formatMoney } from "../lib/utils";
import {
  dashboardPeriods,
  weekdays,
  type AvailabilitySlot,
} from "../types";

const todayKey = () => new Date().toISOString().slice(0, 10);
const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const monthLabel = (date: Date) =>
  new Intl.DateTimeFormat("en-CA", { month: "long", year: "numeric" }).format(
    date,
  );
const daysForMonth = (date: Date) => {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const count = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return [
    ...Array.from({ length: first.getDay() }, () => null),
    ...Array.from(
      { length: count },
      (_, index) => new Date(date.getFullYear(), date.getMonth(), index + 1),
    ),
  ];
};

export function VenueDashboardPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState("Last 6 months");
  const statsQuery = useQuery({
    queryKey: ["dashboard"],
    queryFn: api.dashboard,
  });
  const slotsQuery = useQuery({
    queryKey: ["slots", "venue"],
    queryFn: api.mySlots,
  });
  const venueQuery = useQuery({
    queryKey: ["venue", "me"],
    queryFn: api.myVenue,
  });
  if (statsQuery.isLoading || venueQuery.isLoading) return <FullLoadingState />;
  const stats = statsQuery.data!;
  const revenue =
    period === "Last 30 days"
      ? stats.revenue.slice(-1)
      : period === "Year to date"
        ? stats.revenue
        : stats.revenue.slice(-6);
  return (
    <Container fluid className="dashboard-page">
      <div className="dashboard-heading">
        <Box>
          <Text className="section-kicker">{venueQuery.data?.name}</Text>
          <Title>Performance overview</Title>
          <Text c="dimmed">
            A clear view of bookings, tickets, and venue momentum.
          </Text>
        </Box>
        <Button
          leftSection={<IconPlus size={18} />}
          onClick={() => navigate("/venue/availability?add=1")}
        >
          Add availability
        </Button>
      </div>
      <SimpleGrid cols={{ base: 1, sm: 2, xl: 4 }}>
        <MetricCard
          label="Gross revenue"
          value={formatMoney(stats.grossRevenue)}
          detail="Current reporting period"
          icon={IconCurrencyDollar}
        />
        <MetricCard
          label="Tickets sold"
          value={stats.ticketsSold.toLocaleString()}
          detail="Across confirmed events"
          icon={IconTicket}
        />
        <MetricCard
          label="Confirmed bookings"
          value={String(stats.bookings)}
          detail={`${slotsQuery.data?.filter((slot) => slot.status === "PENDING").length ?? 0} pending requests`}
          icon={IconCalendar}
        />
        <MetricCard
          label="Average occupancy"
          value={`${stats.occupancy}%`}
          detail="Across active rooms"
          icon={IconUsers}
        />
      </SimpleGrid>
      <SimpleGrid cols={{ base: 1, xl: 3 }} mt="xl">
        <Paper className="chart-card" p="lg" style={{ gridColumn: "span 2" }}>
          <Group justify="space-between">
            <Box>
              <Title order={3}>Revenue mix</Title>
              <Text size="sm" c="dimmed">
                Ticket sales and venue booking revenue
              </Text>
            </Box>
            <Select
              aria-label="Revenue range"
              w={180}
              value={period}
              data={dashboardPeriods}
              onChange={(value) => setPeriod(value ?? "Last 6 months")}
            />
          </Group>
          <div
            className="nivo-chart"
            data-testid="revenue-chart"
            data-points={revenue.length}
          >
            <ResponsiveBar
              data={
                revenue as unknown as Array<Record<string, string | number>>
              }
              keys={["Tickets", "Bookings"]}
              indexBy="month"
              margin={{ top: 30, right: 20, bottom: 45, left: 65 }}
              padding={0.32}
              groupMode="stacked"
              colors={["#7c3aed", "#c4b5fd"]}
              borderRadius={4}
              axisLeft={{ format: (value) => `$${Number(value) / 1000}k` }}
              enableLabel={false}
              gridYValues={5}
            />
          </div>
        </Paper>
        <Paper p="lg">
          <Title order={3}>Upcoming bookings</Title>
          <Stack mt="md">
            {slotsQuery.data
              ?.filter((slot) => slot.status !== "OPEN")
              .map((slot) => (
                <BookingCard key={slot.id} slot={slot} />
              ))}
          </Stack>
        </Paper>
      </SimpleGrid>
    </Container>
  );
}

function BookingCard({ slot }: { slot: AvailabilitySlot }) {
  return (
    <Paper p="md" withBorder>
      <Group justify="space-between">
        <Box>
          <Text fw={800}>{slot.artist ?? "Artist request"}</Text>
          <Text size="sm" c="dimmed">
            {formatDate(slot.date)} · {slot.start}
          </Text>
        </Box>
        <Badge color={slot.status === "CONFIRMED" ? "teal" : "yellow"}>
          {slot.status}
        </Badge>
      </Group>
    </Paper>
  );
}

export function VenueAvailabilityPage() {
  const [opened, { open, close }] = useDisclosure(false);
  const [month, setMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [date, setDate] = useState(todayKey);
  const [start, setStart] = useState("6:00 PM");
  const [end, setEnd] = useState("9:00 PM");
  const queryClient = useQueryClient();
  const venueQuery = useQuery({
    queryKey: ["venue", "me"],
    queryFn: api.myVenue,
  });
  const slotsQuery = useQuery({
    queryKey: ["slots", "venue"],
    queryFn: api.mySlots,
  });
  const mutation = useMutation({
    mutationFn: () =>
      api.createSlot({ venueId: venueQuery.data!.id, date, start, end }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slots"] });
      notifications.show({ color: "teal", message: "Availability published" });
      setSelectedDate(date);
      close();
    },
  });
  const params = new URLSearchParams(window.location.search);
  useEffect(() => {
    if (params.get("add") === "1") open();
  }, []);
  if (slotsQuery.isLoading || venueQuery.isLoading) return <FullLoadingState />;
  const cells = daysForMonth(month);
  const selected =
    slotsQuery.data?.filter((slot) => slot.date === selectedDate) ?? [];
  const goMonth = (amount: number) =>
    setMonth(new Date(month.getFullYear(), month.getMonth() + amount, 1));
  const choose = (value: Date) => {
    const key = dateKey(value);
    setSelectedDate(key);
    setDate(key);
  };
  const goToday = () => {
    const now = new Date();
    setMonth(now);
    choose(now);
  };
  return (
    <Container fluid className="dashboard-page">
      <div className="dashboard-heading">
        <Box>
          <Title>Venue availability</Title>
          <Text c="dimmed">Publish and manage dates artists can book.</Text>
        </Box>
        <Button leftSection={<IconPlus size={18} />} onClick={open}>
          Add availability
        </Button>
      </div>
      <SimpleGrid cols={{ base: 1, xl: 2 }}>
        <Paper p="lg">
          <Group justify="space-between">
            <Button
              aria-label="Previous month"
              variant="default"
              onClick={() => goMonth(-1)}
            >
              <IconChevronLeft size={18} />
            </Button>
            <Title order={3}>{monthLabel(month)}</Title>
            <Group gap="xs">
              <Button
                aria-label="Next month"
                variant="default"
                onClick={() => goMonth(1)}
              >
                <IconChevronRight size={18} />
              </Button>
              <Button variant="default" onClick={goToday}>
                Today
              </Button>
            </Group>
          </Group>
          <div className="calendar-grid">
            {weekdays.map((day) => (
              <Text key={day} ta="center" size="xs" c="dimmed">
                {day}
              </Text>
            ))}
            {cells.map((value, index) => {
              if (!value)
                return (
                  <span key={`empty-${index}`} className="calendar-empty" />
                );
              const key = dateKey(value);
              const daySlots =
                slotsQuery.data?.filter((slot) => slot.date === key) ?? [];
              const booked = daySlots.some((slot) => slot.status !== "OPEN");
              return (
                <button
                  key={key}
                  aria-label={formatDate(key)}
                  className={`calendar-day ${key === selectedDate ? "active" : ""} ${booked ? "booked" : ""}`}
                  onClick={() => choose(value)}
                >
                  {value.getDate()}
                  {daySlots.length > 0 && <span />}
                </button>
              );
            })}
          </div>
          <Group mt="md">
            <Badge color="violet">Open</Badge>
            <Badge color="teal">Booked</Badge>
            <Badge color="gray">Unavailable</Badge>
          </Group>
        </Paper>
        <Paper p="lg">
          <Title order={2}>
            {formatDate(selectedDate, {
              month: "long",
              day: "numeric",
              year: "numeric",
              timeZone: "UTC",
            })}
          </Title>
          <Text size="sm" c="dimmed">
            Bookings and published times for the selected day.
          </Text>
          <Stack mt="xl">
            {selected.length ? (
              selected.map((slot) => (
                <Paper key={slot.id} p="md" withBorder>
                  <Group justify="space-between">
                    <Box>
                      <Text fw={700}>
                        {slot.start} – {slot.end}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {slot.artist ?? "Available to artists"}
                      </Text>
                    </Box>
                    <Badge
                      color={
                        slot.status === "OPEN"
                          ? "violet"
                          : slot.status === "PENDING"
                            ? "yellow"
                            : "teal"
                      }
                    >
                      {slot.status}
                    </Badge>
                  </Group>
                </Paper>
              ))
            ) : (
              <EmptyState title="No bookings on this date" />
            )}
            <Button
              variant="outline"
              leftSection={<IconPlus size={17} />}
              onClick={open}
            >
              Add another time
            </Button>
          </Stack>
        </Paper>
      </SimpleGrid>
      <Modal opened={opened} onClose={close} title="Add availability">
        <Stack>
          <TextInput
            type="date"
            label="Date"
            value={date}
            onChange={(e) => setDate(e.currentTarget.value)}
          />
          <Group grow>
            <TextInput
              label="Start time"
              value={start}
              onChange={(e) => setStart(e.currentTarget.value)}
            />
            <TextInput
              label="End time"
              value={end}
              onChange={(e) => setEnd(e.currentTarget.value)}
            />
          </Group>
          <Button
            loading={mutation.isPending}
            disabled={!date || !start || !end || start === end}
            onClick={() => mutation.mutate()}
          >
            Publish slot
          </Button>
        </Stack>
      </Modal>
    </Container>
  );
}

export function VenueBookingsPage() {
  const [selected, setSelected] = useState<AvailabilitySlot | null>(null);
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["venue", "bookings"],
    queryFn: api.venueBookings,
  });
  const decision = useMutation({
    mutationFn: ({ id, approved }: { id: string; approved: boolean }) =>
      api.updateBooking(id, approved),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["venue", "bookings"] });
      queryClient.invalidateQueries({ queryKey: ["slots"] });
      notifications.show({
        color: variables.approved ? "teal" : "orange",
        message: variables.approved ? "Booking approved" : "Booking rejected",
      });
      setSelected(null);
    },
  });
  if (query.isLoading) return <FullLoadingState />;
  const bookings = query.data ?? [];
  return (
    <Container fluid className="dashboard-page">
      <Title>Bookings</Title>
      <Text c="dimmed" mb="xl">
        Review confirmed shows and incoming artist requests.
      </Text>
      {bookings.length ? (
        <Paper p="lg">
          <Table verticalSpacing="md">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Artist</Table.Th>
                <Table.Th>Date</Table.Th>
                <Table.Th>Time</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {bookings.map((slot) => (
                <Table.Tr key={slot.id}>
                  <Table.Td fw={700}>
                    {slot.artist ?? "Artist request"}
                  </Table.Td>
                  <Table.Td>{formatDate(slot.date)}</Table.Td>
                  <Table.Td>
                    {slot.start} – {slot.end}
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={slot.status === "CONFIRMED" ? "teal" : "yellow"}
                    >
                      {slot.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => setSelected(slot)}
                      >
                        View details
                      </Button>
                      {slot.status === "PENDING" && (
                        <>
                          <Button
                            size="xs"
                            color="teal"
                            onClick={() =>
                              decision.mutate({ id: slot.id, approved: true })
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            size="xs"
                            color="red"
                            variant="outline"
                            onClick={() =>
                              decision.mutate({ id: slot.id, approved: false })
                            }
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      ) : (
        <EmptyState title="No bookings" />
      )}
      <Modal
        opened={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Booking details"
      >
        {selected && (
          <Stack>
            <Title order={3}>{selected.artist ?? "Artist request"}</Title>
            <Text>
              {formatDate(selected.date, {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
                timeZone: "UTC",
              })}
            </Text>
            <Text>
              {selected.start} – {selected.end}
            </Text>
            <Badge
              w="max-content"
              color={selected.status === "CONFIRMED" ? "teal" : "yellow"}
            >
              {selected.status}
            </Badge>
          </Stack>
        )}
      </Modal>
    </Container>
  );
}

type VenueForm = {
  displayName: string;
  address: string;
  city: string;
  capacity: number | string;
  description: string;
  published: boolean;
};
export function VenueProfilePage() {
  const queryClient = useQueryClient();
  const venueQuery = useQuery({
    queryKey: ["venue", "me"],
    queryFn: api.myVenue,
  });
  const [values, setValues] = useState<VenueForm>({
    displayName: "",
    address: "",
    city: "",
    capacity: 1000,
    description: "",
    published: false,
  });
  useEffect(() => {
    const venue = venueQuery.data;
    if (venue)
      setValues({
        displayName: venue.name,
        address: venue.address,
        city: venue.city,
        capacity: venue.capacity,
        description: venue.description,
        published: venue.published ?? false,
      });
  }, [venueQuery.data]);
  const mutation = useMutation({
    mutationFn: (next: VenueForm) =>
      api.saveVenueProfile({ ...next, capacity: Number(next.capacity) }),
    onSuccess: (venue) => {
      queryClient.setQueryData(["venue", "me"], venue);
      notifications.show({
        color: "teal",
        title: "Venue profile updated",
        message: venue.published
          ? "The public profile is published."
          : "The profile remains unpublished.",
      });
    },
  });
  if (venueQuery.isLoading) return <FullLoadingState />;
  const field = <K extends keyof VenueForm>(key: K, value: VenueForm[K]) =>
    setValues((current) => ({ ...current, [key]: value }));
  return (
    <Container fluid className="dashboard-page">
      <Group justify="space-between" mb="xl">
        <Box>
          <Title>Venue profile</Title>
          <Text c="dimmed">
            Manage the complete public listing and publication state.
          </Text>
        </Box>
        <Badge color={values.published ? "teal" : "gray"}>
          {values.published ? "Published" : "Unpublished"}
        </Badge>
      </Group>
      <SimpleGrid cols={{ base: 1, md: 3 }}>
        <Paper p="xl">
          <ProfileAvatar name={values.displayName || "Venue"} role="Venue" />
          <Alert mt="lg" color="violet">
            Only your venue team can modify these details.
          </Alert>
          <Switch
            mt="lg"
            label="Publish public venue profile"
            checked={values.published}
            onChange={(e) => field("published", e.currentTarget.checked)}
          />
        </Paper>
        <Paper p="xl" style={{ gridColumn: "span 2" }}>
          <Stack>
            <TextInput
              label="Venue name"
              value={values.displayName}
              onChange={(e) => field("displayName", e.currentTarget.value)}
            />
            <TextInput
              label="Street address"
              value={values.address}
              onChange={(e) => field("address", e.currentTarget.value)}
            />
            <Group grow>
              <TextInput
                label="City"
                value={values.city}
                onChange={(e) => field("city", e.currentTarget.value)}
              />
              <NumberInput
                label="Capacity"
                min={1}
                value={values.capacity}
                onChange={(value) => field("capacity", value)}
              />
            </Group>
            <Textarea
              label="Bio"
              minRows={4}
              value={values.description}
              onChange={(e) => field("description", e.currentTarget.value)}
            />
            <Checkbox
              label="I confirm this information is ready for public display"
              checked={values.published}
              onChange={(e) => field("published", e.currentTarget.checked)}
            />
            <Button
              loading={mutation.isPending}
              onClick={() => mutation.mutate(values)}
            >
              Save venue profile
            </Button>
            <Button
              variant="outline"
              color={values.published ? "red" : "violet"}
              onClick={() =>
                mutation.mutate({ ...values, published: !values.published })
              }
            >
              {values.published ? "Unpublish venue" : "Publish venue"}
            </Button>
          </Stack>
        </Paper>
      </SimpleGrid>
    </Container>
  );
}
export const venuePagesReady = true;
