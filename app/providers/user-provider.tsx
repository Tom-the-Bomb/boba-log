"use client";

import { BobaShop, PublicUser } from "@/lib/types";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import useUserReducer from "../reducers/user-reducer";

interface PublicUserResponse {
  user: PublicUser;
}

interface UserSession {
  username: string;
  createdAt: number;
  shops: BobaShop[];
}

interface UserContextValue {
  user: UserSession | null;
  isLoadingUser: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUserShops: (updater: (current: BobaShop[]) => BobaShop[]) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export default function UserProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useUserReducer();

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
  }, [dispatch]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    dispatch({ type: "logged_out" });
  }, [dispatch]);

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
  }, [dispatch, loadUser, state.username]);

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
  }, [dispatch, loadUser, logout]);

  const setUserShops = useCallback(
    (updater: (current: BobaShop[]) => BobaShop[]) => {
      dispatch({ type: "update_shops", updater });
    },
    [dispatch],
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
  }, [dispatch, loadUser]);

  const user = useMemo<UserSession | null>(() => {
    if (!state.username || !state.createdAt) {
      return null;
    }

    return {
      username: state.username,
      createdAt: state.createdAt,
      shops: state.shops,
    };
  }, [state.username, state.createdAt, state.shops]);

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
