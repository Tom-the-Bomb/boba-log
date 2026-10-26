import type { Drink, DrinkInput } from "../types";
import { getDb } from "./db";

interface DrinkRow {
  id: number;
  shop_id: number;
  day: string;
  created_at: number;
  name: string | null;
  price_cents: number | null;
  note: string | null;
}

const DRINK_COLUMNS = "id, shop_id, day, created_at, name, price_cents, note";

const UPDATABLE_COLUMNS = {
  day: "day",
  shopId: "shop_id",
  name: "name",
  priceCents: "price_cents",
  note: "note",
} as const satisfies Record<keyof DrinkInput, string>;

function toDrink(row: DrinkRow): Drink {
  return {
    id: row.id,
    shopId: row.shop_id,
    day: row.day,
    createdAt: row.created_at,
    name: row.name,
    priceCents: row.price_cents,
    note: row.note,
  };
}

export async function listDrinks(username: string): Promise<Drink[]> {
  const { results } = await getDb()
    .prepare(
      `SELECT d.id, d.shop_id, d.day, d.created_at, d.name, d.price_cents, d.note
       FROM drinks d
       JOIN shops s ON s.id = d.shop_id
       WHERE s.username = ?
       ORDER BY d.day, d.created_at, d.id`,
    )
    .bind(username)
    .all<DrinkRow>();
  return results.map(toDrink);
}

/** Returns null when the shop does not exist or belongs to someone else. */
export async function createDrink(
  username: string,
  shopId: number,
  input: DrinkInput & { day: string },
): Promise<Drink | null> {
  const row = await getDb()
    .prepare(
      `INSERT INTO drinks (shop_id, day, created_at, name, price_cents, note)
       SELECT id, ?, ?, ?, ?, ? FROM shops WHERE id = ? AND username = ?
       RETURNING ${DRINK_COLUMNS}`,
    )
    .bind(
      input.day,
      Math.floor(Date.now() / 1000),
      input.name ?? null,
      input.priceCents ?? null,
      input.note ?? null,
      shopId,
      username,
    )
    .first<DrinkRow>();
  return row ? toDrink(row) : null;
}

/**
 * Applies the given fields to one of the user's drinks. Moving a drink to
 * another shop requires that shop to be the user's too.
 */
export async function updateDrink(
  username: string,
  drinkId: number,
  input: DrinkInput,
): Promise<Drink | null> {
  const entries = Object.entries(input) as [keyof DrinkInput, unknown][];
  if (entries.length === 0) {
    return getDrink(username, drinkId);
  }

  const assignments = entries.map(([key]) => `${UPDATABLE_COLUMNS[key]} = ?`);
  const values = entries.map(([, value]) => value ?? null);

  const row = await getDb()
    .prepare(
      `UPDATE drinks SET ${assignments.join(", ")}
       WHERE id = ?
         AND shop_id IN (SELECT id FROM shops WHERE username = ?)
         AND (? IS NULL OR ? IN (SELECT id FROM shops WHERE username = ?))
       RETURNING ${DRINK_COLUMNS}`,
    )
    .bind(
      ...values,
      drinkId,
      username,
      input.shopId ?? null,
      input.shopId ?? null,
      username,
    )
    .first<DrinkRow>();
  return row ? toDrink(row) : null;
}

export async function deleteDrink(
  username: string,
  drinkId: number,
): Promise<boolean> {
  const result = await getDb()
    .prepare(
      `DELETE FROM drinks
       WHERE id = ? AND shop_id IN (SELECT id FROM shops WHERE username = ?)`,
    )
    .bind(drinkId, username)
    .run();
  return result.meta.changes > 0;
}

async function getDrink(
  username: string,
  drinkId: number,
): Promise<Drink | null> {
  const row = await getDb()
    .prepare(
      `SELECT d.id, d.shop_id, d.day, d.created_at, d.name, d.price_cents, d.note
       FROM drinks d
       JOIN shops s ON s.id = d.shop_id
       WHERE d.id = ? AND s.username = ?`,
    )
    .bind(drinkId, username)
    .first<DrinkRow>();
  return row ? toDrink(row) : null;
}
