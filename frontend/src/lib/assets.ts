import artistFallback from "../assets/artist-portrait.jpeg";
import concertFallback from "../assets/event-banner.png";
import venueFallback from "../assets/concert-night.png";
import artistGlassAtlas from "../assets/artist-glass-atlas.jpg";
import artistLunaPark from "../assets/artist-luna-park.jpg";
import artistMilesReed from "../assets/artist-miles-reed-quartet.jpg";
import artistNeonCurrent from "../assets/artist-neon-current.jpg";
import artistComets from "../assets/artist-the-comets.jpg";
import venueAtlasHall from "../assets/venue-atlas-hall.jpg";
import venueAurora from "../assets/venue-aurora-theatre.jpg";
import venueGarden from "../assets/venue-garden-amphitheatre.jpg";
import venueHarbor from "../assets/venue-harbor-room.jpg";
import venueJunction from "../assets/venue-junction-live.jpg";

const normalize = (value?: string) =>
  (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const artistAssets: Record<string, string> = {
  "art-echoes": artistNeonCurrent,
  "art-luna": artistLunaPark,
  "art-glass": artistGlassAtlas,
  "art-blue": artistMilesReed,
  "neon-current": artistNeonCurrent,
  "luna-park": artistLunaPark,
  "glass-atlas": artistGlassAtlas,
  "marlowe-quartet": artistMilesReed,
  "miles-reed-quartet": artistMilesReed,
  "the-comets": artistComets,
};

const venueAssets: Record<string, string> = {
  "ven-aurora": venueAurora,
  "ven-harbour": venueHarbor,
  "ven-junction": venueJunction,
  "aurora-theatre": venueAurora,
  "harbour-hall": venueHarbor,
  "harbor-room": venueHarbor,
  "junction-live": venueJunction,
  "atlas-hall": venueAtlasHall,
  "garden-amphitheatre": venueGarden,
};

const resolve = (
  explicit: string | undefined,
  map: Record<string, string>,
  identifiers: string[],
  fallback: string,
) => {
  if (explicit) return explicit;
  for (const identifier of identifiers) {
    const key = normalize(identifier);
    if (map[key]) return map[key];
    const match = Object.entries(map).find(
      ([candidate]) => key.includes(candidate) || candidate.includes(key),
    );
    if (match) return match[1];
  }
  return fallback;
};

export const eventImage = (entity: {
  image?: string;
  id: string;
  title: string;
  venueId?: string;
  venue?: string;
}) =>
  resolve(
    entity.image,
    venueAssets,
    [entity.venueId ?? "", entity.venue ?? ""],
    concertFallback,
  );

export const venueImage = (entity: {
  image?: string;
  id: string;
  name: string;
}) =>
  resolve(entity.image, venueAssets, [entity.id, entity.name], venueFallback);

export const artistImage = (entity: {
  image?: string;
  id: string;
  name: string;
}) =>
  resolve(entity.image, artistAssets, [entity.id, entity.name], artistFallback);

export const fallbackImages = {
  event: concertFallback,
  venue: venueFallback,
  artist: artistFallback,
};
