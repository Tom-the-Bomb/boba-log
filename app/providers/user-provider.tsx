"use client";

import { failureCode } from "@/lib/network";
import type {
  ApiErrorResponse,
  BobaShop,
  Drink,
  DrinkInput,
  DrinkMutationResponse,
  PublicUser,
} from "@/lib/types";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import useUserReducer, { type LoadFailure } from "../reducers/user-reducer";

interface PublicUserResponse {
  user: PublicUser;
}

interface UserSession {
  username: string;
  createdAt: number;
  currency: string;
  shops: BobaShop[];
  drinks: Drink[];
}

/** Resolves to null on success, or to the API error code. */
type MutationResult = Promise<string | null>;

interface UserContextValue {
  user: UserSession | null;
  isLoadingUser: boolean;
  /** The account could not be loaded; `retryLoad` tries again. */
  loadFailed: LoadFailure | null;
  retryLoad: () => Promise<void>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  addShop: (shop: BobaShop) => void;
  removeShop: (shopId: number) => void;
  logDrink: (
    shopId: number,
    input: DrinkInput & { day: string },
  ) => Promise<Drink | string>;
  updateDrink: (id: number, input: DrinkInput) => MutationResult;
  removeDrink: (id: number) => MutationResult;
  setCurrency: (currency: string) => MutationResult;
}

const UserContext = createContext<UserContextValue | null>(null);

interface UserProviderProps {
  children: ReactNode;
  skipHydration?: boolean;
}

/** The session is gone (expired, or signed out on another device). */
class SessionExpiredError extends Error {}
class RateLimitedError extends Error {}

async function sendJson<T extends ApiErrorResponse>(
  url: string,
  method: string,
  body?: unknown,
): Promise<{ ok: boolean; data: T }> {
  const response = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (response.status === 401) {
    throw new SessionExpiredError();
  }
  return { ok: response.ok, data: (await response.json()) as T };
}

