import { BobaShop, PublicUser, ShopDocument } from "../types";
import { getDb } from "./db";
import { checkPublicAvatarExists, getPublicAvatarUrl } from "./r2";

interface UserRow {
  id: number;
  username: string;
  hashed_password: string;
  created_at: number;
}

interface ShopDateJoinRow {
  shop_id: number;
  shop_name: string;
  shop_total: number;
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

async function getShopAsPublic(
  db: D1Database,
  shopId: number,
): Promise<BobaShop | null> {
  const rows = await db
    .prepare(
      `SELECT s.id AS shop_id, s.name AS shop_name, s.total AS shop_total,
              sd.date_key, sd.count
       FROM shops s
       LEFT JOIN shop_dates sd ON sd.shop_id = s.id
       WHERE s.id = ?`,
    )
    .bind(shopId)
    .all<ShopDateJoinRow>();

  if (rows.results.length === 0) {
    return null;
  }

  const first = rows.results[0];
  const dates: Record<string, number> = {};
  for (const row of rows.results) {
    if (row.date_key !== null && row.count !== null) {
      dates[row.date_key] = row.count;
    }
  }

  return toPublicShop({
    id: first.shop_id,
    name: first.shop_name,
    total: first.shop_total,
    dates,
  });
}

async function verifyShopOwnership(
  db: D1Database,
  shopId: number,
  username: string,
): Promise<boolean> {
  const row = await db
    .prepare("SELECT 1 FROM shops WHERE id = ? AND username = ?")
    .bind(shopId, username)
    .first();
  return row !== null;
}

export async function getUserByUsername(username: string) {
  const db = getDb();
  return db
    .prepare(
      "SELECT id, username, hashed_password, created_at FROM users WHERE username = ?",
    )
    .bind(username)
    .first<UserRow>();
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
  knownCreatedAt?: number,
): Promise<PublicUser | null> {
  const db = getDb();

  let createdAt = knownCreatedAt;
  if (createdAt === undefined) {
    const user = await db
      .prepare("SELECT created_at FROM users WHERE username = ?")
      .bind(username)
      .first<{ created_at: number }>();

    if (!user) {
      return null;
    }
    createdAt = user.created_at;
  }

  const rows = await db
    .prepare(
      `SELECT s.id AS shop_id, s.name AS shop_name, s.total AS shop_total,
              sd.date_key, sd.count
       FROM shops s
       LEFT JOIN shop_dates sd ON sd.shop_id = s.id
       WHERE s.username = ?`,
    )
    .bind(username)
    .all<ShopDateJoinRow>();

  const shopMap = new Map<
    number,
    { name: string; total: number; dates: Record<string, number> }
  >();
  for (const row of rows.results) {
    let shop = shopMap.get(row.shop_id);
    if (!shop) {
      shop = { name: row.shop_name, total: row.shop_total, dates: {} };
      shopMap.set(row.shop_id, shop);
    }
    if (row.date_key !== null && row.count !== null) {
      shop.dates[row.date_key] = row.count;
    }
  }

  const shops = await Promise.all(
    Array.from(shopMap.entries()).map(([id, shop]) =>
      toPublicShop({ id, ...shop }),
    ),
  );

  return {
    username,
    created_at: createdAt,
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

  const shopId = result.meta.last_row_id as number;
  return toPublicShop({ id: shopId, name, total: 0, dates: {} });
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

  if (!(await verifyShopOwnership(db, shopId, username))) {
    return null;
  }

  const dateKey = todayDateKey();

  await db.batch([
    db.prepare("UPDATE shops SET total = total + 1 WHERE id = ?").bind(shopId),
    db
      .prepare(
        `INSERT INTO shop_dates (shop_id, date_key, count) VALUES (?, ?, 1)
         ON CONFLICT (shop_id, date_key) DO UPDATE SET count = count + 1`,
      )
      .bind(shopId, dateKey),
  ]);

  return getShopAsPublic(db, shopId);
}

export async function deleteShop(
  username: string,
  shopId: number,
): Promise<boolean> {
  const db = getDb();

  if (!(await verifyShopOwnership(db, shopId, username))) {
    return false;
  }

  await db.prepare("DELETE FROM shops WHERE id = ?").bind(shopId).run();
  return true;
}

export async function undoShopIncrement(
  username: string,
  shopId: number,
): Promise<BobaShop | null> {
  const db = getDb();

  const shop = await db
    .prepare("SELECT total FROM shops WHERE id = ? AND username = ?")
    .bind(shopId, username)
    .first<{ total: number }>();

  if (!shop) {
    return null;
  }

  if (shop.total <= 0) {
    return getShopAsPublic(db, shopId);
  }

  const dateKey = todayDateKey();

  const dateRow = await db
    .prepare("SELECT count FROM shop_dates WHERE shop_id = ? AND date_key = ?")
    .bind(shopId, dateKey)
    .first<{ count: number }>();

  const statements = [
    db.prepare("UPDATE shops SET total = total - 1 WHERE id = ?").bind(shopId),
  ];

  if (dateRow && dateRow.count <= 1) {
    statements.push(
      db
        .prepare("DELETE FROM shop_dates WHERE shop_id = ? AND date_key = ?")
        .bind(shopId, dateKey),
    );
  } else if (dateRow) {
    statements.push(
      db
        .prepare(
          "UPDATE shop_dates SET count = count - 1 WHERE shop_id = ? AND date_key = ?",
        )
        .bind(shopId, dateKey),
    );
  }

  await db.batch(statements);

  return getShopAsPublic(db, shopId);
}
