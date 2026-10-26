import type { BobaShop } from "../types";
import { getDb } from "./db";
import { checkPublicAvatarExists, getPublicAvatarUrl } from "./r2";

interface ShopRow {
  id: number;
  name: string;
}

async function toPublicShop(row: ShopRow): Promise<BobaShop> {
  const hasAvatar = await checkPublicAvatarExists(row.id);
  return {
    id: row.id,
    name: row.name,
    avatar: hasAvatar ? getPublicAvatarUrl(row.id) : null,
  };
}

export async function listShops(username: string): Promise<BobaShop[]> {
  const { results } = await getDb()
    .prepare("SELECT id, name FROM shops WHERE username = ? ORDER BY id")
    .bind(username)
    .all<ShopRow>();
  return Promise.all(results.map(toPublicShop));
}

export async function listShopIds(username: string): Promise<number[]> {
  const { results } = await getDb()
    .prepare("SELECT id FROM shops WHERE username = ?")
    .bind(username)
    .all<{ id: number }>();
  return results.map((row) => row.id);
}

export async function addShop(
  username: string,
  name: string,
): Promise<BobaShop> {
  const row = await getDb()
    .prepare(
      "INSERT INTO shops (username, name) VALUES (?, ?) RETURNING id, name",
    )
    .bind(username, name)
    .first<ShopRow>();

  if (!row) {
    throw new Error("Could not create shop.");
  }

  return { id: row.id, name: row.name, avatar: null };
}

export async function deleteShop(
  username: string,
  shopId: number,
): Promise<boolean> {
  const result = await getDb()
    .prepare("DELETE FROM shops WHERE id = ? AND username = ?")
    .bind(shopId, username)
    .run();
  return result.meta.changes > 0;
}
