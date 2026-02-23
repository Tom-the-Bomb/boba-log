import { BobaShop, PublicUser, ShopDocument } from "../types";
import { getDb } from "./db";
import { checkPublicAvatarExists, getPublicAvatarUrl } from "./r2";

interface ShopDateJoinRow {
  shop_id: number;
  shop_name: string;
  shop_total: number;
  date_key: number | null;
  count: number | null;
}

interface UserShopRow {
  created_at: number;
  shop_id: number | null;
  shop_name: string | null;
  shop_total: number | null;
  date_key: number | null;
  count: number | null;
}

async function toPublicShop(shop: ShopDocument): Promise<BobaShop> {
  const hasR2Avatar = await checkPublicAvatarExists(shop.id);
  return {
    ...shop,
    avatar: hasR2Avatar ? getPublicAvatarUrl(shop.id) : null,
  };
}

function rowsToShops(rows: ShopDateJoinRow[]): ShopDocument[] {
  const map = new Map<number, ShopDocument>();
  for (const row of rows) {
    let shop = map.get(row.shop_id);
    if (!shop) {
      shop = {
        id: row.shop_id,
        name: row.shop_name,
        total: row.shop_total,
        dates: {},
      };
      map.set(row.shop_id, shop);
    }
    if (row.date_key !== null && row.count !== null) {
      shop.dates[row.date_key] = row.count;
    }
  }
  return Array.from(map.values());
}

async function getShopAsPublic(
  db: D1Database,
  shopId: number,
): Promise<BobaShop | null> {
  const { results } = await db
    .prepare(
      `SELECT s.id AS shop_id, s.name AS shop_name, s.total AS shop_total,
              sd.date_key, sd.count
       FROM shops s
       LEFT JOIN shop_dates sd ON sd.shop_id = s.id
       WHERE s.id = ?`,
    )
    .bind(shopId)
    .all<ShopDateJoinRow>();

  const shops = rowsToShops(results);
  if (shops.length === 0) {
    return null;
  }
  return toPublicShop(shops[0]);
}

export async function getUserByUsername(username: string) {
  const db = getDb();
  return db
    .prepare("SELECT hashed_password FROM users WHERE username = ?")
    .bind(username)
    .first<{ hashed_password: string }>();
}

export async function createUser(
  username: string,
  hashedPassword: string,
): Promise<PublicUser> {
  const db = getDb();
  const createdAt = Math.floor(Date.now() / 1000);

  await db
    .prepare(
      "INSERT INTO users (username, hashed_password, created_at) VALUES (?, ?, ?)",
    )
    .bind(username, hashedPassword, createdAt)
    .run();

  return {
    username,
    created_at: createdAt,
    shops: [],
  };
}

export async function getPublicUser(
  username: string,
): Promise<PublicUser | null> {
  const db = getDb();

  const { results } = await db
    .prepare(
      `SELECT u.created_at, s.id AS shop_id, s.name AS shop_name, s.total AS shop_total,
              sd.date_key, sd.count
       FROM users u
       LEFT JOIN shops s ON s.username = u.username
       LEFT JOIN shop_dates sd ON sd.shop_id = s.id
       WHERE u.username = ?`,
    )
    .bind(username)
    .all<UserShopRow>();

  if (results.length === 0) {
    return null;
  }

  const shopRows = results.filter(
    (r): r is UserShopRow & ShopDateJoinRow => r.shop_id !== null,
  );
  const shops = await Promise.all(rowsToShops(shopRows).map(toPublicShop));

  return {
    username,
    created_at: results[0].created_at,
    shops,
  };
}

export async function addShop(
  username: string,
  name: string,
): Promise<BobaShop> {
  const db = getDb();

  const result = await db
    .prepare("INSERT INTO shops (username, name, total) VALUES (?, ?, 0)")
    .bind(username, name)
    .run();

  return {
    id: result.meta.last_row_id,
    name,
    total: 0,
    dates: {},
    avatar: null,
  };
}

function todayDateKey(): number {
  const now = new Date();
  return Math.floor(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 1000,
  );
}

export async function incrementShop(
  username: string,
  shopId: number,
): Promise<BobaShop | null> {
  const db = getDb();
  const dateKey = todayDateKey();

  const batchResults = await db.batch([
    db
      .prepare(
        "UPDATE shops SET total = total + 1 WHERE id = ? AND username = ?",
      )
      .bind(shopId, username),
    db
      .prepare(
        `INSERT INTO shop_dates (shop_id, date_key, count)
         SELECT ?, ?, 1 FROM shops WHERE id = ? AND username = ?
         ON CONFLICT (shop_id, date_key) DO UPDATE SET count = count + 1`,
      )
      .bind(shopId, dateKey, shopId, username),
  ]);

  if (batchResults[0].meta.changes === 0) {
    return null;
  }

  return getShopAsPublic(db, shopId);
}

export async function deleteShop(
  username: string,
  shopId: number,
): Promise<boolean> {
  const db = getDb();
  const result = await db
    .prepare("DELETE FROM shops WHERE id = ? AND username = ?")
    .bind(shopId, username)
    .run();
  return result.meta.changes > 0;
}

export async function undoShopIncrement(
  username: string,
  shopId: number,
): Promise<BobaShop | null> {
  const db = getDb();
  const dateKey = todayDateKey();

  const row = await db
    .prepare(
      `SELECT s.total, sd.count AS today_count
       FROM shops s
       LEFT JOIN shop_dates sd ON sd.shop_id = s.id AND sd.date_key = ?
       WHERE s.id = ? AND s.username = ?`,
    )
    .bind(dateKey, shopId, username)
    .first<{ total: number; today_count: number | null }>();

  if (!row) {
    return null;
  }

  if (!row.today_count || row.today_count <= 0) {
    return getShopAsPublic(db, shopId);
  }

  await db.batch([
    db.prepare("UPDATE shops SET total = total - 1 WHERE id = ?").bind(shopId),
    db
      .prepare(
        "UPDATE shop_dates SET count = count - 1 WHERE shop_id = ? AND date_key = ?",
      )
      .bind(shopId, dateKey),
    db
      .prepare(
        "DELETE FROM shop_dates WHERE shop_id = ? AND date_key = ? AND count <= 0",
      )
      .bind(shopId, dateKey),
  ]);

  return getShopAsPublic(db, shopId);
}
