"use client";

import { BobaShop } from "@/lib/types";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";

const AUTH_STORAGE_KEY = "boba_jwt";

interface PublicUserResponse {
  user: {
    username: string;
    created_at: number;
    shops: BobaShop[];
  };
}

interface UserSession {
  token: string;
  username: string;
  createdAt: number;
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

interface UserState {
  token: string | null;
  username: string | null;
  createdAt: number | null;
  shops: BobaShop[];
  isLoading: boolean;
}

type UserAction =
  | { type: "loaded"; username: string; createdAt: number; shops: BobaShop[] }
  | { type: "logged_in"; token: string }
  | { type: "logged_out" }
  | { type: "loading" }
  | { type: "done_loading" }
  | { type: "update_shops"; updater: (current: BobaShop[]) => BobaShop[] };

function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case "loaded":
      return {
        ...state,
        username: action.username,
        createdAt: action.createdAt,
        shops: action.shops,
      };
    case "logged_in":
      return { ...state, token: action.token, isLoading: true };
    case "logged_out":
      return {
        token: null,
        username: null,
        createdAt: null,
        shops: [],
        isLoading: false,
      };
    case "loading":
      return { ...state, isLoading: true };
    case "done_loading":
      return { ...state, isLoading: false };
    case "update_shops":
      return { ...state, shops: action.updater(state.shops) };
  }
}

function getInitialState(): UserState {
  return {
    token:
      typeof window === "undefined"
        ? null
        : localStorage.getItem(AUTH_STORAGE_KEY),
    username: null,
    createdAt: null,
    shops: [],
    isLoading: true,
  };
}

export default function UserProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(userReducer, undefined, getInitialState);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    dispatch({ type: "logged_out" });
  }, []);

  const loadUser = useCallback(async (nextToken: string) => {
    const response = await fetch("/api/user", {
      headers: { Authorization: `Bearer ${nextToken}` },
    });

    if (!response.ok) {
      throw new Error("Could not load account.");
    }

    const data = (await response.json()) as PublicUserResponse;
    dispatch({
      type: "loaded",
      username: data.user.username,
      createdAt: data.user.created_at,
      shops: data.user.shops ?? [],
    });
  }, []);

  const refreshUser = useCallback(async () => {
    if (!state.token) {
      return;
    }
    dispatch({ type: "loading" });
    try {
      await loadUser(state.token);
    } finally {
      dispatch({ type: "done_loading" });
    }
  }, [loadUser, state.token]);

  const login = useCallback(
    async (nextToken: string) => {
      localStorage.setItem(AUTH_STORAGE_KEY, nextToken);
      dispatch({ type: "logged_in", token: nextToken });

      try {
        await loadUser(nextToken);
      } catch {
        logout();
        throw new Error("Could not load account.");
      } finally {
        dispatch({ type: "done_loading" });
      }
    },
    [loadUser, logout],
  );

  const setUserShops = useCallback(
    (updater: (current: BobaShop[]) => BobaShop[]) => {
      dispatch({ type: "update_shops", updater });
    },
    [],
  );

  useEffect(() => {
    const hydrate = async () => {
      if (!state.token) {
        dispatch({ type: "done_loading" });
        return;
      }

      dispatch({ type: "loading" });
      try {
        await loadUser(state.token);
      } catch {
        logout();
      } finally {
        dispatch({ type: "done_loading" });
      }
    };

    void hydrate();
  }, [loadUser, logout, state.token]);

  const user = useMemo<UserSession | null>(() => {
    if (!state.token || !state.username || !state.createdAt) {
      return null;
    }

    return {
      token: state.token,
      username: state.username,
      createdAt: state.createdAt,
      shops: state.shops,
      login,
      logout,
      refresh: refreshUser,
      setShops: setUserShops,
    };
  }, [
    state.token,
    state.username,
    state.createdAt,
    state.shops,
    login,
    logout,
    refreshUser,
    setUserShops,
  ]);

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      isLoadingUser: state.isLoading,
      login,
      logout,
      refreshUser,
      setUserShops,
    }),
    [user, state.isLoading, login, logout, refreshUser, setUserShops],
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
