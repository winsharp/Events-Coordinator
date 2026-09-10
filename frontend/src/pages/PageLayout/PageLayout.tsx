import { Link, Outlet, useLocation } from 'react-router-dom';
import FloatingSearchBar from '../../components/FloatingSearchBar.tsx';

import './PageLayout.css';

const NavBar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="navbar">
      <div className="navbar-logo">
        <div className="logo-badge">E</div>
        <Link to='/home'>Eventa</Link>
      </div>

      {/* <FloatingSearchBar items={[]}/> */}

      <nav className="navbar-links">
        <Link 
          to='/events'
          className={`nav-link ${isActive('/events') ? 'active' : ''}`}
        >Events</Link>

        <Link
          to='/artists'
          className={`nav-link ${isActive('/artists') ? 'active' : ''}`}
        >Artists</Link>

        <Link 
          to='/venues'
          className={`nav-link ${isActive('/venues') ? 'active' : ''}`}
        >Venues</Link>
      </nav>

      <div className="navbar-actions">
        <Link
          to='/login'
          className={`nav-link btn-ghost ${isActive('/login') ? 'active' : ''}`}
        >Sign In</Link>

        <Link
          to='/register'
          className={`nav-link btn-primary ${isActive('/register') ? 'active' : ''}`}
        >Sign Up</Link>
      </div>
    </header>
  );
};

interface FooterColumnProps {
  title: string;
  links: string[];
}

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

export default function PageLayout() {
  return (
    <>
      <NavBar/>
      <Outlet/>
      <Footer/>
    </>
  );
}
