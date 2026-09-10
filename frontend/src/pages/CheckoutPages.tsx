import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  Group,
  Paper,
  PasswordInput,
  Progress,
  Radio,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { Controller, useForm } from "react-hook-form";
import {
  IconArrowLeft,
  IconBrandPaypal,
  IconCheck,
  IconCircleCheck,
  IconCopy,
  IconCreditCard,
  IconCurrencyDollar,
  IconLock,
  IconShieldCheck,
} from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { api } from "../api/client";
import {
  DigitalTicket,
  FullLoadingState,
  OrderSummary,
} from "../components/Cards";
import { useAuth, useCart } from "../context/AppContext";
import {
  cardSchema,
  paypalSchema,
  usdcSchema,
  type CardValues,
  type PaypalValues,
  type UsdcValues,
} from "../lib/schemas";
import {
  calculateFees,
  maskAddress,
  randomId,
  totalQuantity,
} from "../lib/utils";
import {
  DEMO_USDC_ADDRESS,
  USDC_SECONDS,
  defaultBillingEmail,
  mockNetworkName,
  paymentLabels,
  type CheckoutPayload,
  type Order,
  type PaymentMethod,
} from "../types";

function CheckoutHeader({ complete = false }: { complete?: boolean }) {
  return (
    <header className="checkout-header">
      <Container size="lg">
        <Group justify="space-between">
          <Link to="/" className="logo logo-light">
            <span>Ticket</span>
            <strong>Genie</strong>
            <sup>✦</sup>
          </Link>
          <Group>
            <IconLock size={17} />
            <Text size="sm">Secure demo checkout</Text>
          </Group>
          <Group visibleFrom="sm">
            {["Tickets", "Details", "Payment", "Done"].map((step, index) => (
              <Group key={step} gap={6}>
                <span
                  className={`checkout-step ${complete || index < 3 ? "done" : index === 2 ? "active" : ""}`}
                >
                  {complete || index < 2 ? <IconCheck size={14} /> : index + 1}
                </span>
                <Text size="sm" fw={index === 2 ? 700 : 400}>
                  {step}
                </Text>
              </Group>
            ))}
          </Group>
        </Group>
      </Container>
    </header>
  );
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const [method, setMethod] = useState<PaymentMethod>("CARD");
  const [usdcOrder, setUsdcOrder] = useState<Order | null>(null);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const quantity = totalQuantity(cart.quantities) + cart.seats.length;
  const eventQuery = useQuery({
    queryKey: ["event", cart.eventId],
    queryFn: () => api.event(cart.eventId),
    enabled: Boolean(cart.eventId),
  });
  const tiersQuery = useQuery({
    queryKey: ["tiers", cart.eventId],
    queryFn: () => api.tiers(cart.eventId),
  });
  const payload = useMemo<CheckoutPayload | null>(() => {
    if (!eventQuery.data || !tiersQuery.data) return null;
    const selectedTier = tiersQuery.data.find(
      (tier) => (cart.quantities[tier.id] ?? 0) > 0,
    );
    const tierSubtotal = tiersQuery.data.reduce(
      (sum, tier) => sum + tier.price * (cart.quantities[tier.id] ?? 0),
      0,
    );
    const seatSubtotal = cart.seats.reduce(
      (sum, id) =>
        sum + (id.startsWith("ORC") ? 125 : id.startsWith("MEZ") ? 95 : 75),
      0,
    );
    const subtotal = tierSubtotal + seatSubtotal;
    const fees = calculateFees(subtotal);
    return {
      eventId: eventQuery.data.id,
      method,
      quantity,
      subtotal,
      fees,
      total: subtotal + fees,
      tierName:
        selectedTier?.name ??
        (cart.seats.length ? "Reserved seating" : "General Admission"),
      seats: cart.seats.length
        ? cart.seats
        : Array.from(
            { length: quantity },
            (_, index) => `GA-OPEN-${index + 1}`,
          ),
      billingEmail: user?.email ?? defaultBillingEmail,
    };
  }, [eventQuery.data, tiersQuery.data, cart, method, quantity, user]);
  const checkout = useMutation({
    mutationFn: (values: CheckoutPayload) =>
      api.checkout(values, randomId(`checkout-${values.eventId}`)),
    onSuccess: (order) => {
      if (order.method === "USDC") setUsdcOrder(order);
      else {
        setPaymentComplete(true);
        notifications.show({
          color: "teal",
          message: "Demo payment confirmed",
        });
        navigate("/customer/tickets", {
          replace: true,
          state: { purchasedOrderId: order.id },
        });
        clearCart();
      }
    },
  });
  if ((!cart.eventId || quantity === 0) && !paymentComplete)
    return <Navigate to="/events" replace />;
  if (eventQuery.isLoading || tiersQuery.isLoading || !payload)
    return (
      <>
        <CheckoutHeader />
        <FullLoadingState />
      </>
    );
  if (usdcOrder)
    return (
      <UsdcPanel
        order={usdcOrder}
        event={eventQuery.data!}
        onBack={() => setUsdcOrder(null)}
        onComplete={(order) => {
          setPaymentComplete(true);
          notifications.show({
            color: "teal",
            message: "Payment confirmed. Your tickets are ready.",
          });
          navigate("/customer/tickets", {
            replace: true,
            state: { purchasedOrderId: order.id },
          });
          clearCart();
        }}
      />
    );
  return (
    <>
      <CheckoutHeader />
      <main className="checkout-page">
        <Container size="lg">
          <SimpleGrid cols={{ base: 1, md: 5 }} spacing="xl">
            <Paper
              className="payment-panel"
              p="lg"
              style={{ gridColumn: "span 3" }}
            >
              <Title order={2}>Choose a payment method</Title>
              <Text c="dimmed">All transactions are demonstration only.</Text>
              <Radio.Group
                value={method}
                onChange={(value) => setMethod(value as PaymentMethod)}
              >
                <Stack mt="lg">
                  {(["CARD", "PAYPAL", "USDC"] as PaymentMethod[]).map(
                    (value) => (
                      <Paper
                        key={value}
                        className={`payment-method ${method === value ? "selected" : ""}`}
                        p="md"
                        onClick={() => setMethod(value)}
                      >
                        <Group>
                          <Radio value={value} />
                          <PaymentIcon method={value} />
                          <Box>
                            <Text fw={800}>{paymentLabels[value]}</Text>
                            <Text size="sm" c="dimmed">
                              {value === "CARD"
                                ? "Pay with a valid demonstration card."
                                : value === "PAYPAL"
                                  ? "Authorize a demonstration PayPal account."
                                  : "Scan a non-production QR code."}
                            </Text>
                          </Box>
                        </Group>
                        {method === value && (
                          <Box mt="lg">
                            {value === "CARD" ? (
                              <CardForm
                                loading={checkout.isPending}
                                onSubmit={(email) =>
                                  checkout.mutate({
                                    ...payload,
                                    billingEmail: email,
                                    method: value,
                                  })
                                }
                              />
                            ) : value === "PAYPAL" ? (
                              <PaypalForm
                                loading={checkout.isPending}
                                onSubmit={(email) =>
                                  checkout.mutate({
                                    ...payload,
                                    billingEmail: email,
                                    method: value,
                                  })
                                }
                              />
                            ) : (
                              <UsdcStartForm
                                loading={checkout.isPending}
                                onSubmit={(email) =>
                                  checkout.mutate({
                                    ...payload,
                                    billingEmail: email,
                                    method: value,
                                  })
                                }
                              />
                            )}
                          </Box>
                        )}
                      </Paper>
                    ),
                  )}
                </Stack>
              </Radio.Group>
              {checkout.isError && (
                <Alert color="red" mt="md">
                  {checkout.error.message}
                </Alert>
              )}
            </Paper>
            <Box style={{ gridColumn: "span 2" }}>
              <OrderSummary
                event={eventQuery.data!}
                quantity={quantity}
                subtotal={payload.subtotal}
                fees={payload.fees}
                total={payload.total}
                tierName={payload.tierName}
              />
            </Box>
          </SimpleGrid>
        </Container>
      </main>
    </>
  );
}
const PaymentIcon = ({ method }: { method: PaymentMethod }) =>
  method === "CARD" ? (
    <IconCreditCard color="#7c3aed" />
  ) : method === "PAYPAL" ? (
    <IconBrandPaypal color="#2563eb" />
  ) : (
    <IconCurrencyDollar color="#0ea5e9" />
  );

