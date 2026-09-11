import {
  Badge,
  Box,
  Button,
  Container,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import {
  IconArrowRight,
  IconCalendarEvent,
  IconMapPin,
  IconSearch,
  IconUsers,
} from "@tabler/icons-react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import {
  ArtistCard,
  EmptyState,
  ErrorState,
  EventCard,
  LoadingState,
  VenueCard,
} from "../components/Cards";
import {
  artists as artistFixtures,
  discoveryTitle,
  events as eventFixtures,
  genreOptions,
  locationOptions,
  venues as venueFixtures,
} from "../types";
import type { Artist, Event, Venue } from "../types";
import { formatCompactNumber } from "../lib/utils";
import concertImage from "../assets/event-banner.png";
import { artistImage, eventImage, venueImage } from "../lib/assets";

function SearchPanel({
  mode = "events",
}: {
  mode?: "events" | "venues" | "artists";
}) {
  const [params, setParams] = useSearchParams();
  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value && !value.startsWith("All ")) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };
  return (
    <Paper className="search-panel" p="md" radius="lg">
      <Group grow align="end">
        <TextInput
          label="Search"
          placeholder={
            mode === "events"
              ? "Artist, event, or venue"
              : mode === "venues"
                ? "Venue or city"
                : "Artist or genre"
          }
          leftSection={<IconSearch size={17} />}
          value={params.get("query") ?? ""}
          onChange={(event) => update("query", event.currentTarget.value)}
        />
        <Select
          label="Location"
          data={locationOptions}
          value={params.get("location") ?? "All locations"}
          onChange={(value) => update("location", value)}
        />
        {mode !== "venues" && (
          <Select
            label="Genre"
            data={genreOptions}
            value={params.get("genre") ?? "All genres"}
            onChange={(value) => update("genre", value)}
          />
        )}
        <Button onClick={() => setParams({})} variant="light">
          Clear filters
        </Button>
      </Group>
    </Paper>
  );
}