export default function UserProvider({
  children,
  skipHydration = false,
}: UserProviderProps) {
  const [state, dispatch] = useUserReducer();
  // Optimistic drinks carry negative ids until the server answers.
  const nextTempId = useRef(-1);
  const pendingDrinks = useRef(new Map<number, Promise<Drink | string>>());

  const loadUser = useCallback(async () => {
    const response = await fetch("/api/user");

    if (response.status === 401) {
      throw new SessionExpiredError();
    }
    if (response.status === 429) {
      throw new RateLimitedError();
    }
    if (!response.ok) {
      throw new Error("Could not load account.");
    }

    const data = (await response.json()) as PublicUserResponse;
    dispatch({ type: "loaded", user: data.user });
  }, [dispatch]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
  }, []);

  // A dead session clears its cookie and signs out, so the dashboard sends the
  // visitor to sign in without bouncing back.
  const expire = useCallback(async () => {
    try {
      await logout();
    } catch {}
    dispatch({ type: "signed_out" });
  }, [dispatch, logout]);

  /** Turns a failed request into an error code, signing out if the session died. */
  const failure = useCallback(
    (error: unknown, fallback: string) => {
      if (error instanceof SessionExpiredError) {
        void expire();
        return "unauthorized";
      }
      return failureCode(fallback);
    },
    [expire],
  );

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

  const addShop = useCallback(
    (shop: BobaShop) => dispatch({ type: "add_shop", shop }),
    [dispatch],
  );

  const removeShop = useCallback(
    (shopId: number) => dispatch({ type: "remove_shop", shopId }),
    [dispatch],
  );

  const logDrink = useCallback(
    (shopId: number, input: DrinkInput & { day: string }) => {
      const tempId = nextTempId.current--;
      dispatch({
        type: "add_drink",
        drink: {
          id: tempId,
          shopId,
          day: input.day,
          createdAt: Math.floor(Date.now() / 1000),
          name: input.name ?? null,
          priceCents: input.priceCents ?? null,
          note: input.note ?? null,
        },
      });

      const request = (async () => {
        try {
          const { ok, data } = await sendJson<DrinkMutationResponse>(
            `/api/shops/${shopId}/drinks`,
            "POST",
            input,
          );
          if (ok && data.drink) {
            dispatch({ type: "replace_drink", id: tempId, drink: data.drink });
            return data.drink;
          }
          dispatch({ type: "remove_drink", id: tempId });
          return data.code ?? "couldNotLog";
        } catch (error) {
          dispatch({ type: "remove_drink", id: tempId });
          return failure(error, "couldNotLog");
        } finally {
          pendingDrinks.current.delete(tempId);
        }
      })();

      pendingDrinks.current.set(tempId, request);
      return request;
    },
    [dispatch, failure],
  );

  // Waits for an optimistic drink to land so edits target its real id.
  const resolveDrinkId = useCallback(async (id: number) => {
    if (id > 0) {
      return id;
    }
    const pending = await pendingDrinks.current.get(id);
    return pending && typeof pending !== "string" ? pending.id : null;
  }, []);

  const updateDrink = useCallback(
    async (id: number, input: DrinkInput) => {
      const realId = await resolveDrinkId(id);
      if (!realId) {
        return "drinkNotFound";
      }
      try {
        const { ok, data } = await sendJson<DrinkMutationResponse>(
          `/api/drinks/${realId}`,
          "PATCH",
          input,
        );
        if (ok && data.drink) {
          dispatch({ type: "replace_drink", id: realId, drink: data.drink });
          return null;
        }
        return data.code ?? "couldNotSave";
      } catch (error) {
        return failure(error, "couldNotSave");
      }
    },
    [dispatch, resolveDrinkId, failure],
  );

  const removeDrink = useCallback(
    async (id: number) => {
      const realId = await resolveDrinkId(id);
      if (!realId) {
        return null;
      }
      const removed = state.drinks.find((drink) => drink.id === realId);
      dispatch({ type: "remove_drink", id: realId });
      try {
        const { ok, data } = await sendJson<ApiErrorResponse>(
          `/api/drinks/${realId}`,
          "DELETE",
        );
        if (ok || data.code === "drinkNotFound") {
          return null;
        }
        if (removed) {
          dispatch({ type: "add_drink", drink: removed });
        }
        return data.code ?? "couldNotRemove";
      } catch (error) {
        if (removed) {
          dispatch({ type: "add_drink", drink: removed });
        }
        return failure(error, "couldNotRemove");
      }
    },
    [dispatch, resolveDrinkId, state.drinks, failure],
  );

  const setCurrency = useCallback(
    async (currency: string) => {
      try {
        const { ok, data } = await sendJson<ApiErrorResponse>(
          "/api/user",
          "PATCH",
          { currency },
        );
        if (ok) {
          dispatch({ type: "set_currency", currency });
          return null;
        }
        return data.code ?? "couldNotSave";
      } catch (error) {
        return failure(error, "couldNotSave");
      }
    },
    [dispatch, failure],
  );

  // A missing or dead session signs out; anything else (offline, a server
  // error) is a failed load the visitor can retry, never a sign-out.
  const hydrate = useCallback(async () => {
    dispatch({ type: "loading" });
    try {
      await loadUser();
    } catch (error) {
      if (error instanceof SessionExpiredError) {
        await expire();
      } else {
        dispatch({
          type: "load_failed",
          reason:
            error instanceof RateLimitedError
              ? "tooManyRequests"
              : navigator.onLine === false
                ? "loadFailedOffline"
                : "loadFailedBody",
        });
      }
    } finally {
      dispatch({ type: "done_loading" });
    }
  }, [dispatch, loadUser, expire]);

  useEffect(() => {
    if (skipHydration) {
      dispatch({ type: "done_loading" });
      return;
    }

    void hydrate();
  }, [dispatch, hydrate, skipHydration]);

  const user = useMemo<UserSession | null>(() => {
    if (!state.username || !state.createdAt) {
      return null;
    }

    return {
      username: state.username,
      createdAt: state.createdAt,
      currency: state.currency,
      shops: state.shops,
      drinks: state.drinks,
    };
  }, [
    state.username,
    state.createdAt,
    state.currency,
    state.shops,
    state.drinks,
  ]);

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      isLoadingUser: state.isLoading,
      loadFailed: state.loadFailed,
      retryLoad: hydrate,
      login,
      logout,
      addShop,
      removeShop,
      logDrink,
      updateDrink,
      removeDrink,
      setCurrency,
    }),
    [
      user,
      state.isLoading,
      state.loadFailed,
      hydrate,
      login,
      logout,
      addShop,
      removeShop,
      logDrink,
      updateDrink,
      removeDrink,
      setCurrency,
    ],
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
