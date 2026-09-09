import React, { useState } from "react";
import "./HomePage.css";
import { useNavigate } from "react-router-dom";

/**
 * TODO:
 * Navigation for event buttons, artists?, venues, view all events/venues, search for events or venues or artists
 */

interface EventItem {
  id: number;
  tag: string;
  title: string;
  venue: string;
  date: string;
  price: string;
  image: string;
}

interface Artist {
  name: string;
  genre: string;
  image: string;
}

interface Venue {
  name: string;
  location: string;
  capacity: string;
  image: string;
}

const CATEGORIES: string[] = ["All", "Music", "Comedy", "Theater", "Sports", "Festivals", "DJ/Electronic"];

const EVENTS: EventItem[] = [
  {
    id: 1,
    tag: "DJ HYPERNOVA",
    title: "Neon Horizon Tour",
    venue: "The Soundstage Arena, LA",
    date: "Fri, Oct 24 • 9:00 PM",
    price: "45.00",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
  },
  {
    id: 2,
    tag: "MARCUS STERLING",
    title: "Late Night Laughs",
    venue: "Downtown Comedy Lounge",
    date: "Sat, Oct 25 • 8:00 PM",
    price: "25.00",
    image: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800&q=80",
  },
  {
    id: 3,
    tag: "STRATFORD THEATER GUILD",
    title: "The Tragedy of Hamlet",
    venue: "Grand Opera House",
    date: "Sun, Oct 26 • 2:00 PM",
    price: "60.00",
    image: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&q=80",
  },
];

