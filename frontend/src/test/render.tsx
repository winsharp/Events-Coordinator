import { createTheme, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router-dom";
import { AppContextProvider } from "../context/AppContext";
import { AUTH_STORAGE_KEY, userByRole, type Role } from "../types";

const theme = createTheme({ primaryColor: "violet" });

export function renderApp(
  ui: ReactElement,
  options: RenderOptions & { route?: string; role?: Role | null } = {},
) {
  const { route = "/", role = null, ...renderOptions } = options;
  if (role)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userByRole[role]));
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return render(
    <MantineProvider theme={theme}>
      <Notifications />
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>
          <AppContextProvider>{ui}</AppContextProvider>
        </MemoryRouter>
      </QueryClientProvider>
    </MantineProvider>,
    renderOptions,
  );
}
