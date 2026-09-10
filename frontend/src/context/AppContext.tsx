import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { notifications } from "@mantine/notifications";
import type { CartSelection, Role, User } from "../types";
import {
  AUTH_STORAGE_KEY,
  CART_STORAGE_KEY,
  HOLD_SECONDS,
  defaultCart,
  roleHomes,
  reservationReleaseNotice,
} from "../types";
import {
  hasExpired,
  readStoredJson,
  totalQuantity,
  writeStoredJson,
} from "../lib/utils";
import { clearAuthToken } from "../api/client";

interface AuthContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  isRole: (role: Role) => boolean;
  home: string;
}

interface CartContextValue {
  cart: CartSelection;
  holdSeconds: number;
  quantity: number;
  updateTier: (eventId: string, tierId: string, quantity: number) => void;
  toggleSeat: (eventId: string, seatId: string) => void;
  clearCart: (notify?: boolean) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const CartContext = createContext<CartContextValue | null>(null);

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(() =>
    readStoredJson<User | null>(AUTH_STORAGE_KEY, null),
  );
  const [cart, setCart] = useState<CartSelection>(() => {
    const stored = readStoredJson<CartSelection>(CART_STORAGE_KEY, defaultCart);
    return stored.expiresAt && !hasExpired(stored.expiresAt)
      ? stored
      : defaultCart;
  });
  const [holdSeconds, setHoldSeconds] = useState(() =>
    cart.expiresAt
      ? Math.max(0, Math.ceil((cart.expiresAt - Date.now()) / 1000))
      : 0,
  );

  const setUser = (next: User | null) => {
    setUserState(next);
    if (next) writeStoredJson(AUTH_STORAGE_KEY, next);
    else localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const clearCart = (notify = false) => {
    setCart(defaultCart);
    setHoldSeconds(0);
    localStorage.removeItem(CART_STORAGE_KEY);
    if (notify)
      notifications.show({
        color: "orange",
        title: "Reservation released",
        message: reservationReleaseNotice,
      });
  };

  useEffect(() => {
    if (!cart.expiresAt) return;
    const interval = window.setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((cart.expiresAt - Date.now()) / 1000),
      );
      setHoldSeconds(remaining);
      if (remaining === 0) {
        window.clearInterval(interval);
        clearCart(true);
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [cart.expiresAt]);

  useEffect(() => {
    if (cart.eventId) writeStoredJson(CART_STORAGE_KEY, cart);
  }, [cart]);

  const startOrContinueHold = (current: CartSelection, eventId: string) =>
    current.eventId === eventId && current.expiresAt > Date.now()
      ? current.expiresAt
      : Date.now() + HOLD_SECONDS * 1000;

  const updateTier = (eventId: string, tierId: string, quantity: number) => {
    setCart((current) => {
      const sameEvent = current.eventId === eventId;
      const quantities = {
        ...(sameEvent ? current.quantities : {}),
        [tierId]: quantity,
      };
      const seats = sameEvent ? current.seats : [];
      const active = totalQuantity(quantities) + seats.length > 0;
      const expiresAt = active ? startOrContinueHold(current, eventId) : 0;
      setHoldSeconds(active ? Math.ceil((expiresAt - Date.now()) / 1000) : 0);
      return active ? { eventId, quantities, seats, expiresAt } : defaultCart;
    });
  };

  const toggleSeat = (eventId: string, seatId: string) => {
    setCart((current) => {
      const sameEvent = current.eventId === eventId;
      const seats = sameEvent ? current.seats : [];
      const selected = seats.includes(seatId)
        ? seats.filter((id) => id !== seatId)
        : seats.length < 6
          ? [...seats, seatId]
          : seats;
      const quantities = sameEvent ? current.quantities : {};
      const active = totalQuantity(quantities) + selected.length > 0;
      const expiresAt = active ? startOrContinueHold(current, eventId) : 0;
      setHoldSeconds(active ? Math.ceil((expiresAt - Date.now()) / 1000) : 0);
      return active
        ? { eventId, quantities, seats: selected, expiresAt }
        : defaultCart;
    });
  };

  const authValue = useMemo<AuthContextValue>(
    () => ({
      user,
      setUser,
      logout: () => {
        clearAuthToken();
        setUser(null);
      },
      isRole: (role) => user?.role === role,
      home: user ? roleHomes[user.role] : "/",
    }),
    [user],
  );

  const cartValue = useMemo<CartContextValue>(
    () => ({
      cart,
      holdSeconds,
      quantity: totalQuantity(cart.quantities) + cart.seats.length,
      updateTier,
      toggleSeat,
      clearCart,
    }),
    [cart, holdSeconds],
  );

  return (
    <AuthContext.Provider value={authValue}>
      <CartContext.Provider value={cartValue}>{children}</CartContext.Provider>
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AppContextProvider");
  return value;
};

export const useCart = () => {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside AppContextProvider");
  return value;
};
