import { addDays, dayFromUTCDate, isValidDay } from "../date";
import {
  EARLIEST_DAY,
  MAX_DRINK_NAME_LENGTH,
  MAX_DRINK_NOTE_LENGTH,
  MAX_PRICE_CENTS,
} from "../drinks";
import type { DrinkInput } from "../types";

type ParseResult<T> = { ok: true; value: T } | { ok: false; code: string };

// Up to tomorrow in UTC, which is still today as far east as UTC+14.
function parseDay(value: unknown): ParseResult<string> {
  if (typeof value !== "string" || !isValidDay(value)) {
    return { ok: false, code: "invalidDay" };
  }
  const latest = addDays(dayFromUTCDate(new Date()), 1);
  if (value < EARLIEST_DAY || value > latest) {
    return { ok: false, code: "invalidDay" };
  }
  return { ok: true, value };
}

function parseOptionalText(
  value: unknown,
  maxLength: number,
  tooLongCode: string,
): ParseResult<string | null> {
  if (value === null || value === undefined) {
    return { ok: true, value: null };
  }
  if (typeof value !== "string") {
    return { ok: false, code: "invalidRequest" };
  }
  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    return { ok: false, code: tooLongCode };
  }
  return { ok: true, value: trimmed || null };
}

function parseOptionalPrice(value: unknown): ParseResult<number | null> {
  if (value === null || value === undefined) {
    return { ok: true, value: null };
  }
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < 0 ||
    value > MAX_PRICE_CENTS
  ) {
    return { ok: false, code: "invalidPrice" };
  }
  return { ok: true, value };
}

export function parseDrinkInput(
  body: Record<string, unknown>,
): ParseResult<Required<DrinkInput>> {
  const day = parseDay(body.day);
  if (!day.ok) {
    return day;
  }
  const name = parseOptionalText(
    body.name,
    MAX_DRINK_NAME_LENGTH,
    "drinkNameTooLong",
  );
  if (!name.ok) {
    return name;
  }
  const price = parseOptionalPrice(body.priceCents);
  if (!price.ok) {
    return price;
  }
  const note = parseOptionalText(
    body.note,
    MAX_DRINK_NOTE_LENGTH,
    "drinkNoteTooLong",
  );
  if (!note.ok) {
    return note;
  }
  return {
    ok: true,
    value: {
      day: day.value,
      name: name.value,
      priceCents: price.value,
      note: note.value,
    },
  };
}

export function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}
