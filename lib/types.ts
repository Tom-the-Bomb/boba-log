export type DateCountMap = Record<string, number>;

export interface ShopDocument {
  id: string;
  name: string;
  total: number;
  dates: DateCountMap;
}

export interface BobaShop extends ShopDocument {
  avatar: string;
}

export interface UserDocument {
  username: string;
  hashed_password: string;
  created_at: string;
  shops: ShopDocument[];
}

export interface PublicUser {
  username: string;
  created_at: string;
  shops: BobaShop[];
}
