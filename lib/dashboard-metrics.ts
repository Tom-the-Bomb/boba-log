import { addDays, dayFromLocalDate, dayParts, daysBetween } from "./date";
import type { Drink } from "./types";

export type RangePreset = "all" | "7" | "30" | "year" | "custom";

export interface DayRange {
  start: string;
  end: string;
}

export const RANGE_PRESETS: readonly Exclude<RangePreset, "custom">[] = [
  "7",
  "30",
  "year",
  "all",
];

export const RANGE_PRESET_KEYS: Record<RangePreset, string> = {
  "7": "range7",
  "30": "range30",
  year: "rangeYear",
  all: "rangeAll",
  custom: "rangeCustom",
};

export function earliestDay(drinks: readonly Drink[], createdAt: number) {
  let earliest = dayFromLocalDate(new Date(createdAt * 1000));
  for (const drink of drinks) {
    if (drink.day < earliest) {
      earliest = drink.day;
    }
  }
  return earliest;
}

export function presetRange(
  preset: Exclude<RangePreset, "custom">,
  today: string,
  earliest: string,
): DayRange {
  switch (preset) {
    case "7":
      return { start: addDays(today, -6), end: today };
    case "30":
      return { start: addDays(today, -29), end: today };
    case "year":
      return { start: `${dayParts(today).year}-01-01`, end: today };
    case "all":
      return { start: earliest < today ? earliest : today, end: today };
  }
}

export function drinksInRange(
  drinks: readonly Drink[],
  { start, end }: DayRange,
): Drink[] {
  return drinks.filter((drink) => drink.day >= start && drink.day <= end);
}

type Weigh = (drink: Drink) => number;
const oneEach: Weigh = () => 1;
export const priceOf: Weigh = (drink) => drink.priceCents ?? 0;

export function countsByShop(drinks: readonly Drink[], weigh = oneEach) {
  const counts = new Map<number, number>();
  for (const drink of drinks) {
    counts.set(drink.shopId, (counts.get(drink.shopId) ?? 0) + weigh(drink));
  }
  return counts;
}

export function countsByDay(drinks: readonly Drink[], weigh = oneEach) {
  const counts = new Map<string, number>();
  for (const drink of drinks) {
    counts.set(drink.day, (counts.get(drink.day) ?? 0) + weigh(drink));
  }
  return counts;
}

// About one, two and three typical drinks' worth, in whole currency units.
export function spendSteps(typical: number) {
  return [1.5, 2.5, 3.5].map((step) =>
    Math.max(100, Math.round((step * typical) / 100) * 100),
  );
}

export function spendLevel(cents: number, steps: readonly number[]) {
  return 1 + steps.filter((step) => cents > step).length;
}

export function typicalPrice(drinks: readonly Drink[]) {
  const prices = drinks
    .flatMap((drink) => (drink.priceCents === null ? [] : [drink.priceCents]))
    .sort((a, b) => a - b);
  return prices.length > 0 ? prices[Math.floor(prices.length / 2)] : null;
}

export function countsByWeekday(drinks: readonly Drink[], weigh = oneEach) {
  const counts = [0, 0, 0, 0, 0, 0, 0];
  for (const drink of drinks) {
    counts[dayParts(drink.day).weekday] += weigh(drink);
  }
  return counts;
}

export function lastDayByShop(drinks: readonly Drink[]) {
  const last = new Map<number, string>();
  for (const drink of drinks) {
    const current = last.get(drink.shopId);
    if (!current || drink.day > current) {
      last.set(drink.shopId, drink.day);
    }
  }
  return last;
}

export function spendSummary(drinks: readonly Drink[]) {
  let cents = 0;
  let priced = 0;
  for (const drink of drinks) {
    if (drink.priceCents !== null) {
      cents += drink.priceCents;
      priced += 1;
    }
  }
  return { cents, priced };
}

export function perWeek(count: number, { start, end }: DayRange) {
  const days = daysBetween(start, end) + 1;
  return (count / days) * 7;
}

export function sortNewestFirst(drinks: readonly Drink[]) {
  return [...drinks].sort(
    (a, b) =>
      b.day.localeCompare(a.day) || b.createdAt - a.createdAt || b.id - a.id,
  );
}

export function countsByMonth(drinks: readonly Drink[], weigh = oneEach) {
  const counts = Array.from({ length: 12 }, () => 0);
  for (const drink of drinks) {
    counts[dayParts(drink.day).month] += weigh(drink);
  }
  return counts;
}

export function countsByYear(
  drinks: readonly Drink[],
  { start, end }: DayRange,
  weigh = oneEach,
) {
  const first = dayParts(start).year;
  const last = dayParts(end).year;
  const counts = new Map<number, number>();
  for (let year = first; year <= last; year++) {
    counts.set(year, 0);
  }
  for (const drink of drinks) {
    const year = dayParts(drink.day).year;
    counts.set(year, (counts.get(year) ?? 0) + weigh(drink));
  }
  return [...counts.entries()];
}
