"use client";

import { BobaShop } from "@/lib/types";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AUTH_STORAGE_KEY = "boba_jwt";

interface PublicUserResponse {
  user: {
    username: string;
    created_at: string;
    shops: BobaShop[];
  };
}

interface UserSession {
  token: string;
  username: string;
  createdAt: string;
  shops: BobaShop[];
  login: (nextToken: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
  setShops: (updater: (current: BobaShop[]) => BobaShop[]) => void;
}

interface UserContextValue {
  user: UserSession | null;
  isLoadingUser: boolean;
  login: (nextToken: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setUserShops: (updater: (current: BobaShop[]) => BobaShop[]) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export default function UserProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return window.localStorage.getItem(AUTH_STORAGE_KEY);
  });
  const [username, setUsername] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [shops, setShops] = useState<BobaShop[]>([]);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const logout = useCallback(() => {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    setToken(null);
    setUsername(null);
    setCreatedAt(null);
    setShops([]);
    setIsLoadingUser(false);
  }, []);

  const loadUser = useCallback(async (nextToken: string) => {
    const response = await fetch("/api/user", {
      headers: { Authorization: `Bearer ${nextToken}` },
    });

    if (!response.ok) {
      throw new Error("Could not load account.");
    }

    const data = (await response.json()) as PublicUserResponse;
    setUsername(data.user.username);
    setCreatedAt(data.user.created_at);
    setShops(data.user.shops ?? []);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    setIsLoadingUser(true);
    try {
      await loadUser(token);
    } finally {
      setIsLoadingUser(false);
    }
  }, [loadUser, token]);

  const login = useCallback(
    async (nextToken: string) => {
      window.localStorage.setItem(AUTH_STORAGE_KEY, nextToken);
      setToken(nextToken);
      setIsLoadingUser(true);

      try {
        await loadUser(nextToken);
      } catch {
        logout();
        throw new Error("Could not load account.");
      } finally {
        setIsLoadingUser(false);
      }
    },
    [loadUser, logout],
  );

  const setUserShops = useCallback(
    (updater: (current: BobaShop[]) => BobaShop[]) => {
      setShops((current) => updater(current));
    },
    [],
  );

  useEffect(() => {
    const hydrate = async () => {
      if (!token) {
        setIsLoadingUser(false);
        return;
      }

      setIsLoadingUser(true);
      try {
        await loadUser(token);
      } catch {
        logout();
      } finally {
        setIsLoadingUser(false);
      }
    };

    void hydrate();
  }, [loadUser, logout, token]);

  const user = useMemo<UserSession | null>(() => {
    if (!token || !username || !createdAt) {
      return null;
    }

    return {
      token,
      username,
      createdAt,
      shops,
      login,
      logout,
      refresh: refreshUser,
      setShops: setUserShops,
    };
  }, [
    createdAt,
    login,
    logout,
    refreshUser,
    setUserShops,
    shops,
    token,
    username,
  ]);

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      isLoadingUser,
      login,
      logout,
      refreshUser,
      setUserShops,
    }),
    [user, isLoadingUser, login, logout, refreshUser, setUserShops],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider.");
  }
  return context;
}
