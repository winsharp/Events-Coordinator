import {
  Alert,
  Badge,
  Box,
  Button,
  Container,
  Group,
  Modal,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  IconCalendarEvent,
  IconMapPin,
  IconPlus,
  IconSearch,
  IconSparkles,
  IconUsers,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import {
  EmptyState,
  EventCard,
  FullLoadingState,
  ProfileAvatar,
} from "../components/Cards";
import { useAuth } from "../context/AppContext";
import { formatDate } from "../lib/utils";
import type { Event } from "../types";
import { locationOptions, supportedGenres } from "../types";
import { venueImage } from "../lib/assets";

const capacityOptions = [
  "Any capacity",
  "Under 2,000",
  "2,000 – 10,000",
  "10,000+",
];
export function ArtistBookingPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [location, setLocation] = useState("All locations");
  const [capacity, setCapacity] = useState("Any capacity");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedVenue, setSelectedVenue] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const artistQuery = useQuery({
    queryKey: ["artist", "me"],
    queryFn: api.myArtist,
  });
  const venuesQuery = useQuery({
    queryKey: ["venues", "booking"],
    queryFn: () => api.venues({}),
  });
  const slotsQuery = useQuery({
    queryKey: ["slots", "booking"],
    queryFn: () => api.slots(),
  });
  const visibleVenues = useMemo(
    () =>
      (venuesQuery.data ?? []).filter((venue) => {
        const lm =
          location === "All locations" ||
          `${venue.city}, ${venue.region}` === location;
        const cm =
          capacity === "Any capacity" ||
          (capacity === "Under 2,000"
            ? venue.capacity < 2000
            : capacity === "2,000 – 10,000"
              ? venue.capacity >= 2000 && venue.capacity <= 10000
              : venue.capacity > 10000);
        const hs = (slotsQuery.data ?? []).some(
          (slot) =>
            slot.venueId === venue.id &&
            slot.status === "OPEN" &&
            (!dateFrom || slot.date >= dateFrom) &&
            (!dateTo || slot.date <= dateTo),
        );
        return lm && cm && hs;
      }),
    [venuesQuery.data, slotsQuery.data, location, capacity, dateFrom, dateTo],
  );
  useEffect(() => {
    if (!visibleVenues.some((venue) => venue.id === selectedVenue)) {
      const venue = visibleVenues[0];
      setSelectedVenue(venue?.id ?? "");
      setSelectedSlot(
        slotsQuery.data?.find(
          (slot) => slot.venueId === venue?.id && slot.status === "OPEN",
        )?.id ?? "",
      );
    }
  }, [visibleVenues, selectedVenue, slotsQuery.data]);
  const selectedVenueData = visibleVenues.find(
    (venue) => venue.id === selectedVenue,
  );
  const selectedSlotData = slotsQuery.data?.find(
    (slot) => slot.id === selectedSlot,
  );
  const artistName = artistQuery.data?.name ?? user?.displayName ?? "Artist";
  const request = useMutation({
    mutationFn: () => api.requestBooking({ slotId: selectedSlot, artistName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slots"] });
      queryClient.invalidateQueries({ queryKey: ["events", "artist"] });
      notifications.show({
        color: "teal",
        title: "Request sent",
        message: "The venue received your booking request.",
      });
    },
    onError: (err: unknown) =>
      notifications.show({
        color: "red",
        title: "Booking failed",
        message:
          err instanceof Error
            ? err.message
            : "Save your artist profile before requesting a slot.",
      }),
  });
  if (venuesQuery.isLoading || slotsQuery.isLoading || artistQuery.isLoading)
    return <FullLoadingState />;
  return (
    <Container fluid className="dashboard-page">
      <Box mb="lg">
        <Text className="section-kicker">ARTIST BOOKING</Text>
        <Title>Book a venue</Title>
        <Text c="dimmed">Find an open date for your next show.</Text>
      </Box>
      <Paper className="search-panel" p="md">
        <Group grow align="end">
          <Select
            label="Location"
            data={locationOptions}
            value={location}
            onChange={(v) => setLocation(v ?? "All locations")}
          />
          <Select
            label="Capacity"
            data={capacityOptions}
            value={capacity}
            onChange={(v) => setCapacity(v ?? "Any capacity")}
          />
          <TextInput
            type="date"
            label="From"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.currentTarget.value)}
          />
          <TextInput
            type="date"
            label="To"
            value={dateTo}
            onChange={(e) => setDateTo(e.currentTarget.value)}
          />
          <Button leftSection={<IconSearch size={17} />}>
            Search availability
          </Button>
        </Group>
      </Paper>
      <SimpleGrid cols={{ base: 1, xl: 3 }} mt="lg">
        <Stack style={{ gridColumn: "span 2" }}>
          {visibleVenues.length ? (
            visibleVenues.map((venue) => {
              const open = (slotsQuery.data ?? []).filter(
                (slot) =>
                  slot.venueId === venue.id &&
                  slot.status === "OPEN" &&
                  (!dateFrom || slot.date >= dateFrom) &&
                  (!dateTo || slot.date <= dateTo),
              );
              return (
                <Paper
                  key={venue.id}
                  p="md"
                  className={`booking-venue ${selectedVenue === venue.id ? "selected" : ""}`}
                  onClick={() => {
                    setSelectedVenue(venue.id);
                    setSelectedSlot(open[0]?.id ?? "");
                  }}
                >
                  <Group align="stretch" wrap="nowrap">
                    <div
                      className="booking-venue-art"
                      style={{ backgroundImage: `url(${venueImage(venue)})` }}
                    />
                    <Box flex={1}>
                      <Group justify="space-between">
                        <Title order={3}>{venue.name}</Title>
                        <Badge color="teal">Available</Badge>
                      </Group>
                      <Group gap={5} c="dimmed">
                        <IconMapPin size={15} />
                        <Text size="sm">
                          {venue.city}, {venue.region}
                        </Text>
                      </Group>
                      <Group gap="xl" mt="sm">
                        <Group gap={5}>
                          <IconUsers size={16} />
                          <Text size="sm">
                            {venue.capacity.toLocaleString()}
                          </Text>
                        </Group>
                      </Group>
                      <Text size="xs" c="dimmed" mt="sm">
                        Open dates
                      </Text>
                      <Group gap="xs" mt={5}>
                        {open.map((slot) => (
                          <Button
                            key={slot.id}
                            size="xs"
                            variant={
                              selectedSlot === slot.id ? "filled" : "outline"
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedVenue(venue.id);
                              setSelectedSlot(slot.id);
                            }}
                          >
                            {formatDate(slot.date, {
                              month: "short",
                              day: "numeric",
                              timeZone: "UTC",
                            })}
                          </Button>
                        ))}
                      </Group>
                    </Box>
                  </Group>
                </Paper>
              );
            })
          ) : (
            <EmptyState title="No venues match these filters" />
          )}
        </Stack>
        <Paper className="booking-summary" p="lg">
          <Group justify="space-between">
            <Title order={2}>
              {selectedVenueData?.name ?? "Select a venue"}
            </Title>
            {selectedVenueData && <Badge color="teal">Available</Badge>}
          </Group>
          {selectedVenueData && (
            <Text c="dimmed">
              <IconMapPin size={15} /> {selectedVenueData.city},{" "}
              {selectedVenueData.region}
            </Text>
          )}
          {selectedSlotData ? (
            <>
              <Text size="sm" mt="xl" fw={700}>
                Selected slot
              </Text>
              <Group mt="sm" c="violet">
                <IconCalendarEvent />
                <Text fw={800}>
                  {formatDate(selectedSlotData.date, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "UTC",
                  })}{" "}
                  · {selectedSlotData.start}
                </Text>
              </Group>
              <Stack mt="xl">
                <SummaryRow label="Artist" value={artistName} />
                <SummaryRow
                  label="Capacity"
                  value={selectedVenueData?.capacity.toLocaleString() ?? ""}
                />
                <SummaryRow
                  label="Slot length"
                  value={`${selectedSlotData.start} – ${selectedSlotData.end}`}
                />
              </Stack>
              <Alert mt="xl" color="violet">
                Booking creates a pending request for venue review.
              </Alert>
              <Button
                fullWidth
                size="lg"
                mt="md"
                leftSection={<IconSparkles />}
                loading={request.isPending}
                onClick={() => request.mutate()}
              >
                Request this slot
              </Button>
            </>
          ) : (
            <EmptyState title="Choose an open slot" />
          )}
        </Paper>
      </SimpleGrid>
    </Container>
  );
}
const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <Group justify="space-between">
    <Text c="dimmed" size="sm">
      {label}
    </Text>
    <Text size="sm" fw={600}>
      {value}
    </Text>
  </Group>
);
const TICKET_TYPE_OPTIONS = ["General Admission", "VIP", "Custom Type"];
const MAX_TIERS_PER_EVENT = 4;

