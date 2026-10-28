import type { BobaShop, Drink, PublicUser } from "@/lib/types";
import { useReducer } from "react";

export type LoadFailure = "offline" | "tooManyRequests" | "loadFailedBody";

interface UserState {
  user: PublicUser | null;
  isLoading: boolean;
  loadFailed: LoadFailure | null;
}

type UserAction =
  | { type: "loaded"; user: PublicUser }
  | { type: "loading" }
  | { type: "load_failed"; reason: LoadFailure }
  | { type: "signed_out" }
  | { type: "add_shop"; shop: BobaShop }
  | { type: "remove_shop"; shopId: number }
  | { type: "add_drink"; drink: Drink }
  | { type: "replace_drink"; id: number; drink: Drink }
  | { type: "remove_drink"; id: number }
  | { type: "set_currency"; currency: string };

const INITIAL_USER_STATE: UserState = {
  user: null,
  isLoading: true,
  loadFailed: null,
};

function withUser(
  state: UserState,
  update: (user: PublicUser) => Partial<PublicUser>,
): UserState {
  return state.user
    ? { ...state, user: { ...state.user, ...update(state.user) } }
    : state;
}

function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case "loaded":
      return { user: action.user, isLoading: false, loadFailed: null };
    case "loading":
      return { ...state, isLoading: true, loadFailed: null };
    case "load_failed":
      return { ...state, isLoading: false, loadFailed: action.reason };
    case "signed_out":
      return { ...INITIAL_USER_STATE, isLoading: false };
    case "add_shop":
      return withUser(state, ({ shops }) => ({
        shops: [...shops, action.shop],
      }));
    case "remove_shop":
      return withUser(state, ({ shops, drinks }) => ({
        shops: shops.filter((shop) => shop.id !== action.shopId),
        drinks: drinks.filter((drink) => drink.shopId !== action.shopId),
      }));
    case "add_drink":
      return withUser(state, ({ drinks }) => ({
        drinks: [...drinks, action.drink],
      }));
    case "replace_drink":
      return withUser(state, ({ drinks }) => ({
        drinks: drinks.map((drink) =>
          drink.id === action.id ? action.drink : drink,
        ),
      }));
    case "remove_drink":
      return withUser(state, ({ drinks }) => ({
        drinks: drinks.filter((drink) => drink.id !== action.id),
      }));
    case "set_currency":
      return withUser(state, () => ({ currency: action.currency }));
  }
}

export default function useUserReducer() {
  return useReducer(userReducer, INITIAL_USER_STATE);
}