export function HomePage() {
  const eventsQuery = useQuery({
    queryKey: ["events", "featured"],
    queryFn: () => api.events({}),
  });
  const venuesQuery = useQuery({
    queryKey: ["venues", "featured"],
    queryFn: () => api.venues({}),
  });
  const artistsQuery = useQuery({
    queryKey: ["artists", "featured"],
    queryFn: () => api.artists({}),
  });
  const events = eventsQuery.data ?? eventFixtures;
  const venues = venuesQuery.data ?? venueFixtures;
  const artists = artistsQuery.data ?? artistFixtures;
  const heroEvent = events.find((event) => event.featured) ?? events[0];
  return (
    <>
      <section className="hero-section">
        <Container size="xl">
          <div className="hero-grid">
            <Box>
              <Text className="eyebrow">LIVE EXPERIENCES, CURATED FOR YOU</Text>
              <Title className="hero-title">{discoveryTitle}</Title>
              <Text className="hero-copy">
                Search local stages, iconic venues, and artists worth seeing
                before everyone else knows their name.
              </Text>
              <Group mt="xl">
                <Button
                  component={Link}
                  to="/events"
                  size="lg"
                  rightSection={<IconArrowRight size={19} />}
                >
                  Explore events
                </Button>
                <Button
                  component={Link}
                  to="/venues"
                  size="lg"
                  variant="outline"
                  className="hero-secondary"
                >
                  Find a venue
                </Button>
              </Group>
              <Group mt="xl" gap="xl">
                <Box>
                  <Title order={3}>120+</Title>
                  <Text size="sm" c="gray.4">
                    live events
                  </Text>
                </Box>
                <Box>
                  <Title order={3}>32</Title>
                  <Text size="sm" c="gray.4">
                    independent stages
                  </Text>
                </Box>
                <Box>
                  <Title order={3}>3</Title>
                  <Text size="sm" c="gray.4">
                    ways to pay
                  </Text>
                </Box>
              </Group>
            </Box>
            <div
              className="hero-art"
              style={{
                backgroundImage: heroEvent
                  ? `url(${eventImage(heroEvent)})`
                  : `url(${concertImage})`,
              }}
            >
              {heroEvent && (
                <div className="hero-floating-card">
                  <Badge color="pink">Featured</Badge>
                  <Title order={3}>{heroEvent.title}</Title>
                  <Text>
                    {heroEvent.artist} · {heroEvent.city}
                  </Text>
                  <Button
                    component={Link}
                    to={`/events/${heroEvent.id}`}
                    mt="sm"
                    size="sm"
                  >
                    Choose tickets
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>
      <section className="content-section">
        <Container size="xl">
          <Group justify="space-between" mb="lg">
            <Box>
              <Text className="section-kicker">CURATED NOW</Text>
              <Title order={2}>Trending near you</Title>
            </Box>
            <Button
              component={Link}
              to="/events"
              variant="subtle"
              rightSection={<IconArrowRight size={17} />}
            >
              See all events
            </Button>
          </Group>
          {eventsQuery.isLoading ? (
            <LoadingState />
          ) : eventsQuery.isError ? (
            <ErrorState retry={() => eventsQuery.refetch()} />
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
              {events.slice(0, 3).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </SimpleGrid>
          )}
        </Container>
      </section>
      <section className="genre-strip">
        <Container size="xl">
          <Title order={2} mb="lg">
            Browse by genre
          </Title>
          <Group>
            {genreOptions.slice(1).map((genre, index) => (
              <Button
                key={genre}
                component={Link}
                to={`/events?genre=${encodeURIComponent(genre)}`}
                className={`genre-pill genre-${index}`}
                variant="light"
              >
                {genre}
              </Button>
            ))}
          </Group>
        </Container>
      </section>
      <section className="content-section">
        <Container size="xl">
          <Group justify="space-between" mb="lg">
            <Title order={2}>Popular venues</Title>
            <Button component={Link} to="/venues" variant="subtle">
              See all venues
            </Button>
          </Group>
          {venuesQuery.isLoading ? (
            <LoadingState />
          ) : (
            <SimpleGrid cols={{ base: 1, md: 3 }}>
              {venues.slice(0, 3).map((venue) => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </SimpleGrid>
          )}
        </Container>
      </section>
      <section className="content-section artist-section">
        <Container size="xl">
          <Title order={2} mb="lg">
            Artists to watch
          </Title>
          {artistsQuery.isLoading ? (
            <LoadingState cards={4} />
          ) : (
            <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }}>
              {artists.slice(0, 4).map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </SimpleGrid>
          )}
        </Container>
      </section>
    </>
  );
}

export function EventsPage() {
  const [params] = useSearchParams();
  const filters = {
    query: params.get("query") ?? "",
    genre: params.get("genre") ?? "All genres",
    location: params.get("location") ?? "All locations",
  };
  const query = useQuery({
    queryKey: ["events", filters],
    queryFn: () => api.events(filters),
  });
  return (
    <>
      <PageHero
        eyebrow="DISCOVER YOUR NEXT NIGHT"
        title="Live events"
        copy="Browse upcoming shows by artist, venue, city, or sound."
        image
      />
      <Container size="xl" className="browse-container">
        <SearchPanel />
        {query.isLoading ? (
          <LoadingState cards={6} />
        ) : query.isError ? (
          <ErrorState retry={() => query.refetch()} />
        ) : query.data?.length ? (
          <>
            <Text c="dimmed" mb="md">
              {query.data.length} {query.data.length === 1 ? "event" : "events"}{" "}
              found
            </Text>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
              {query.data.map((event) => (
                <EventCard event={event} key={event.id} />
              ))}
            </SimpleGrid>
          </>
        ) : (
          <EmptyState
            title="No events match these filters"
            description="Clear a filter or try a broader city search."
          />
        )}
      </Container>
    </>
  );
}

export function VenuesPage() {
  const [params] = useSearchParams();
  const filters = {
    query: params.get("query") ?? "",
    location: params.get("location") ?? "All locations",
  };
  const query = useQuery({
    queryKey: ["venues", filters],
    queryFn: () => api.venues(filters),
  });
  return (
    <>
      <PageHero
        eyebrow="ROOMS WITH CHARACTER"
        title="Venues built for live music"
        copy="From independent rooms to landmark arenas, find the right atmosphere."
      />
      <Container size="xl" className="browse-container">
        <SearchPanel mode="venues" />
        {query.isLoading ? (
          <LoadingState />
        ) : query.data?.length ? (
          <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }}>
            {query.data.map((venue) => (
              <VenueCard venue={venue} key={venue.id} />
            ))}
          </SimpleGrid>
        ) : (
          <EmptyState title="No venues found" />
        )}
      </Container>
    </>
  );
}

export function ArtistsPage() {
  const [params] = useSearchParams();
  const filters = {
    query: params.get("query") ?? "",
    genre: params.get("genre") ?? "All genres",
    location: params.get("location") ?? "All locations",
  };
  const query = useQuery({
    queryKey: ["artists", filters],
    queryFn: () => api.artists(filters),
  });
  return (
    <>
      <PageHero
        eyebrow="MEET THE LINEUP"
        title="Artists to watch"
        copy="Follow fresh voices and return to the artists you already love."
      />
      <Container size="xl" className="browse-container">
        <SearchPanel mode="artists" />
        {query.isLoading ? (
          <LoadingState cards={4} />
        ) : query.data?.length ? (
          <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }}>
            {query.data.map((artist) => (
              <ArtistCard artist={artist} key={artist.id} />
            ))}
          </SimpleGrid>
        ) : (
          <EmptyState title="No artists found" />
        )}
      </Container>
    </>
  );
}

