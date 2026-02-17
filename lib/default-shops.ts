import defaultShops from "@/public/default-shops/presets.json";

export interface DefaultShopPresetOption {
  name: string;
  avatar: string;
}

export const DEFAULT_SHOPS: readonly DefaultShopPresetOption[] = defaultShops;
