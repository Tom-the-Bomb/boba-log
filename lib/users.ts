import { getDb } from "./db";
import { DEFAULT_SHOPS } from "./default-shops";
import { checkPublicAvatarExists, getPublicAvatarUrl } from "./r2";
import { BobaShop, PublicUser, ShopDocument } from "./types";

interface UserRow {
  id: number;
  username: string;
  hashed_password: string;
  created_at: number;
}

interface ShopRow {
  id: number;
  name: string;
  total: number;
}

interface DateRow {
  shop_id: number;
  date_key: string;
  count: number;
}

async function toPublicShop(shop: ShopDocument): Promise<BobaShop> {
  const defaultAvatar =
    DEFAULT_SHOPS.find(
      (defaultShop) =>
        defaultShop.name.trim().toLowerCase() ===
        shop.name.trim().toLowerCase(),
    )?.avatar ?? null;

  if (defaultAvatar) {
    return {
      ...shop,
      avatar: defaultAvatar,
    };
  }

  const r2AvatarUrl = getPublicAvatarUrl(shop.id);
  const hasR2Avatar = await checkPublicAvatarExists(shop.id);

  return {
    ...shop,
    avatar: hasR2Avatar ? r2AvatarUrl : null,
  };
}

function buildShopDocument(
  shopRow: ShopRow,
  dateRows: DateRow[],
): ShopDocument {
  const dates: Record<string, number> = {};
  for (const row of dateRows) {
    dates[row.date_key] = row.count;
  }
  return {
    id: shopRow.id,
    name: shopRow.name,
    total: shopRow.total,
    dates,
  };
}

async function getShopAsPublic(
  db: D1Database,
  shopId: number,
): Promise<BobaShop | null> {
  const shopRow = await db
    .prepare("SELECT id, name, total FROM shops WHERE id = ?")
    .bind(shopId)
    .first<ShopRow>();

  if (!shopRow) {
    return null;
  }

  const dateRows = await db
    .prepare(
      "SELECT shop_id, date_key, count FROM shop_dates WHERE shop_id = ?",
    )
    .bind(shopId)
    .all<DateRow>();

  const doc = buildShopDocument(shopRow, dateRows.results);
  return await toPublicShop(doc);
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
): Promise<PublicUser | null> {
  const db = getDb();

  const user = await db
    .prepare("SELECT username, created_at FROM users WHERE username = ?")
    .bind(username)
    .first<{ username: string; created_at: number }>();

  if (!user) {
    return null;
  }

  const shopRows = await db
    .prepare("SELECT id, name, total FROM shops WHERE username = ?")
    .bind(username)
    .all<ShopRow>();

  const shops: BobaShop[] = [];
  if (shopRows.results.length > 0) {
    const dateRows = await db
      .prepare(
        `SELECT sd.shop_id, sd.date_key, sd.count
         FROM shop_dates sd
         JOIN shops s ON sd.shop_id = s.id
         WHERE s.username = ?`,
      )
      .bind(username)
      .all<DateRow>();

    const datesByShop = new Map<number, DateRow[]>();
    for (const row of dateRows.results) {
      const arr = datesByShop.get(row.shop_id) ?? [];
      arr.push(row);
      datesByShop.set(row.shop_id, arr);
    }

    const publicShops = await Promise.all(
      shopRows.results.map(async (shopRow) => {
        const doc = buildShopDocument(
          shopRow,
          datesByShop.get(shopRow.id) ?? [],
        );
        return await toPublicShop(doc);
      }),
    );
    shops.push(...publicShops);
  }

  return {
    username: user.username,
    created_at: user.created_at,
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
  const doc: ShopDocument = { id: shopId, name, total: 0, dates: {} };
  return await toPublicShop(doc);
}

function todayIsoDateKey() {
  const now = new Date();
  const utcMidnight = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  return utcMidnight.toISOString();
}

export async function incrementShop(
  username: string,
  shopId: number,
): Promise<BobaShop | null> {
  const db = getDb();

  const owns = await db
    .prepare("SELECT 1 FROM shops WHERE id = ? AND username = ?")
    .bind(shopId, username)
    .first();

  if (!owns) {
    return null;
  }

  const dateKey = todayIsoDateKey();

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

export async function undoShopIncrement(
  username: string,
  shopId: number,
): Promise<BobaShop | null> {
  const db = getDb();

  const owns = await db
    .prepare("SELECT 1 FROM shops WHERE id = ? AND username = ?")
    .bind(shopId, username)
    .first();

  if (!owns) {
    return null;
  }

  const shop = await db
    .prepare("SELECT total FROM shops WHERE id = ?")
    .bind(shopId)
    .first<{ total: number }>();

  if (!shop || shop.total <= 0) {
    return getShopAsPublic(db, shopId);
  }

  const dateKey = todayIsoDateKey();

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
