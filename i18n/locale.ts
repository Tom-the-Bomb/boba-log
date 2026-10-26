// Server-safe locale helpers: the root layout reads these without pulling in
// react-i18next, which only runs in client components.
export type Locale = "en" | "zh";

/** Read by the server to render the right language; kept in sync by the client. */
export const LOCALE_COOKIE = "boba_locale";
/** Where the language was kept before it moved to a cookie. */
export const LEGACY_LOCALE_STORAGE_KEY = "boba_locale";

export function toLocale(value: string | null | undefined): Locale {
  return value === "zh" ? "zh" : "en";
}
