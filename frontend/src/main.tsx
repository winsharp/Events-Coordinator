import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "./index.css";
import { createTheme, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AppContextProvider } from "./context/AppContext";
import { documentTitle, USE_MOCKS } from "./types";

const theme = createTheme({
  primaryColor: "violet",
  primaryShade: 7,
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  headings: {
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    fontWeight: "800",
  },
  defaultRadius: "md",
  colors: {
    violet: [
      "#f5f0ff",
      "#e9ddff",
      "#d4bcff",
      "#ba91ff",
      "#9e62ff",
      "#8438f5",
      "#7926ec",
      "#6719d4",
      "#5815bd",
      "#49109f",
    ],
  },
  components: {
    Button: { defaultProps: { radius: "md" } },
    Paper: { defaultProps: { radius: "lg" } },
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
    mutations: { retry: 0 },
  },
});
document.title = documentTitle;

async function bootstrap() {
  if (USE_MOCKS) {
    const { worker } = await import("./mocks/browser");
    await worker.start({
      onUnhandledRequest: "bypass",
      serviceWorker: { url: "/mockServiceWorker.js" },
    });
  }
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <MantineProvider theme={theme}>
        <Notifications position="top-right" />
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AppContextProvider>
              <App />
            </AppContextProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </MantineProvider>
    </StrictMode>,
  );
}

void bootstrap();
