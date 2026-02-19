type DateCountMap = Record<string, number>;

export interface ShopDocument {
  id: number;
  name: string;
  total: number;
  dates: DateCountMap;
}

export interface BobaShop extends ShopDocument {
  avatar: string | null;
}

export interface PublicUser {
  username: string;
  created_at: number;
  shops: BobaShop[];
}

export interface ApiErrorResponse {
  error?: string;
  code?: string;
}

export interface ShopMutationResponse extends ApiErrorResponse {
  shop?: BobaShop;
}
