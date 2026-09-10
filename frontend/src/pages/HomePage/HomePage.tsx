import React, { useCallback, useEffect, useState, useMemo, useRef, type EventHandler, type MouseEventHandler} from "react";
import "./HomePage.css";
import { Link, useNavigate } from "react-router-dom";
import FloatingSearchBar, { type SearchItem } from "../../components/FloatingSearchBar";
import { useData, type Artist, type Event, type Venue } from "../../context/DataContext";

/**
 * TODO:
 * Navigation for event buttons, artists?, venues, view all events/venues, search for events or venues or artists
 */

const CATEGORIES: string[] = ["All", "Music", "Comedy", "Theater", "Sports", "Festivals", "DJ/Electronic"];

const MapPinIcon: React.FC = () => (
  <svg className="icon" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CalendarIcon: React.FC = () => (
  <svg className="icon" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const CategoryPills: React.FC = () => {
  const [active, setActive] = useState<string>("All");

  return (
    <div className="categories">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          className={`pill ${active === cat ? "active" : ""}`}
          onClick={() => setActive(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

interface SectionHeaderProps {
  title: string;
  linkText: string;
  link: string;
}

const SectionHeader= ({ title, linkText, link} : SectionHeaderProps) => {
  return (
    <div className="section-header">
      <h2>{title}</h2>
      <div>
        <Link to={link}>{linkText}</Link>
        <span aria-hidden="true"> &rarr;</span>
      </div>
    </div>
  );
};


const EventCard: React.FC<{ event: Event }> = ({ event }) => {
  const navigate = useNavigate();

  return (
    <div
      className="card"
      onClick={() => {
        navigate(`/events/${event.id}`, {
          state: { event },
        });
      }}
    >
      <img src={event.image || "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80"} alt={event.title} />
      <div className="card-body">
        {/* <p className="card-tag">{event.description}</p> */}
        <h3 className="card-title">{event.title}</h3>
        <div className="card-meta">
          <MapPinIcon />
          <span>{event.venue.name}</span>
        </div>
        <div className="card-meta">
          <CalendarIcon />
          <span>{event.date}</span>
        </div>
        <div className="card-footer">
          <div>
            <p className="card-price-label">TICKETS FROM</p>
            <p className="card-price">${event.price || 50}</p>
          </div>
          <button
            className="btn-buy"
            onClick={() => {
              navigate(`/events/${event.id}`, {
                state: { event },
              });
            }}
          >Buy Tickets</button>
        </div>
      </div>
    </div>
  );
};

const ArtistItem: React.FC<{ artist: Artist }> = ({ artist }) => {
  const defaultImage = "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200&q=80";
  return (
    <div className="artist-item">
      <img src={artist.image || defaultImage} alt={artist.stageName} />
      <p className="artist-name">{artist.stageName}</p>
    </div>
  );
};

const VenueCard: React.FC<{ venue: Venue }> = ({ venue }) => {
  return (
    <div className="card">
      <img className="venue-img" src={venue.image || "https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=800&q=80"} alt={venue.name} />
      <div className="card-body">
        <p className="venue-name">{venue.name}</p>
        <div className="card-meta">
          <MapPinIcon />
          <span>{venue.city}</span>
        </div>
        <p className="venue-capacity">Capacity: {venue.capacity}</p>
      </div>
    </div>
  );
};

const HomePage = () => {
  const { events, venues, artists, loadEvents, loadArtists, loadVenues } = useData();

  const eventItems: SearchItem[] = events.map( (e: Event) : SearchItem => ({id: e.id.toString(), category: "event", title: e.title || ""}));
  const venueItems: SearchItem[] = venues.map( (v: Venue) : SearchItem => ({id: v.id.toString(), category: "venue", title: v.name || ""}));
  const artistItems: SearchItem[] = artists.map( (a: Artist) : SearchItem => ({id: a.id.toString(), category: "artist", title: a.stageName || ""}));
  const searchItems: SearchItem[] = [...eventItems, ...venueItems, ...artistItems];

  const navigate = useNavigate();

  console.log(searchItems);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    loadVenues();
  }, []);

  useEffect(() => {
    loadArtists();
  }, []);

  return (
    <div className="eventa">

      <section className="hero">
        <p className="hero-eyebrow">LIVE EXPERIENCES AWAIT</p>
        <h1>Discover Live Events Near You</h1>
        <FloatingSearchBar 
          items={searchItems}
          onSelect={(item: SearchItem) => {{
            if (item.category === "event") {
              navigate(`/events/${item.id}`);
            }
            if (item.category === "venue") {
              navigate(`/venues/${item.id}`);
            }
            if (item.category === "artist") {
              navigate(`/artists/${item.id}`);
            }
          }}}
        />
      </section>

      <section>
        <SectionHeader title="Featured Live Events" linkText="View All Events" link='/events'/>
        <div className="grid-3">
          {events.slice(0, 3).map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Popular Artists" linkText="Explore Artists" link='/artists'/>
        <div className="artists-row">
          {artists.slice(0, 5).map((artist) => (
            <ArtistItem key={artist.id} artist={artist} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Top Venues" linkText="All Venues" link='/venues'/>
        <div className="grid-3" style={{ paddingBottom: 16 }}>
          {venues.slice(0, 3).map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
export { SectionHeader, EventCard };
