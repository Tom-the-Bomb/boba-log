import type { BobaShop } from "../types";
import { getDb } from "./db";
import { getAvatarUrl } from "./r2";

interface ShopRow {
  id: number;
  name: string;
}

export async function listShopRows(username: string): Promise<ShopRow[]> {
  const { results } = await getDb()
    .prepare("SELECT id, name FROM shops WHERE username = ? ORDER BY id")
    .bind(username)
    .all<ShopRow>();
  return results;
}

export async function listShops(username: string): Promise<BobaShop[]> {
  const rows = await listShopRows(username);
  return Promise.all(
    rows.map(async (row) => ({ ...row, avatar: await getAvatarUrl(row.id) })),
  );
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

  return { ...row, avatar: null };
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