function CardForm({
  loading,
  onSubmit,
}: {
  loading: boolean;
  onSubmit: (email: string) => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CardValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      cardholder: "Alex Johnson",
      cardNumber: "4242 4242 4242 4242",
      expiry: "12/29",
      cvv: "123",
      billingEmail: defaultBillingEmail,
      terms: false as unknown as true,
    },
  });
  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit(values.billingEmail))}
      data-testid="checkout-form"
    >
      <Stack>
        <TextInput
          label="Card number"
          {...register("cardNumber")}
          error={errors.cardNumber?.message}
        />
        <Group grow>
          <TextInput
            label="Name on card"
            {...register("cardholder")}
            error={errors.cardholder?.message}
          />
          <TextInput
            label="Expiration"
            {...register("expiry")}
            error={errors.expiry?.message}
          />
          <PasswordInput
            label="CVV"
            {...register("cvv")}
            error={errors.cvv?.message}
          />
        </Group>
        <BillingFields register={register} control={control} errors={errors} />
        <Button
          type="submit"
          loading={loading}
          leftSection={<IconLock size={17} />}
        >
          Complete demo card payment
        </Button>
      </Stack>
    </form>
  );
}

function PaypalForm({
  loading,
  onSubmit,
}: {
  loading: boolean;
  onSubmit: (email: string) => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PaypalValues>({
    resolver: zodResolver(paypalSchema),
    defaultValues: {
      paypalEmail: defaultBillingEmail,
      billingEmail: defaultBillingEmail,
      terms: false as unknown as true,
    },
  });
  return (
    <form onSubmit={handleSubmit((values) => onSubmit(values.billingEmail))}>
      <Stack>
        <TextInput
          label="PayPal account email"
          {...register("paypalEmail")}
          error={errors.paypalEmail?.message}
        />
        <BillingFields register={register} control={control} errors={errors} />
        <Button
          color="blue"
          type="submit"
          loading={loading}
          leftSection={<IconBrandPaypal />}
        >
          Authorize demo PayPal payment
        </Button>
      </Stack>
    </form>
  );
}

function UsdcStartForm({
  loading,
  onSubmit,
}: {
  loading: boolean;
  onSubmit: (email: string) => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UsdcValues>({
    resolver: zodResolver(usdcSchema),
    defaultValues: {
      billingEmail: defaultBillingEmail,
      terms: false as unknown as true,
    },
  });
  return (
    <form onSubmit={handleSubmit((values) => onSubmit(values.billingEmail))}>
      <Stack>
        <BillingFields register={register} control={control} errors={errors} />
        <Alert color="cyan">
          A deliberately non-production QR appears next and confirms
          automatically after 30 seconds.
        </Alert>
        <Button type="submit" loading={loading} color="cyan">
          Continue to USDC QR
        </Button>
      </Stack>
    </form>
  );
}

function BillingFields({
  register,
  control,
  errors,
}: {
  register: ReturnType<typeof useForm<any>>["register"];
  control: any;
  errors: any;
}) {
  return (
    <>
      <TextInput
        label="Billing email"
        {...register("billingEmail")}
        error={errors.billingEmail?.message}
      />
      <Controller
        name="terms"
        control={control}
        render={({ field }) => (
          <Checkbox
            label="I agree to the demonstration purchase terms"
            checked={field.value}
            onChange={(event) => field.onChange(event.currentTarget.checked)}
            error={errors.terms?.message}
          />
        )}
      />
    </>
  );
}

function UsdcPanel({
  order,
  event,
  onBack,
  onComplete,
}: {
  order: Order;
  event: Awaited<ReturnType<typeof api.event>>;
  onBack: () => void;
  onComplete: (order: Order) => void;
}) {
  const [seconds, setSeconds] = useState(USDC_SECONDS);
  const completed = useRef(false);
  const confirmation = useMutation({
    mutationFn: () => api.paymentStatus(order.id),
    onSuccess: (confirmed) => {
      if (!completed.current) {
        completed.current = true;
        notifications.show({
          color: "teal",
          title: "USDC detected",
          message: "Demo payment confirmed automatically.",
        });
        onComplete(confirmed);
      }
    },
  });
  useEffect(() => {
    const interval = window.setInterval(
      () => setSeconds((current) => Math.max(0, current - 1)),
      1000,
    );
    return () => window.clearInterval(interval);
  }, []);
  useEffect(() => {
    if (seconds === 0 && !confirmation.isPending && !completed.current)
      confirmation.mutate();
  }, [seconds]);
  return (
    <>
      <CheckoutHeader />
      <main className="checkout-page">
        <Container size="lg">
          <SimpleGrid cols={{ base: 1, md: 5 }} spacing="xl">
            <Paper
              className="usdc-panel"
              p="xl"
              style={{ gridColumn: "span 3" }}
            >
              <Title>Pay with USDC</Title>
              <Text c="dimmed">
                Scan with a compatible wallet. This destination cannot receive
                real funds.
              </Text>
              <SimpleGrid cols={{ base: 1, sm: 2 }} mt="xl">
                <div className="payment-qr">
                  <QRCodeSVG
                    value={`ticketgenie-demo:${order.id}:${DEMO_USDC_ADDRESS}:${order.total}`}
                    size={220}
                    aria-label="Demonstration payment QR code"
                  />
                </div>
                <Stack>
                  <Title order={2}>{order.total.toFixed(2)} USDC</Title>
                  <Text>
                    Network: <strong>{mockNetworkName}</strong>
                  </Text>
                  <Text>Send to</Text>
                  <Paper p="sm" withBorder>
                    <Group justify="space-between">
                      <Text ff="monospace">
                        {maskAddress(DEMO_USDC_ADDRESS)}
                      </Text>
                      <IconCopy size={18} />
                    </Group>
                  </Paper>
                  <Alert color="orange">
                    Send only demonstration USDC on the displayed network.
                  </Alert>
                </Stack>
              </SimpleGrid>
              <Group mt="xl" align="center" wrap="nowrap">
                <Box className="seconds-ring">
                  <strong>{seconds}</strong>
                  <span>seconds</span>
                </Box>
                <Box flex={1}>
                  <Title order={3}>
                    {confirmation.isPending
                      ? "Confirming payment"
                      : "Waiting for payment"}
                  </Title>
                  <Text c="dimmed">
                    This demo payment confirms automatically after 30 seconds.
                  </Text>
                  <Progress
                    value={((USDC_SECONDS - seconds) / USDC_SECONDS) * 100}
                    mt="md"
                    color="violet"
                    animated
                  />
                </Box>
              </Group>
              <Button
                fullWidth
                mt="xl"
                variant="outline"
                leftSection={<IconArrowLeft size={18} />}
                onClick={onBack}
              >
                Choose another payment method
              </Button>
            </Paper>
            <Box style={{ gridColumn: "span 2" }}>
              <OrderSummary
                event={event}
                quantity={order.quantity}
                subtotal={order.subtotal}
                fees={order.fees}
                total={order.total}
                tierName={order.tierName}
              />
            </Box>
          </SimpleGrid>
        </Container>
      </main>
    </>
  );
}

export function CheckoutSuccessPage() {
  const location = useLocation();
  const { id } = useParams();
  const stateOrder = (location.state as { order?: Order } | null)?.order;
  const ordersQuery = useQuery({
    queryKey: ["orders"],
    queryFn: api.orders,
    enabled: !stateOrder,
  });
  const order =
    stateOrder ?? ordersQuery.data?.find((candidate) => candidate.id === id);
  const eventQuery = useQuery({
    queryKey: ["event", order?.eventId],
    queryFn: () => api.event(order!.eventId),
    enabled: Boolean(order),
  });
  if (!order || eventQuery.isLoading)
    return (
      <>
        <CheckoutHeader complete />
        <FullLoadingState />
      </>
    );
  const event = eventQuery.data;
  if (!event) return <Navigate to="/customer/tickets" replace />;
  return (
    <>
      <CheckoutHeader complete />
      <main className="success-page">
        <Container size="lg">
          <Paper className="success-card" p="xl">
            <SimpleGrid cols={{ base: 1, md: 2 }}>
              <Stack align="center" ta="center" p="lg">
                <div className="success-icon">
                  <IconCircleCheck size={56} />
                </div>
                <Title>Payment successful</Title>
                <Text c="dimmed">Your tickets are confirmed and ready.</Text>
                <OrderSummary
                  event={event}
                  quantity={order.quantity}
                  subtotal={order.subtotal}
                  fees={order.fees}
                  total={order.total}
                  tierName={order.tierName}
                />
                <Button component={Link} to="/customer/tickets" fullWidth>
                  View my tickets
                </Button>
                <Button
                  component={Link}
                  to="/customer"
                  fullWidth
                  variant="outline"
                >
                  Back to home
                </Button>
                <Group>
                  <IconShieldCheck size={17} />
                  <Text size="xs" c="dimmed">
                    No real funds were transferred in this demonstration.
                  </Text>
                </Group>
              </Stack>
              <Box p="lg">
                <Title order={2} ta="center">
                  Your tickets ({order.quantity})
                </Title>
                <Text ta="center" c="dimmed" mb="lg">
                  Show these tickets at the venue for entry.
                </Text>
                <div className="ticket-grid success-tickets">
                  {Array.from({ length: order.quantity }, (_, index) => (
                    <DigitalTicket
                      key={index}
                      order={order}
                      event={event}
                      index={index}
                    />
                  ))}
                </div>
              </Box>
            </SimpleGrid>
          </Paper>
        </Container>
      </main>
    </>
  );
}

export const checkoutPagesReady = true;
