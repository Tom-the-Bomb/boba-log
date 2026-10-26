// Days are plain `YYYY-MM-DD` strings. Arithmetic runs on UTC midnights so a
// day never shifts with the viewer's time zone or daylight saving.

const DAY_MS = 86_400_000;
const DAY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function dayFromUTCDate(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function dayToUTCDate(day: string): Date {
  return new Date(`${day}T00:00:00.000Z`);
}

/** The calendar day of a moment in the viewer's own time zone. */
export function dayFromLocalDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function localToday(): string {
  return dayFromLocalDate(new Date());
}

export function isValidDay(value: string): boolean {
  const match = DAY_PATTERN.exec(value);
  if (!match) {
    return false;
  }
  return dayFromUTCDate(dayToUTCDate(value)) === value;
}

export function addDays(day: string, amount: number): string {
  return dayFromUTCDate(
    new Date(dayToUTCDate(day).getTime() + amount * DAY_MS),
  );
}

export function daysBetween(start: string, end: string): number {
  return Math.round(
    (dayToUTCDate(end).getTime() - dayToUTCDate(start).getTime()) / DAY_MS,
  );
}

export function dayParts(day: string) {
  const date = dayToUTCDate(day);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth(),
    date: date.getUTCDate(),
    weekday: date.getUTCDay(),
  };
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

export function dayFromParts(year: number, month: number, date: number) {
  return `${year}-${pad(month + 1)}-${pad(date)}`;
}

export function intlLocale(language: string) {
  return language === "zh" ? "zh-CN" : "en-US";
}

export function formatDay(
  day: string,
  language: string,
  options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  },
): string {
  return new Intl.DateTimeFormat(intlLocale(language), {
    ...options,
    timeZone: "UTC",
  }).format(dayToUTCDate(day));
}

export function monthName(
  month: number,
  language: string,
  width: "short" | "long" = "short",
): string {
  return new Intl.DateTimeFormat(intlLocale(language), {
    month: width,
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2000, month, 1)));
}

export function weekdayName(
  weekday: number,
  language: string,
  width: "narrow" | "short" | "long" = "short",
): string {
  // 2000-01-02 was a Sunday.
  return new Intl.DateTimeFormat(intlLocale(language), {
    weekday: width,
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2000, 0, 2 + weekday)));
}
