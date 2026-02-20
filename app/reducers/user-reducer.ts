import type { BobaShop } from "@/lib/types";
import { useReducer } from "react";

interface UserState {
  username: string | null;
  createdAt: number | null;
  shops: BobaShop[];
  isLoading: boolean;
}

type UserAction =
  | { type: "loaded"; username: string; createdAt: number; shops: BobaShop[] }
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
    case "loading":
      return { ...state, isLoading: true };
    case "done_loading":
      return { ...state, isLoading: false };
    case "update_shops":
      return { ...state, shops: action.updater(state.shops) };
  }
}

const INITIAL_USER_STATE: UserState = {
  username: null,
  createdAt: null,
  shops: [],
  isLoading: true,
};

export default function useUserReducer() {
  return useReducer(userReducer, INITIAL_USER_STATE);
}
