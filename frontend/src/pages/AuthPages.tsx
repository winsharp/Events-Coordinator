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
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import {
  IconBuilding,
  IconMicrophone2,
  IconSparkles,
  IconTicket,
} from "@tabler/icons-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AppContext";
import {
  loginSchema,
  registerSchema,
  type LoginValues,
  type RegisterValues,
} from "../lib/schemas";
import {
  demoCredentials,
  demoPassword,
  roleHomes,
  roleOptions,
  type Role,
} from "../types";

const roleIcons = {
  CUSTOMER: IconTicket,
  ARTIST: IconMicrophone2,
  VENUE: IconBuilding,
};

function RoleSelector({
  value,
  onChange,
}: {
  value: Role;
  onChange: (value: Role) => void;
}) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 3 }}>
      {roleOptions.map((option) => {
        const Icon = roleIcons[option.role];
        return (
          <button
            type="button"
            className={`role-card ${value === option.role ? "selected" : ""}`}
            key={option.role}
            onClick={() => onChange(option.role)}
          >
            <Icon size={28} />
            <strong>{option.label}</strong>
            <span>{option.description}</span>
          </button>
        );
      })}
    </SimpleGrid>
  );
}

export function LoginPage() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: demoCredentials.CUSTOMER,
      password: demoPassword,
      role: "CUSTOMER",
    },
  });
  const role = watch("role");
  const mutation = useMutation({
    mutationFn: api.login,
    onSuccess: (user) => {
      setUser(user);
      notifications.show({
        color: "teal",
        title: "Welcome back",
        message: `Signed in as ${user.displayName}`,
      });
      navigate(
        (location.state as { from?: string } | null)?.from ||
          roleHomes[user.role],
      );
    },
  });
  const selectRole = (next: Role) => {
    setValue("role", next);
    setValue("email", demoCredentials[next]);
    setValue("password", demoPassword);
  };
  return (
    <AuthLayout
      title="Welcome back"
      copy="Choose your account role and continue with the seeded demonstration account."
    >
      <form onSubmit={handleSubmit((values) => mutation.mutate(values))}>
        <Stack gap="md">
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <RoleSelector value={field.value} onChange={selectRole} />
            )}
          />
          <TextInput
            label="Email"
            {...register("email")}
            error={errors.email?.message}
          />
          <PasswordInput
            label="Password"
            {...register("password")}
            error={errors.password?.message}
          />
          {mutation.isError && (
            <Alert color="red">{mutation.error.message}</Alert>
          )}
          <Alert color="violet" variant="light">
            Demo: {demoCredentials[role]} / {demoPassword}
          </Alert>
          <Button type="submit" size="md" loading={mutation.isPending}>
            Log in
          </Button>
          <Text ta="center" size="sm">
            New to TicketGenie? <Link to="/register">Create an account</Link>
          </Text>
        </Stack>
      </form>
    </AuthLayout>
  );
}

export function RegisterPage() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<RegisterValues & { terms: true }>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "CUSTOMER",
      terms: false as unknown as true,
    },
  });
  const mutation = useMutation({
    mutationFn: ({
      terms: _terms,
      ...values
    }: RegisterValues & { terms: true }) => api.register(values),
    onSuccess: (user) => {
      setUser(user);
      notifications.show({
        color: "teal",
        title: "Account created",
        message: `Welcome, ${user.firstName}`,
      });
      navigate(roleHomes[user.role]);
    },
  });
  return (
    <AuthLayout
      title="Create your TicketGenie account"
      copy="Pick the experience that matches how you use live music."
    >
      <form onSubmit={handleSubmit((values) => mutation.mutate(values))}>
        <Stack gap="md">
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <RoleSelector value={field.value} onChange={field.onChange} />
            )}
          />
          <Group grow>
            <TextInput
              label="First name"
              {...register("firstName")}
              error={errors.firstName?.message}
            />
            <TextInput
              label="Last name"
              {...register("lastName")}
              error={errors.lastName?.message}
            />
          </Group>
          <TextInput
            label="Email"
            {...register("email")}
            error={errors.email?.message}
          />
          <Group grow>
            <PasswordInput
              label="Password"
              {...register("password")}
              error={errors.password?.message}
            />
            <PasswordInput
              label="Confirm password"
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
            />
          </Group>
          <Controller
            name="terms"
            control={control}
            render={({ field }) => (
              <Checkbox
                label="I accept the demonstration terms and privacy policy"
                checked={field.value}
                onChange={(event) =>
                  field.onChange(event.currentTarget.checked)
                }
                error={errors.terms?.message}
              />
            )}
          />
          {mutation.isError && (
            <Alert color="red">{mutation.error.message}</Alert>
          )}
          <Button type="submit" size="md" loading={mutation.isPending}>
            Create {watch("role").toLowerCase()} account
          </Button>
          <Text ta="center" size="sm">
            Already have an account? <Link to="/login">Log in</Link>
          </Text>
        </Stack>
      </form>
    </AuthLayout>
  );
}

function AuthLayout({
  title,
  copy,
  children,
}: {
  title: string;
  copy: string;
  children: React.ReactNode;
}) {
  return (
    <section className="auth-page">
      <Container size="lg">
        <Paper className="auth-shell" radius="xl">
          <div className="auth-art">
            <IconSparkles size={34} />
            <Title>
              Ticket<strong>Genie</strong>
            </Title>
            <Text size="xl">Discover. Book. Experience.</Text>
            <Stack mt={50}>
              <Text>✓ Realistic standalone demo data</Text>
              <Text>✓ Role-aware dashboards</Text>
              <Text>✓ Safe mock checkout</Text>
            </Stack>
          </div>
          <Box className="auth-form">
            <Title order={2}>{title}</Title>
            <Text c="dimmed" mb="xl">
              {copy}
            </Text>
            {children}
          </Box>
        </Paper>
      </Container>
    </section>
  );
}

export const roleSelectorReady = true;
