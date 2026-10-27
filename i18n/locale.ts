export type Locale = "en" | "zh";

export const LOCALE_COOKIE = "boba_locale";
export const LEGACY_LOCALE_STORAGE_KEY = "boba_locale";

export function toLocale(value: string | null | undefined): Locale {
  return value === "zh" ? "zh" : "en";
}
