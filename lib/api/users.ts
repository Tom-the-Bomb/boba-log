import type { PublicUser } from "../types";
import { getDb } from "./db";
import { listDrinks } from "./drinks";
import { listShops } from "./shops";

interface UserRow {
  hashed_password: string;
  created_at: number;
  currency: string;
  sessions_valid_after: number;
}

export async function getUser(username: string) {
  return getDb()
    .prepare(
      "SELECT hashed_password, created_at, currency, sessions_valid_after FROM users WHERE username = ?",
    )
    .bind(username)
    .first<UserRow>();
}

export async function createUser(username: string, hashedPassword: string) {
  const row = await getDb()
    .prepare(
      `INSERT INTO users (username, hashed_password, created_at) VALUES (?, ?, ?)
       ON CONFLICT (username) DO NOTHING
       RETURNING username`,
    )
    .bind(username, hashedPassword, Math.floor(Date.now() / 1000))
    .first<{ username: string }>();
  return row !== null;
}

export async function getPublicUser(
  username: string,
): Promise<PublicUser | null> {
  const [user, shops, drinks] = await Promise.all([
    getUser(username),
    listShops(username),
    listDrinks(username),
  ]);
  if (!user) {
    return null;
  }
  return {
    username,
    createdAt: user.created_at,
    currency: user.currency,
    shops,
    drinks,
  };
}

export async function updateCurrency(username: string, currency: string) {
  await getDb()
    .prepare("UPDATE users SET currency = ? WHERE username = ?")
    .bind(currency, username)
    .run();
}

export async function updatePassword(username: string, hashedPassword: string) {
  await getDb()
    .prepare(
      "UPDATE users SET hashed_password = ?, sessions_valid_after = ? WHERE username = ?",
    )
    .bind(hashedPassword, Math.floor(Date.now() / 1000), username)
    .run();
}

export async function deleteUser(username: string) {
  await getDb()
    .prepare("DELETE FROM users WHERE username = ?")
    .bind(username)
    .run();
}
