import defaultShops from "@/public/default-shops/presets.json";

export interface DefaultShopPreset {
  name: string;
  slug: string;
  avatar: string;
}

export type DefaultShopPresetOption = Pick<
  DefaultShopPreset,
  "name" | "avatar"
>;

export const DEFAULT_SHOPS: ReadonlyArray<DefaultShopPreset> = defaultShops;
