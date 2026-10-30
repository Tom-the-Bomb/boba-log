import { intlLocale } from "./date";
import type { AuthMode } from "./types";

const MAX_USERNAME_LENGTH = 32;
export const MAX_SHOP_NAME_LENGTH = 100;
export const MAX_DRINK_NAME_LENGTH = 100;
export const MAX_DRINK_NOTE_LENGTH = 500;
export const MAX_PRICE_CENTS = 10_000_000;
export const EARLIEST_DAY = "2000-01-01";

export function usernameProblem(value: string, mode: AuthMode) {
  const normalized = value.trim();
  if (!normalized) {
    return "usernameRequired";
  }
  if (mode === "login") {
    return null;
  }
  if (normalized.length < 3) {
    return "usernameMinLength";
  }
  return normalized.length > MAX_USERNAME_LENGTH ? "usernameMaxLength" : null;
}

export function passwordProblem(value: string, mode: AuthMode) {
  if (!value) {
    return "passwordRequired";
  }
  return mode === "signup" && value.length < 6 ? "passwordMinLength" : null;
}

export const CURRENCIES = [
  "USD",
  "CAD",
  "CNY",
  "HKD",
  "TWD",
  "SGD",
  "MYR",
  "AUD",
  "NZD",
  "GBP",
  "EUR",
  "JPY",
  "KRW",
] as const;

type Currency = (typeof CURRENCIES)[number];

export function isCurrency(value: unknown): value is Currency {
  return CURRENCIES.includes(value as Currency);
}

const moneyFormats = new Map<string, Intl.NumberFormat>();

function moneyFormat(language: string, options: Intl.NumberFormatOptions) {
  const key = language + JSON.stringify(options);
  let format = moneyFormats.get(key);
  if (!format) {
    format = new Intl.NumberFormat(intlLocale(language), {
      style: "currency",
      ...options,
    });
    moneyFormats.set(key, format);
  }
  return format;
}

export function formatMoney(
  cents: number,
  currency: string,
  language: string,
): string {
  return moneyFormat(language, { currency }).format(cents / 100);
}

export function formatMoneyShort(
  cents: number,
  currency: string,
  language: string,
): string {
  const amount = cents / 100;
  return moneyFormat(language, {
    currency,
    currencyDisplay: "narrowSymbol",
    ...(amount >= 1000
      ? {
          notation: "compact",
          minimumFractionDigits: 0,
          maximumFractionDigits: 1,
          maximumSignificantDigits: 4,
          roundingPriority: "lessPrecision",
        }
      : amount >= 10 || Number.isInteger(amount)
        ? { minimumFractionDigits: 0, maximumFractionDigits: 0 }
        : {}),
  }).format(amount);
}

export function parsePriceInput(value: string): number | null | undefined {
  const cleaned = value.replace(/,(?=\d{1,2}\D*$)/, ".").replace(/[^\d.]/g, "");
  if (!cleaned) {
    return null;
  }
  const amount = Number(cleaned);
  if (!Number.isFinite(amount)) {
    return undefined;
  }
  const cents = Math.round(amount * 100);
  return cents > MAX_PRICE_CENTS ? undefined : cents;
}

export function priceInputValue(cents: number | null): string {
  if (cents === null) {
    return "";
  }
  return cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2);
}
