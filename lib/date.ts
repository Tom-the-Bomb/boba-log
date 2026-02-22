import type { TFunction } from "i18next";

export function toDateStringUTC(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateStringUTC(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export function formatShortDateUTC(t: TFunction, value: string): string {
  const date = parseDateStringUTC(value);
  return `${t(`monthLabels[${date.getUTCMonth()}]`)} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}