function EventTierManager({ event }: { event: Event }) {
  const queryClient = useQueryClient();
  const [opened, setOpened] = useState(false);
  const [typeChoice, setTypeChoice] = useState(TICKET_TYPE_OPTIONS[0]);
  const [customName, setCustomName] = useState("");
  const [price, setPrice] = useState<number | "">(25);
  const [quantity, setQuantity] = useState<number | "">(100);

  const tiersQuery = useQuery({
    queryKey: ["tiers", event.id],
    queryFn: async () => {
      const all = await api.tiers(event.id);
      return all.filter((tier) => event.tierIds.includes(tier.id));
    },
  });
  const tiers = tiersQuery.data ?? [];
  const atLimit = tiers.length >= MAX_TIERS_PER_EVENT;

  const resetForm = () => {
    setTypeChoice(TICKET_TYPE_OPTIONS[0]);
    setCustomName("");
    setPrice(25);
    setQuantity(100);
  };

  const addTier = useMutation({
    mutationFn: () =>
      api.addTier(event.id, {
        name: typeChoice === "Custom Type" ? customName.trim() : typeChoice,
        price: Number(price),
        quantity: Number(quantity),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiers", event.id] });
      queryClient.invalidateQueries({ queryKey: ["events", "artist"] });
      notifications.show({ color: "teal", message: "Ticket type added" });
      setOpened(false);
      resetForm();
    },
    onError: (err: unknown) =>
      notifications.show({
        color: "red",
        title: "Couldn't add ticket type",
        message: err instanceof Error ? err.message : "Please try again.",
      }),
  });

  const nameValid =
    typeChoice !== "Custom Type" || customName.trim().length > 0;
  const canSubmit =
    !atLimit && nameValid && Number(price) > 0 && Number(quantity) > 0;

  return (
    <Paper p="lg" withBorder>
      <EventCard event={event} />
      <Group justify="space-between" mt="md">
        <Text fw={700} size="sm">
          Ticket types ({tiers.length}/{MAX_TIERS_PER_EVENT})
        </Text>
        <Button
          size="xs"
          variant="outline"
          leftSection={<IconPlus size={14} />}
          disabled={atLimit}
          onClick={() => setOpened(true)}
        >
          Add ticket type
        </Button>
      </Group>
      <Stack mt="sm" gap="xs">
        {tiers.length ? (
          tiers.map((tier) => (
            <Group key={tier.id} justify="space-between">
              <Text size="sm">{tier.name}</Text>
              <Text size="sm" c="dimmed">
                ${tier.price.toFixed(2)} · {tier.inventory} left
              </Text>
            </Group>
          ))
        ) : (
          <Text size="sm" c="dimmed">
            No ticket types yet — add up to {MAX_TIERS_PER_EVENT}.
          </Text>
        )}
      </Stack>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={`Add ticket type — ${event.title}`}
      >
        <Stack>
          <Select
            label="Ticket type"
            data={TICKET_TYPE_OPTIONS}
            value={typeChoice}
            onChange={(value) =>
              setTypeChoice(value ?? TICKET_TYPE_OPTIONS[0])
            }
          />
          {typeChoice === "Custom Type" && (
            <TextInput
              label="Custom ticket name"
              value={customName}
              onChange={(e) => setCustomName(e.currentTarget.value)}
            />
          )}
          <NumberInput
            label="Price"
            prefix="$"
            min={0.01}
            decimalScale={2}
            fixedDecimalScale
            value={price}
            onChange={(value) => setPrice(value === "" ? "" : Number(value))}
          />
          <NumberInput
            label="Quantity"
            min={1}
            value={quantity}
            onChange={(value) =>
              setQuantity(value === "" ? "" : Number(value))
            }
          />
          <Button
            loading={addTier.isPending}
            disabled={!canSubmit}
            onClick={() => addTier.mutate()}
          >
            Add ticket type
          </Button>
        </Stack>
      </Modal>
    </Paper>
  );
}
export function ArtistEventsPage() {
  const query = useQuery({
    queryKey: ["events", "artist"],
    queryFn: api.artistEvents,
  });
  if (query.isLoading) return <FullLoadingState />;
  const confirmed = (query.data ?? []).filter(
    (event) => event.status !== "PENDING",
  );
  const pending = (query.data ?? []).filter(
    (event) => event.status === "PENDING",
  );
  return (
    <Container fluid className="dashboard-page">
      <Title>Artist events</Title>
      <Text c="dimmed" mb="xl">
        Track confirmed shows and pending venue requests for your account.
      </Text>
      <Title order={2} mb="md">
        Confirmed events
      </Title>
      {confirmed.length ? (
        <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }}>
          {confirmed.map((event) => (
            <EventTierManager event={event} key={event.id} />
          ))}
        </SimpleGrid>
      ) : (
        <EmptyState title="No confirmed events" />
      )}
      <Title order={2} mt="xl" mb="md">
        Pending requests
      </Title>
      {pending.length ? (
        <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }}>
          {pending.map((event) => (
            <Paper key={event.id} p="lg" withBorder>
              <Badge color="yellow">Pending</Badge>
              <Title order={3} mt="sm">
                {event.title}
              </Title>
              <Text>{event.venue}</Text>
              <Text c="dimmed">
                {formatDate(event.date)} · {event.time}
              </Text>
            </Paper>
          ))}
        </SimpleGrid>
      ) : (
        <EmptyState title="No pending requests" />
      )}
    </Container>
  );
}
interface ArtistForm {
  stageName: string;
  genre: string;
  bio: string;
}
export function ArtistProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const artistQuery = useQuery({
    queryKey: ["artist", "me"],
    queryFn: api.myArtist,
  });
  const [values, setValues] = useState<ArtistForm>({
    stageName: "",
    genre: supportedGenres[0] ?? "",
    bio: "",
  });
  useEffect(() => {
    const artist = artistQuery.data;
    if (artist)
      setValues({
        stageName: artist.name,
        genre: artist.genre,
        bio: artist.bio,
      });
  }, [artistQuery.data]);
  const mutation = useMutation({
    mutationFn: (next: ArtistForm) => api.saveArtistProfile(next),
    onSuccess: (artist) => {
      queryClient.setQueryData(["artist", "me"], artist);
      notifications.show({ color: "teal", message: "Artist profile updated" });
    },
    onError: (err: unknown) =>
      notifications.show({
        color: "red",
        title: "Couldn't save the artist profile",
        message: err instanceof Error ? err.message : "Please try again.",
      }),
  });
  if (artistQuery.isLoading) return <FullLoadingState />;
  const field = <K extends keyof ArtistForm>(key: K, value: ArtistForm[K]) =>
    setValues((current) => ({ ...current, [key]: value }));
  return (
    <Container fluid className="dashboard-page">
      <Title>Artist profile</Title>
      <Text c="dimmed" mb="xl">
        Share your stage name, genre, and bio.
      </Text>
      <SimpleGrid cols={{ base: 1, md: 3 }}>
        <Paper p="xl">
          <ProfileAvatar
            name={values.stageName || user?.displayName || "Artist"}
            role="Artist"
          />
        </Paper>
        <Paper p="xl" style={{ gridColumn: "span 2" }}>
          <Stack>
            <TextInput
              label="Stage name"
              value={values.stageName}
              onChange={(e) => field("stageName", e.currentTarget.value)}
            />
            <Select
              label="Genre"
              data={supportedGenres}
              value={values.genre}
              onChange={(value) => field("genre", value ?? values.genre)}
            />
            <Textarea
              label="Bio"
              minRows={4}
              placeholder="Tell fans and venues about yourself"
              value={values.bio}
              onChange={(e) => field("bio", e.currentTarget.value)}
            />
            <Button
              loading={mutation.isPending}
              onClick={() => mutation.mutate(values)}
            >
              Save artist profile
            </Button>
          </Stack>
        </Paper>
      </SimpleGrid>
    </Container>
  );
}
export const artistPagesReady = true;
