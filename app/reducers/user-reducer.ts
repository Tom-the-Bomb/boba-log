import type { BobaShop, Drink, PublicUser } from "@/lib/types";
import { useReducer } from "react";

/** Why the account did not load, as a message key in the common namespace. */
export type LoadFailure =
  | "loadFailedOffline"
  | "tooManyRequests"
  | "loadFailedBody";

interface UserState {
  username: string | null;
  createdAt: number | null;
  currency: string;
  shops: BobaShop[];
  drinks: Drink[];
  isLoading: boolean;
  /** Set when the account could not be loaded. */
  loadFailed: LoadFailure | null;
}

type UserAction =
  | { type: "loaded"; user: PublicUser }
  | { type: "loading" }
  | { type: "done_loading" }
  | { type: "load_failed"; reason: LoadFailure }
  | { type: "signed_out" }
  | { type: "add_shop"; shop: BobaShop }
  | { type: "remove_shop"; shopId: number }
  | { type: "add_drink"; drink: Drink }
  | { type: "replace_drink"; id: number; drink: Drink }
  | { type: "remove_drink"; id: number }
  | { type: "set_currency"; currency: string };

const INITIAL_USER_STATE: UserState = {
  username: null,
  createdAt: null,
  currency: "USD",
  shops: [],
  drinks: [],
  isLoading: true,
  loadFailed: null,
};

function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case "loaded":
      return {
        ...state,
        username: action.user.username,
        createdAt: action.user.createdAt,
        currency: action.user.currency,
        shops: action.user.shops,
        drinks: action.user.drinks,
        loadFailed: null,
      };
    case "loading":
      return { ...state, isLoading: true, loadFailed: null };
    case "load_failed":
      return { ...state, loadFailed: action.reason };
    case "signed_out":
      return { ...INITIAL_USER_STATE, isLoading: false };
    case "done_loading":
      return { ...state, isLoading: false };
    case "add_shop":
      return { ...state, shops: [...state.shops, action.shop] };
    case "remove_shop":
      return {
        ...state,
        shops: state.shops.filter((shop) => shop.id !== action.shopId),
        drinks: state.drinks.filter((drink) => drink.shopId !== action.shopId),
      };
    case "add_drink":
      return { ...state, drinks: [...state.drinks, action.drink] };
    case "replace_drink":
      return {
        ...state,
        drinks: state.drinks.map((drink) =>
          drink.id === action.id ? action.drink : drink,
        ),
      };
    case "remove_drink":
      return {
        ...state,
        drinks: state.drinks.filter((drink) => drink.id !== action.id),
      };
    case "set_currency":
      return { ...state, currency: action.currency };
  }
}

export default function useUserReducer() {
  return useReducer(userReducer, INITIAL_USER_STATE);
}
