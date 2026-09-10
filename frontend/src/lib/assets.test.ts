import { describe, expect, it } from "vitest";
import { artistImage, eventImage, fallbackImages, venueImage } from "./assets";

describe("local entity artwork", () => {
  it.each([
    ["Atlas Hall", "venue-atlas-hall.jpg"],
    ["Harbor Room", "venue-harbor-room.jpg"],
    ["Garden Amphitheatre", "venue-garden-amphitheatre.jpg"],
    ["Aurora Theatre", "venue-aurora-theatre.jpg"],
    ["Junction Live", "venue-junction-live.jpg"],
  ])("resolves %s to generated Venue art", (name, file) => {
    expect(venueImage({ id: "unknown", name })).toContain(file);
  });

  it.each([
    ["The Comets", "artist-the-comets.jpg"],
    ["Neon Current", "artist-neon-current.jpg"],
    ["Miles Reed Quartet", "artist-miles-reed-quartet.jpg"],
    ["Luna Park", "artist-luna-park.jpg"],
    ["Glass Atlas", "artist-glass-atlas.jpg"],
  ])("resolves %s to generated Artist art", (name, file) => {
    expect(artistImage({ id: "unknown", name })).toContain(file);
  });

  it("reuses Venue artwork for related Event cards", () => {
    expect(
      eventImage({
        id: "42",
        title: "Comets Homecoming",
        venueId: "1",
        venue: "Atlas Hall",
      }),
    ).toContain("venue-atlas-hall.jpg");
  });

  it("honors explicit local image values", () => {
    expect(
      artistImage({ id: "artist", name: "Artist", image: "/custom.jpg" }),
    ).toBe("/custom.jpg");
  });

  it("uses deterministic fallbacks for unknown entities", () => {
    expect(venueImage({ id: "none", name: "Unknown" })).toBe(
      fallbackImages.venue,
    );
    expect(artistImage({ id: "none", name: "Unknown" })).toBe(
      fallbackImages.artist,
    );
  });
});
