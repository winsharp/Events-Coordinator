import {
  Alert,
  Badge,
  Box,
  Button,
  Container,
  Group,
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
  IconMusic,
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
import { genreOptions, locationOptions, supportedGenres } from "../types";
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
  const [genre, setGenre] = useState("All genres");
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
        const gm = genre === "All genres" || venue.genres.includes(genre);
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
        return lm && gm && cm && hs;
      }),
    [
      venuesQuery.data,
      slotsQuery.data,
      location,
      capacity,
      genre,
      dateFrom,
      dateTo,
    ],
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
          <Select
            label="Genre fit"
            data={genreOptions}
            value={genre}
            onChange={(v) => setGenre(v ?? "All genres")}
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
                        <Group gap={5}>
                          <IconMusic size={16} />
                          <Text size="sm">
                            {venue.genres.slice(0, 2).join(", ")}
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
            <EventCard event={event} key={event.id} />
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
