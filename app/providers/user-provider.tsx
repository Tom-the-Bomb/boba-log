"use client";

import { BobaShop, PublicUser } from "@/lib/types";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";

interface PublicUserResponse {
  user: PublicUser;
}

interface UserSession {
  username: string;
  createdAt: number;
  shops: BobaShop[];
  login: () => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
  setShops: (updater: (current: BobaShop[]) => BobaShop[]) => void;
}

interface UserContextValue {
  user: UserSession | null;
  isLoadingUser: boolean;
  login: () => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setUserShops: (updater: (current: BobaShop[]) => BobaShop[]) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

interface UserState {
  username: string | null;
  createdAt: number | null;
  shops: BobaShop[];
  isLoading: boolean;
}

type UserAction =
  | { type: "loaded"; username: string; createdAt: number; shops: BobaShop[] }
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
    case "logged_out":
      return {
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

const INITIAL_STATE: UserState = {
  username: null,
  createdAt: null,
  shops: [],
  isLoading: true,
};

export default function UserProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(userReducer, INITIAL_STATE);

  const loadUser = useCallback(async () => {
    const response = await fetch("/api/user");

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

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    dispatch({ type: "logged_out" });
  }, []);

  const refreshUser = useCallback(async () => {
    if (!state.username) {
      return;
    }
    dispatch({ type: "loading" });
    try {
      await loadUser();
    } finally {
      dispatch({ type: "done_loading" });
    }
  }, [loadUser, state.username]);

  const login = useCallback(async () => {
    dispatch({ type: "loading" });
    try {
      await loadUser();
    } catch {
      await logout();
      throw new Error("Could not load account.");
    } finally {
      dispatch({ type: "done_loading" });
    }
  }, [loadUser, logout]);

  const setUserShops = useCallback(
    (updater: (current: BobaShop[]) => BobaShop[]) => {
      dispatch({ type: "update_shops", updater });
    },
    [],
  );

  useEffect(() => {
    const hydrate = async () => {
      try {
        await loadUser();
      } catch {
        // No valid cookie — user is not logged in
      } finally {
        dispatch({ type: "done_loading" });
      }
    };

    void hydrate();
  }, [loadUser]);

  const user = useMemo<UserSession | null>(() => {
    if (!state.username || !state.createdAt) {
      return null;
    }

    return {
      username: state.username,
      createdAt: state.createdAt,
      shops: state.shops,
      login,
      logout,
      refresh: refreshUser,
      setShops: setUserShops,
    };
  }, [
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
