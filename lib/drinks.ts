import { intlLocale } from "./date";

export const MAX_SHOP_NAME_LENGTH = 100;
export const MAX_DRINK_NAME_LENGTH = 100;
export const MAX_DRINK_NOTE_LENGTH = 500;
export const MAX_PRICE_CENTS = 10_000_000;
export const EARLIEST_DAY = "2000-01-01";

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

export type Currency = (typeof CURRENCIES)[number];

export function isCurrency(value: unknown): value is Currency {
  return CURRENCIES.includes(value as Currency);
}

export function formatMoney(
  cents: number,
  currency: string,
  language: string,
): string {
  return new Intl.NumberFormat(intlLocale(language), {
    style: "currency",
    currency,
  }).format(cents / 100);
}

/** A short amount for chart labels: "$6.20", "$42", "$1.2K", with the narrow
 *  symbol in every language. */
export function formatMoneyShort(
  cents: number,
  currency: string,
  language: string,
): string {
  const amount = cents / 100;
  return new Intl.NumberFormat(intlLocale(language), {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    ...(amount >= 1000
      ? {
          notation: "compact",
          minimumFractionDigits: 0,
          maximumFractionDigits: 1,
        }
      : amount >= 10 || Number.isInteger(amount)
        ? { minimumFractionDigits: 0, maximumFractionDigits: 0 }
        : {}),
  }).format(amount);
}

/** Parses a typed price such as "6.5" or "$6.50" into cents. */
export function parsePriceInput(value: string): number | null | undefined {
  const cleaned = value.replace(/[^\d.]/g, "");
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
