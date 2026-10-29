import type { Drink, DrinkInput } from "../types";
import { getDb } from "./db";

const DRINK_COLUMNS =
  "id, shop_id AS shopId, day, created_at AS createdAt, name, price_cents AS priceCents, note";

export async function listDrinks(username: string): Promise<Drink[]> {
  const { results } = await getDb()
    .prepare(
      `SELECT ${DRINK_COLUMNS} FROM drinks
       WHERE shop_id IN (SELECT id FROM shops WHERE username = ?)
       ORDER BY day, created_at, id`,
    )
    .bind(username)
    .all<Drink>();
  return results;
}

export async function createDrink(
  username: string,
  shopId: number,
  input: Required<DrinkInput>,
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
      input.name,
      input.priceCents,
      input.note,
      shopId,
      username,
    )
    .first<Drink>();
}

export async function updateDrink(
  username: string,
  drinkId: number,
  shopId: number,
  input: Required<DrinkInput>,
): Promise<Drink | null> {
  return getDb()
    .prepare(
      `UPDATE drinks SET shop_id = ?, day = ?, name = ?, price_cents = ?, note = ?
       WHERE id = ?
         AND shop_id IN (SELECT id FROM shops WHERE username = ?)
         AND ? IN (SELECT id FROM shops WHERE username = ?)
       RETURNING ${DRINK_COLUMNS}`,
    )
    .bind(
      shopId,
      input.day,
      input.name,
      input.priceCents,
      input.note,
      drinkId,
      username,
      shopId,
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
