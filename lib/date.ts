import { useTranslation } from "react-i18next";

export function toDateInputValue(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateStringUTC(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export function toDateStringUTC(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatShortDateUTC(
  t: ReturnType<typeof useTranslation>["t"],
  value: string,
): string {
  const date = parseDateStringUTC(value);
  return `${t(`monthLabels[${date.getUTCMonth()}]`)} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

export function sameDayISO(left: string, right: string): boolean {
  return left === right;
}

export function inRangeInclusiveISO(
  day: string,
  start: string,
  end: string,
): boolean {
  return day >= start && day <= end;
}
