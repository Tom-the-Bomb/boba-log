"use client";

import { failureCode, sendJson } from "@/lib/network";
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
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import useUserReducer, { type LoadFailure } from "../reducers/user-reducer";

type MutationResult = Promise<string | null>;

interface UserContextValue {
  user: PublicUser | null;
  isLoadingUser: boolean;
  loadFailed: LoadFailure | null;
  retryLoad: () => Promise<void>;
  logout: () => Promise<void>;
  addShop: (shop: BobaShop) => void;
  removeShop: (shopId: number) => void;
  logDrink: (shopId: number, input: DrinkInput) => Promise<Drink | string>;
  updateDrink: (
    id: number,
    input: DrinkInput & { shopId: number },
  ) => MutationResult;
  removeDrink: (drink: Drink) => MutationResult;
  setCurrency: (currency: string) => MutationResult;
}

const UserContext = createContext<UserContextValue | null>(null);

class SessionExpiredError extends Error {}

async function send<T extends ApiErrorResponse>(
  url: string,
  method: string,
  body?: unknown,
) {
  const result = await sendJson<T>(url, method, body);
  if (result.status === 401) {
    throw new SessionExpiredError();
  }
  return result;
}

export default function UserProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useUserReducer();
  // Optimistic drinks carry negative ids until the server answers.
  const nextTempId = useRef(-1);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
  }, []);

  const expire = useCallback(async () => {
    try {
      await logout();
    } catch {}
    dispatch({ type: "signed_out" });
  }, [dispatch, logout]);

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

  const hydrate = useCallback(async () => {
    dispatch({ type: "loading" });
    try {
      const { ok, data } = await send<ApiErrorResponse & { user: PublicUser }>(
        "/api/user",
        "GET",
      );
      if (ok) {
        dispatch({ type: "loaded", user: data.user });
      } else {
        dispatch({
          type: "load_failed",
          reason:
            data.code === "tooManyRequests"
              ? "tooManyRequests"
              : "loadFailedBody",
        });
      }
    } catch (error) {
      if (error instanceof SessionExpiredError) {
        await expire();
      } else {
        dispatch({
          type: "load_failed",
          reason: failureCode("loadFailedBody"),
        });
      }
    }
  }, [dispatch, expire]);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const addShop = useCallback(
    (shop: BobaShop) => dispatch({ type: "add_shop", shop }),
    [dispatch],
  );

  const removeShop = useCallback(
    (shopId: number) => dispatch({ type: "remove_shop", shopId }),
    [dispatch],
  );

  const logDrink = useCallback(
    async (shopId: number, input: DrinkInput) => {
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
      try {
        const { ok, data } = await send<DrinkMutationResponse>(
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
      }
    },
    [dispatch, failure],
  );

  const updateDrink = useCallback(
    async (id: number, input: DrinkInput & { shopId: number }) => {
      try {
        const { ok, data } = await send<DrinkMutationResponse>(
          `/api/drinks/${id}`,
          "PUT",
          input,
        );
        if (ok && data.drink) {
          dispatch({ type: "replace_drink", id, drink: data.drink });
          return null;
        }
        return data.code ?? "couldNotSave";
      } catch (error) {
        return failure(error, "couldNotSave");
      }
    },
    [dispatch, failure],
  );

  const removeDrink = useCallback(
    async (drink: Drink) => {
      dispatch({ type: "remove_drink", id: drink.id });
      try {
        const { ok, data } = await send<ApiErrorResponse>(
          `/api/drinks/${drink.id}`,
          "DELETE",
        );
        if (ok || data.code === "drinkNotFound") {
          return null;
        }
        dispatch({ type: "add_drink", drink });
        return data.code ?? "couldNotRemove";
      } catch (error) {
        dispatch({ type: "add_drink", drink });
        return failure(error, "couldNotRemove");
      }
    },
    [dispatch, failure],
  );

  const setCurrency = useCallback(
    async (currency: string) => {
      try {
        const { ok, data } = await send<ApiErrorResponse>(
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

  const value = useMemo<UserContextValue>(
    () => ({
      user: state.user,
      isLoadingUser: state.isLoading,
      loadFailed: state.loadFailed,
      retryLoad: hydrate,
      logout,
      addShop,
      removeShop,
      logDrink,
      updateDrink,
      removeDrink,
      setCurrency,
    }),
    [
      state,
      hydrate,
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
