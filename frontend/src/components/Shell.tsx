import {
  Avatar,
  Box,
  Burger,
  Button,
  Container,
  Divider,
  Drawer,
  Group,
  Menu,
  NavLink,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconBuilding,
  IconCalendar,
  IconChevronDown,
  IconHistory,
  IconHome,
  IconLogout,
  IconMicrophone2,
  IconSearch,
  IconTicket,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import {
  Link,
  NavLink as RouterNavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { copyright, footerGroups } from "../types";
import { initials } from "../lib/utils";
import { useAuth } from "../context/AppContext";

const publicLinks = [
  ["Discover", "/"],
  ["Events", "/events"],
  ["Venues", "/venues"],
  ["Artists", "/artists"],
];

export function Logo({ light = true }: { light?: boolean }) {
  return (
    <Link to="/" className={`logo ${light ? "logo-light" : ""}`}>
      <span>Ticket</span>
      <strong>Genie</strong>
      <sup>✦</sup>
    </Link>
  );
}

export function Header() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const { user, logout, home } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const links = user
    ? [
        ["Discover", "/"],
        ...(user.role === "CUSTOMER"
          ? [
              ["My tickets", "/customer/tickets"],
              ["Orders", "/customer/orders"],
            ]
          : user.role === "ARTIST"
            ? [
                ["Book a venue", "/artist"],
                ["Confirmed events", "/artist/events"],
              ]
            : [
                ["Dashboard", "/venue"],
                ["Availability", "/venue/availability"],
                ["Bookings", "/venue/bookings"],
              ]),
      ]
    : publicLinks;

  const account = user ? (
    <Menu width={220} position="bottom-end">
      <Menu.Target>
        <Button
          variant="subtle"
          color="gray"
          className="account-button"
          leftSection={
            <Avatar size={32} color="violet">
              {initials(user.displayName)}
            </Avatar>
          }
          rightSection={<IconChevronDown size={15} />}
        >
          {user.displayName}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>{user.role}</Menu.Label>
        <Menu.Item
          leftSection={<IconHome size={16} />}
          onClick={() => navigate(home)}
        >
          Dashboard
        </Menu.Item>
        <Menu.Item
          leftSection={<IconUser size={16} />}
          onClick={() => navigate(`${home}/profile`)}
        >
          Profile
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          color="red"
          leftSection={<IconLogout size={16} />}
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          Log out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  ) : (
    <Group gap="sm">
      <Button
        component={Link}
        to="/login"
        variant="outline"
        className="header-login"
      >
        Log in
      </Button>
      <Button component={Link} to="/register">
        Sign up
      </Button>
    </Group>
  );

  return (
    <header className="site-header">
      <Container size="xl" h="100%">
        <Group h="100%" justify="space-between" wrap="nowrap">
          <Logo />
          <TextInput
            visibleFrom="sm"
            className="header-search"
            leftSection={<IconSearch size={17} />}
            placeholder="Search artists, events or venues"
            aria-label="Search TicketGenie"
            onKeyDown={(event) => {
              if (event.key === "Enter")
                navigate(
                  `/events?query=${encodeURIComponent(event.currentTarget.value)}`,
                );
            }}
          />
          <Group gap="xl" visibleFrom="lg">
            {links.map(([label, to]) => (
              <RouterNavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `header-link ${isActive ? "active" : ""}`
                }
              >
                {label}
              </RouterNavLink>
            ))}
          </Group>
          <Box visibleFrom="sm">{account}</Box>
          <Burger
            hiddenFrom="sm"
            opened={opened}
            onClick={toggle}
            color="white"
            aria-label="Open navigation menu"
          />
        </Group>
      </Container>
      <Drawer
        opened={opened}
        onClose={close}
        title={<Logo light={false} />}
        position="right"
      >
        <Stack>
          {links.map(([label, to]) => (
            <NavLink
              component={Link}
              active={location.pathname === to}
              key={to}
              to={to}
              label={label}
              onClick={close}
            />
          ))}
          <Divider />
          {user ? (
            account
          ) : (
            <>
              <Button component={Link} to="/login" variant="outline">
                Log in
              </Button>
              <Button component={Link} to="/register">
                Sign up
              </Button>
            </>
          )}
        </Stack>
      </Drawer>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <Container size="xl">
        <div className="footer-grid">
          <Box>
            <Logo />
            <Text mt="md" maw={300} c="gray.4">
              Your gateway to unforgettable live experiences, local stages, and
              artists worth following.
            </Text>
          </Box>
          {Object.entries(footerGroups).map(([title, links]) => (
            <Box key={title}>
              <Text fw={700} mb="sm">
                {title}
              </Text>
              <Stack gap={7}>
                {links.map((link) => (
                  <Text key={link} size="sm" c="gray.4">
                    {link}
                  </Text>
                ))}
              </Stack>
            </Box>
          ))}
          <Box>
            <Text fw={700}>Get updates</Text>
            <Text size="sm" c="gray.4" mt="sm">
              New shows, thoughtfully delivered.
            </Text>
          </Box>
        </div>
        <Divider my="xl" color="rgba(255,255,255,.12)" />
        <Group justify="space-between">
          <Text size="xs" c="gray.5">
            {copyright}
          </Text>
          <Text size="xs" c="gray.5">
            Terms · Privacy · Cookies
          </Text>
        </Group>
      </Container>
    </footer>
  );
}

export function PublicLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

const icons = {
  home: IconHome,
  ticket: IconTicket,
  history: IconHistory,
  user: IconUser,
  calendar: IconCalendar,
  building: IconBuilding,
  users: IconUsers,
  microphone: IconMicrophone2,
};

export function DashboardLayout({ role }: { role: "ARTIST" | "VENUE" }) {
  const { user } = useAuth();
  const base = role === "ARTIST" ? "/artist" : "/venue";
  const items =
    role === "ARTIST"
      ? [
          ["Book a venue", base, "building"],
          ["Confirmed events", `${base}/events`, "ticket"],
          ["Artist profile", `${base}/profile`, "microphone"],
        ]
      : [
          ["Overview", base, "home"],
          ["Availability", `${base}/availability`, "calendar"],
          ["Bookings", `${base}/bookings`, "users"],
          ["Venue profile", `${base}/profile`, "building"],
        ];
  return (
    <>
      <Header />
      <div className="dashboard-wrap">
        <aside className="dashboard-sidebar">
          <Stack gap="xs">
            <Box p="md">
              <Avatar size={68} radius="lg" color="violet">
                {initials(user?.displayName ?? role)}
              </Avatar>
              <Text fw={800} mt="sm">
                {user?.displayName}
              </Text>
              <Text size="sm" c="dimmed">
                {role === "ARTIST" ? "Artist account" : "Venue team"}
              </Text>
            </Box>
            {items.map(([label, to, icon]) => {
              const Icon = icons[icon as keyof typeof icons];
              return (
                <NavLink
                  key={to}
                  component={RouterNavLink}
                  to={to}
                  label={label}
                  leftSection={<Icon size={20} />}
                />
              );
            })}
          </Stack>
        </aside>
        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
    </>
  );
}