function PageHero({
  eyebrow,
  title,
  copy,
  image = false,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  image?: boolean;
}) {
  return (
    <section
      className={`page-hero ${image ? "page-hero-image" : ""}`}
      style={
        image
          ? {
              backgroundImage: `linear-gradient(90deg,rgba(7,17,38,.98),rgba(23,8,52,.72)),url(${concertImage})`,
            }
          : undefined
      }
    >
      <Container size="xl">
        <Text className="eyebrow">{eyebrow}</Text>
        <Title>{title}</Title>
        <Text c="gray.3" maw={620}>
          {copy}
        </Text>
      </Container>
    </section>
  );
}

export function PublicVenueDetailPage() {
  const { id } = useParams();
  const venueQuery = useQuery({
    queryKey: ["venue", id],
    queryFn: () => api.venue(id!),
  });
  const eventsQuery = useQuery({
    queryKey: ["events", "venue", id],
    queryFn: () => api.events({}),
  });
  if (venueQuery.isLoading)
    return (
      <Container size="xl" py={80}>
        <LoadingState />
      </Container>
    );
  if (!venueQuery.data)
    return (
      <Container size="xl" py={80}>
        <EmptyState title="Venue not found" />
      </Container>
    );
  const venue = venueQuery.data;
  const shows = eventsQuery.data?.filter((event) => event.venueId === id) ?? [];
  return (
    <>
      <section
        className="page-hero page-hero-image"
        style={{
          backgroundImage: `linear-gradient(90deg,rgba(7,17,38,.96),rgba(23,8,52,.65)),url(${venueImage(venue)})`,
        }}
      >
        <Container size="xl">
          <Text className="eyebrow">
            {venue.city.toUpperCase()} · {venue.capacity.toLocaleString()}{" "}
            CAPACITY
          </Text>
          <Title>{venue.name}</Title>
          <Text c="gray.3" maw={620}>
            {venue.description}
          </Text>
        </Container>
      </section>
      <Container size="xl" className="detail-container">
        <SimpleGrid cols={{ base: 1, md: 3 }}>
          <Paper p="lg" radius="lg" className="detail-info">
            <IconMapPin />
            <Title order={3}>Visit the venue</Title>
            <Text>{venue.address}</Text>
            <Text>
              {venue.city}, {venue.region}
            </Text>
          </Paper>
          <Paper p="lg" radius="lg" className="detail-info">
            <IconUsers />
            <Title order={3}>Capacity</Title>
            <Text>{venue.capacity.toLocaleString()} people</Text>
          </Paper>
          <Paper p="lg" radius="lg" className="detail-info">
            <IconCalendarEvent />
            <Title order={3}>Upcoming shows</Title>
            <Text>{shows.length} announced</Text>
          </Paper>
        </SimpleGrid>
        <Title order={2} mt={50} mb="lg">
          Upcoming at {venue.name}
        </Title>
        {shows.length ? (
          <SimpleGrid cols={{ base: 1, md: 3 }}>
            {shows.map((event) => (
              <EventCard event={event} key={event.id} />
            ))}
          </SimpleGrid>
        ) : (
          <EmptyState title="No announced shows" />
        )}
      </Container>
    </>
  );
}

export function PublicArtistDetailPage() {
  const { id } = useParams();
  const artistQuery = useQuery({
    queryKey: ["artist", id],
    queryFn: () => api.artist(id!),
  });
  const eventsQuery = useQuery({
    queryKey: ["events", "artist", id],
    queryFn: () => api.events({}),
  });
  if (artistQuery.isLoading)
    return (
      <Container size="xl" py={80}>
        <LoadingState />
      </Container>
    );
  if (!artistQuery.data)
    return (
      <Container size="xl" py={80}>
        <EmptyState title="Artist not found" />
      </Container>
    );
  const artist = artistQuery.data;
  const shows =
    eventsQuery.data?.filter((event) => event.artistId === id) ?? [];
  return (
    <>
      <section className="artist-detail-hero">
        <Container size="xl">
          <Group gap={40}>
            <img src={artistImage(artist)} alt={`${artist.name} portrait`} />
            <Box>
              <Badge size="lg">{artist.genre}</Badge>
              <Title>{artist.name}</Title>
              <Text c="gray.3" maw={620}>
                {artist.bio}
              </Text>
              <Text mt="md" fw={700}>
                {formatCompactNumber(artist.followers)} followers ·{" "}
                {artist.city}
              </Text>
            </Box>
          </Group>
        </Container>
      </section>
      <Container size="xl" className="detail-container">
        <Title order={2} mb="lg">
          Upcoming shows
        </Title>
        {shows.length ? (
          <SimpleGrid cols={{ base: 1, md: 3 }}>
            {shows.map((event) => (
              <EventCard event={event} key={event.id} />
            ))}
          </SimpleGrid>
        ) : (
          <EmptyState title="No announced shows" />
        )}
      </Container>
    </>
  );
}

export type BrowseEntity = Event | Venue | Artist;
export const browseModes = ["events", "venues", "artists"] as const;
export const publicPageReady = true;
