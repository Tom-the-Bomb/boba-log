export type AuthMode = "login" | "signup";

export interface Drink {
  id: number;
  shopId: number;
  /** Calendar day the drink belongs to, `YYYY-MM-DD` in the user's local time. */
  day: string;
  createdAt: number;
  name: string | null;
  priceCents: number | null;
  note: string | null;
}

export interface BobaShop {
  id: number;
  name: string;
  avatar: string | null;
}

export interface PublicUser {
  username: string;
  createdAt: number;
  currency: string;
  shops: BobaShop[];
  drinks: Drink[];
}

export interface DrinkInput {
  day: string;
  name?: string | null;
  priceCents?: number | null;
  note?: string | null;
}

export interface ApiErrorResponse {
  error?: string;
  code?: string;
}

export interface ShopMutationResponse extends ApiErrorResponse {
  shop?: BobaShop;
}

export interface DrinkMutationResponse extends ApiErrorResponse {
  drink?: Drink;
}
