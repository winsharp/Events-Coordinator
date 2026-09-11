import {
  Alert,
  Box,
  Button,
  Container,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  IconArrowRight,
  IconHistory,
  IconTicket,
  IconUser,
} from "@tabler/icons-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import {
  DigitalTicket,
  EmptyState,
  EventCard,
  FullLoadingState,
  ProfileAvatar,
} from "../components/Cards";
import { useAuth } from "../context/AppContext";
import { formatDate, formatMoney } from "../lib/utils";
import concertImage from "../assets/event-banner.png";

export function CustomerHubPage() {
  const { user } = useAuth();
  const eventsQuery = useQuery({
    queryKey: ["events", "customer"],
    queryFn: () => api.events({}),
  });
  const ordersQuery = useQuery({ queryKey: ["orders"], queryFn: api.orders });
  if (eventsQuery.isLoading) return <FullLoadingState />;
  const next = eventsQuery.data?.[0];
  return (
    <>
      <section
        className="customer-hero"
        style={{
          backgroundImage: `linear-gradient(90deg,rgba(7,17,38,.98),rgba(20,9,54,.62)),url(${concertImage})`,
        }}
      >
        <Container size="xl">
          <Title>Good evening, {user?.firstName}</Title>
          <Text c="gray.3">Your next live experience starts here.</Text>
          <Alert
            mt="xl"
            color="violet"
            icon={<IconTicket />}
            title="Your tickets are ready"
          >
            Digital tickets for Neon Skyline World Tour are ready to view.
          </Alert>
        </Container>
      </section>
      <Container size="xl" className="customer-content">
        <SimpleGrid cols={{ base: 1, lg: 4 }}>
          <Box style={{ gridColumn: "span 3" }}>
            {next && (
              <>
                <Title order={3} mb="sm">
                  Your next event
                </Title>
                <Paper className="next-event" p={0}>
                  <div style={{ backgroundImage: `url(${concertImage})` }} />
                  <Box p="lg">
                    <Text c="violet" fw={800}>
                      {formatDate(next.date)} · {next.time}
                    </Text>
                    <Title order={2}>{next.title}</Title>
                    <Text c="dimmed">
                      {next.venue}, {next.city}
                    </Text>
                    <Group mt="md">
                      <Button component={Link} to="/customer/tickets">
                        View tickets
                      </Button>
                      <Button
                        component={Link}
                        to={`/events/${next.id}`}
                        variant="outline"
                      >
                        Event details
                      </Button>
                    </Group>
                  </Box>
                </Paper>
              </>
            )}
            <Group justify="space-between" mt={40} mb="md">
              <Title order={3}>Recommended for you</Title>
              <Button component={Link} to="/events" variant="subtle">
                All events
              </Button>
            </Group>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
              {eventsQuery.data?.slice(1, 4).map((event) => (
                <EventCard event={event} key={event.id} />
              ))}
            </SimpleGrid>
          </Box>
          <Stack>
            <Title order={3}>Quick actions</Title>
            <Paper p="md">
              <QuickLink icon={IconTicket} to="/events" label="Browse events" />
              <QuickLink
                icon={IconHistory}
                to="/customer/orders"
                label="Order history"
              />
              <QuickLink
                icon={IconUser}
                to="/customer/profile"
                label="Manage profile"
              />
            </Paper>
            <Title order={3}>Recent orders</Title>
            <Paper p="md">
              {ordersQuery.data?.slice(0, 1).map((order) => (
                <Box key={order.id}>
                  <Text fw={800}>{order.id}</Text>
                  <Text size="sm" c="dimmed">
                    {order.tierName} · {order.quantity} tickets
                  </Text>
                  <Text fw={800} mt="sm">
                    {formatMoney(order.total)}
                  </Text>
                  <Button
                    component={Link}
                    to="/customer/orders"
                    fullWidth
                    mt="md"
                    variant="outline"
                  >
                    View order
                  </Button>
                </Box>
              ))}
            </Paper>
          </Stack>
        </SimpleGrid>
      </Container>
    </>
  );
}
const QuickLink = ({
  icon: Icon,
  to,
  label,
}: {
  icon: typeof IconTicket;
  to: string;
  label: string;
}) => (
  <Button
    component={Link}
    to={to}
    variant="subtle"
    color="dark"
    fullWidth
    justify="space-between"
    leftSection={<Icon size={18} />}
    rightSection={<IconArrowRight size={16} />}
  >
    {label}
  </Button>
);

