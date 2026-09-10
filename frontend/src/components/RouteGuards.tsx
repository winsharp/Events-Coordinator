import type { ReactNode } from "react";
import {
  Alert,
  Button,
  Center,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconLock, IconSwitchHorizontal } from "@tabler/icons-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import type { Role } from "../types";
import { roleHomes } from "../types";
import { useAuth } from "../context/AppContext";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

export function RequireRole({
  role,
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    return (
      <Center mih="65vh" px="md">
        <Paper className="state-card" maw={520} p="xl" withBorder>
          <Stack align="center" ta="center">
            <IconSwitchHorizontal size={42} color="var(--tg-purple)" />
            <Title order={2}>Different backstage pass</Title>
            <Text c="dimmed">
              This page is for {role.toLowerCase()} accounts. Your current{" "}
              {user.role.toLowerCase()} session is still secure.
            </Text>
            <Alert icon={<IconLock size={18} />} color="violet" w="100%">
              Role permissions are also enforced by the production service.
            </Alert>
            <Button onClick={() => navigate(roleHomes[user.role])}>
              Return to my dashboard
            </Button>
          </Stack>
        </Paper>
      </Center>
    );
  }
  return children;
}
