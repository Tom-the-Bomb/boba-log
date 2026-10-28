import defaultShops from "@/public/default-shops/presets.json";

export interface DefaultShopPresetOption {
  en: string;
  zh: string;
  avatar: string;
}

export function findDefaultShop(
  name: string,
): DefaultShopPresetOption | undefined {
  const key = name.trim().toLowerCase();
  return DEFAULT_SHOPS.find((preset) =>
    [preset.en, preset.zh].some(
      (presetName) => presetName.toLowerCase() === key,
    ),
  );
}

export function translateShopName(name: string, locale: string): string {
  return (
    findDefaultShop(name)?.[locale as keyof DefaultShopPresetOption] ?? name
  );
}

export const DEFAULT_SHOPS: readonly DefaultShopPresetOption[] = defaultShops;