const ARTISTS: Artist[] = [
  { name: "DJ Hypernova", genre: "Electronic", image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200&q=80" },
  { name: "Marcus Sterling", genre: "Comedy", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80" },
  { name: "Vance Duo", genre: "Indie Pop", image: "https://images.unsplash.com/photo-1521337581100-8ca9a73a5f79?w=200&q=80" },
  { name: "Alina Grace", genre: "R&B / Soul", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80" },
  { name: "Kinetix", genre: "Synthwave", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&q=80" },
  { name: "The Guild Players", genre: "Theater", image: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=200&q=80" },
];

const VENUES: Venue[] = [
  {
    name: "The Soundstage Arena",
    location: "Los Angeles, CA",
    capacity: "12,500",
    image: "https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=800&q=80",
  },
  {
    name: "Downtown Comedy Lounge",
    location: "San Francisco, CA",
    capacity: "450",
    image: "https://images.unsplash.com/photo-1470753937643-efeb931202a9?w=800&q=80",
  },
  {
    name: "Grand Opera House",
    location: "Chicago, IL",
    capacity: "2,200",
    image: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&q=80",
  },
];

/* ---------- Inline icon components (no icon library) ---------- */

const SearchIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

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

const FacebookIcon: React.FC = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon: React.FC = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TwitterIcon: React.FC = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </svg>
);

/* ---------- Layout components ---------- */

const NavBar: React.FC = () => {
  return (
    <header className="navbar">
      <div className="navbar-logo">
        <div className="logo-badge">E</div>
        <span>Eventa</span>
      </div>

      <div className="navbar-search">
        <SearchIcon />
        <input type="text" placeholder="Search artists, venues, locations..." />
      </div>

      <nav className="navbar-links">
        <a href="#" className="active">Events</a>
        <a href="#">Artists</a>
        <a href="#">Venues</a>
      </nav>

      <div className="navbar-actions">
        <button className="btn-ghost">Sign In</button>
        <button className="btn-primary">Sign Up</button>
      </div>
    </header>
  );
};

const Hero: React.FC = () => {
  const [query, setQuery] = useState<string>("");

  return (
    <section className="hero">
      <p className="hero-eyebrow">LIVE EXPERIENCES AWAIT</p>
      <h1>Discover Live Events Near You</h1>
      <div className="hero-search">
        <SearchIcon size={20} />
        <input
          type="text"
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          placeholder="Search artists, venues, comedy shows, live concerts..."
        />
        <button>Search</button>
      </div>
    </section>
  );
};

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
}

const SectionHeader= ({ title, linkText } : SectionHeaderProps) => {
  return (
    <div className="section-header">
      <h2>{title}</h2>
      <a href="#">{linkText} →</a>
    </div>
  );
};


const EventCard: React.FC<{ event: EventItem }> = ({ event }) => {
  // const navigate = useNavigate();

  return (
    <div className="card">
      <img src={event.image} alt={event.title} />
      <div className="card-body">
        <p className="card-tag">{event.tag}</p>
        <h3 className="card-title">{event.title}</h3>
        <div className="card-meta">
          <MapPinIcon />
          <span>{event.venue}</span>
        </div>
        <div className="card-meta">
          <CalendarIcon />
          <span>{event.date}</span>
        </div>
        <div className="card-footer">
          <div>
            <p className="card-price-label">TICKETS FROM</p>
            <p className="card-price">${event.price}</p>
          </div>
          <button
            className="btn-buy"
            onClick={(event) => {
              // navigate('/event-detail-page', { state: { event: event }})
            }}
          >Buy Tickets</button>
        </div>
      </div>
    </div>
  );
};

const ArtistItem: React.FC<{ artist: Artist }> = ({ artist }) => {
  return (
    <div className="artist-item">
      <img src={artist.image} alt={artist.name} />
      <p className="artist-name">{artist.name}</p>
      <p className="artist-genre">{artist.genre}</p>
    </div>
  );
};

const VenueCard: React.FC<{ venue: Venue }> = ({ venue }) => {
  return (
    <div className="card">
      <img className="venue-img" src={venue.image} alt={venue.name} />
      <div className="card-body">
        <p className="venue-name">{venue.name}</p>
        <div className="card-meta">
          <MapPinIcon />
          <span>{venue.location}</span>
        </div>
        <p className="venue-capacity">Capacity: {venue.capacity}</p>
      </div>
    </div>
  );
};

interface FooterColumnProps {
  title: string;
  links: string[];
}

const FooterColumn = ({ title, links } : FooterColumnProps) => {
  return (
    <div className="footer-col">
      <p className="footer-col-title">{title}</p>
      <ul>
        {links.map((link) => (
          <li key={link}>
            <a href="#">{link}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="footer-logo">
            <div className="logo-badge">E</div>
            <span>Eventa</span>
          </div>
          <p className="footer-desc">
            Your gateway to unforgettable live entertainment. Book verified tickets for
            concerts, theater, sports, and unique local events.
          </p>
        </div>

        <FooterColumn title="Explore" links={["All Events", "Sitemap", "Promotions"]} />
        <FooterColumn title="For Partners" links={["List an Event", "Venue Portal", "API Access"]} />
        <FooterColumn title="Company" links={["About Us", "Press Room", "Support"]} />
      </div>

      <div className="footer-bottom">
        <p className="footer-copy">© 2025 Eventa Platforms, Inc. All rights reserved.</p>
        <div className="footer-socials">
          <a href="#" aria-label="Facebook"><FacebookIcon /></a>
          <a href="#" aria-label="Instagram"><InstagramIcon /></a>
          <a href="#" aria-label="Twitter"><TwitterIcon /></a>
        </div>
      </div>
    </footer>
  );
};

const HomePage = () => {
  return (
    <div className="eventa">
      <NavBar />
      <Hero />
      {/* <CategoryPills /> */}

      <section>
        <SectionHeader title="Featured Live Events" linkText="View All Events" />
        <div className="grid-3">
          {EVENTS.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Popular Artists" linkText="Explore Artists" />
        <div className="artists-row">
          {ARTISTS.map((artist) => (
            <ArtistItem key={artist.name} artist={artist} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Top Venues" linkText="All Venues" />
        <div className="grid-3" style={{ paddingBottom: 16 }}>
          {VENUES.map((venue) => (
            <VenueCard key={venue.name} venue={venue} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
export { SectionHeader, EVENTS, EventCard };
