import type { Drink, DrinkInput } from "../types";
import { getDb } from "./db";

const DRINK_COLUMNS =
  "id, shop_id AS shopId, day, created_at AS createdAt, name, price_cents AS priceCents, note";
const SELECT_USER_DRINKS = `SELECT ${DRINK_COLUMNS} FROM drinks
  WHERE shop_id IN (SELECT id FROM shops WHERE username = ?)`;

const UPDATABLE_COLUMNS = {
  day: "day",
  shopId: "shop_id",
  name: "name",
  priceCents: "price_cents",
  note: "note",
} as const satisfies Record<keyof DrinkInput, string>;

export async function listDrinks(username: string): Promise<Drink[]> {
  const { results } = await getDb()
    .prepare(`${SELECT_USER_DRINKS} ORDER BY day, created_at, id`)
    .bind(username)
    .all<Drink>();
  return results;
}

export async function createDrink(
  username: string,
  shopId: number,
  input: DrinkInput & { day: string },
): Promise<Drink | null> {
  return getDb()
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
    .first<Drink>();
}

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

  return getDb()
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
    .first<Drink>();
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
  return getDb()
    .prepare(`${SELECT_USER_DRINKS} AND id = ?`)
    .bind(username, drinkId)
    .first<Drink>();
}
