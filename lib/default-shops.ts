import defaultShops from "@/public/default-shops/presets.json";

export interface DefaultShopPresetOption {
  en: string;
  zh: string;
  avatar: string;
}

export function findDefaultShop(
  name: string,
): DefaultShopPresetOption | undefined {
  const nameLower = name.trim().toLocaleLowerCase();
  return DEFAULT_SHOPS.find(
    (preset) =>
      preset.zh.trim().toLocaleLowerCase("zh") === nameLower ||
      preset.en.trim().toLowerCase() === nameLower,
  );
}

export function translateShopName(name: string, locale: string): string {
  return (
    findDefaultShop(name)?.[locale as keyof DefaultShopPresetOption] ?? name
  );
}

export const DEFAULT_SHOPS: readonly DefaultShopPresetOption[] = defaultShops;