export function CustomerOrdersPage() {
  const ordersQuery = useQuery({ queryKey: ["orders"], queryFn: api.orders });
  const eventsQuery = useQuery({
    queryKey: ["events", "orders"],
    queryFn: () => api.events({}),
  });
  if (ordersQuery.isLoading || eventsQuery.isLoading)
    return <FullLoadingState />;
  return (
    <AccountLayout active="orders">
      <Title>Order history</Title>
      <Text c="dimmed" mb="xl">
        Review your TicketGenie purchases.
      </Text>
      {ordersQuery.data?.length ? (
        <Stack>
          {ordersQuery.data.map((order) => {
            const event = eventsQuery.data?.find(
              (candidate) => candidate.id === order.eventId,
            );
            return (
              <Paper p="lg" key={order.id} className="order-card">
                <Group align="flex-start">
                  <div
                    className="order-thumb"
                    style={{ backgroundImage: `url(${concertImage})` }}
                  />
                  <Box flex={1}>
                    <Group justify="space-between">
                      <Box>
                        <Title order={3}>{order.id}</Title>
                        <Text c="violet" fw={700}>
                          {event?.title}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {event && formatDate(event.date)} · {event?.venue}
                        </Text>
                      </Box>
                      <Text size="sm">
                        Purchased {formatDate(order.createdAt.slice(0, 10))}
                      </Text>
                    </Group>
                    <SimpleGrid cols={{ base: 2, sm: 4 }} mt="lg">
                      <Box>
                        <Text size="xs" c="dimmed">
                          Tickets
                        </Text>
                        <Text>{order.quantity} tickets</Text>
                      </Box>
                      <Box>
                        <Text size="xs" c="dimmed">
                          Amount
                        </Text>
                        <Text>{formatMoney(order.total)}</Text>
                      </Box>
                      <Box>
                        <Text size="xs" c="dimmed">
                          Payment
                        </Text>
                        <Text>{order.method}</Text>
                      </Box>
                      <Box>
                        <Button
                          component={Link}
                          to="/customer/tickets"
                          size="sm"
                        >
                          View tickets
                        </Button>
                      </Box>
                    </SimpleGrid>
                  </Box>
                </Group>
              </Paper>
            );
          })}
        </Stack>
      ) : (
        <EmptyState title="No orders yet" />
      )}
    </AccountLayout>
  );
}

export function CustomerTicketsPage() {
  const ordersQuery = useQuery({ queryKey: ["orders"], queryFn: api.orders });
  const eventsQuery = useQuery({
    queryKey: ["events", "tickets"],
    queryFn: () => api.events({}),
  });
  if (ordersQuery.isLoading || eventsQuery.isLoading)
    return <FullLoadingState />;
  const confirmed =
    ordersQuery.data?.filter((order) => order.status === "CONFIRMED") ?? [];
  return (
    <AccountLayout active="tickets">
      <Title>Your tickets</Title>
      <Text c="dimmed" mb="xl">
        Show these mobile tickets at the venue for entry.
      </Text>
      {confirmed.length ? (
        confirmed.map((order) => {
          const event = eventsQuery.data?.find(
            (candidate) => candidate.id === order.eventId,
          );
          if (!event) return null;
          return (
            <Box key={order.id} mb={40}>
              <Title order={3} mb="md">
                {event.title}
              </Title>
              <div className="ticket-grid">
                {Array.from({ length: order.quantity }, (_, index) => (
                  <DigitalTicket
                    order={order}
                    event={event}
                    index={index}
                    key={index}
                  />
                ))}
              </div>
            </Box>
          );
        })
      ) : (
        <EmptyState title="No digital tickets" />
      )}
    </AccountLayout>
  );
}

interface CustomerForm {
  firstName: string;
  lastName: string;
  email: string;
}
export function CustomerProfilePage() {
  const { user, setUser } = useAuth();
  const [values, setValues] = useState<CustomerForm>({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
  });
  const mutation = useMutation({
    mutationFn: (next: CustomerForm) => api.saveCustomerProfile(next),
    onSuccess: (next) => {
      setUser(next);
      notifications.show({
        color: "teal",
        message: "Customer profile updated",
      });
    },
  });
  const field = <K extends keyof CustomerForm>(key: K, value: CustomerForm[K]) =>
    setValues((current) => ({ ...current, [key]: value }));
  return (
    <AccountLayout active="profile">
      <Title>Account profile</Title>
      <Text c="dimmed" mb="xl">
        Manage your account details.
      </Text>
      <SimpleGrid cols={{ base: 1, md: 3 }}>
        <Paper p="xl">
          <ProfileAvatar
            name={user?.displayName ?? "Customer"}
            role="Customer"
          />
        </Paper>
        <Paper p="xl" style={{ gridColumn: "span 2" }}>
          <Stack>
            <Group grow>
              <TextInput
                label="First name"
                value={values.firstName}
                onChange={(e) => field("firstName", e.currentTarget.value)}
              />
              <TextInput
                label="Last name"
                value={values.lastName}
                onChange={(e) => field("lastName", e.currentTarget.value)}
              />
            </Group>
            <TextInput
              label="Email"
              value={values.email}
              onChange={(e) => field("email", e.currentTarget.value)}
            />
            <Button
              loading={mutation.isPending}
              onClick={() => mutation.mutate(values)}
            >
              Save profile
            </Button>
          </Stack>
        </Paper>
      </SimpleGrid>
    </AccountLayout>
  );
}

function AccountLayout({
  active,
  children,
}: {
  active: string;
  children: React.ReactNode;
}) {
  return (
    <Container size="xl" className="account-layout">
      <Stack className="account-tabs">
        <Button
          component={Link}
          to="/customer/profile"
          variant={active === "profile" ? "light" : "subtle"}
          leftSection={<IconUser size={17} />}
        >
          Profile
        </Button>
        <Button
          component={Link}
          to="/customer/orders"
          variant={active === "orders" ? "light" : "subtle"}
          leftSection={<IconHistory size={17} />}
        >
          Orders
        </Button>
        <Button
          component={Link}
          to="/customer/tickets"
          variant={active === "tickets" ? "light" : "subtle"}
          leftSection={<IconTicket size={17} />}
        >
          Tickets
        </Button>
      </Stack>
      <main>{children}</main>
    </Container>
  );
}

export const customerPagesReady = true;
