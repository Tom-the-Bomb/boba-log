import type { PublicUser } from "../types";
import { getDb } from "./db";
import { listDrinks } from "./drinks";
import { listShops } from "./shops";

interface UserRow {
  username: string;
  created_at: number;
  currency: string;
}

export async function getUserByUsername(username: string) {
  return getDb()
    .prepare("SELECT hashed_password FROM users WHERE username = ?")
    .bind(username)
    .first<{ hashed_password: string }>();
}

export async function createUser(
  username: string,
  hashedPassword: string,
): Promise<PublicUser> {
  const row = await getDb()
    .prepare(
      `INSERT INTO users (username, hashed_password, created_at) VALUES (?, ?, ?)
       RETURNING username, created_at, currency`,
    )
    .bind(username, hashedPassword, Math.floor(Date.now() / 1000))
    .first<UserRow>();

  if (!row) {
    throw new Error("Could not create user.");
  }

  return {
    username: row.username,
    createdAt: row.created_at,
    currency: row.currency,
    shops: [],
    drinks: [],
  };
}

export async function getPublicUser(
  username: string,
): Promise<PublicUser | null> {
  const row = await getDb()
    .prepare(
      "SELECT username, created_at, currency FROM users WHERE username = ?",
    )
    .bind(username)
    .first<UserRow>();

  if (!row) {
    return null;
  }

  const [shops, drinks] = await Promise.all([
    listShops(username),
    listDrinks(username),
  ]);

  return {
    username: row.username,
    createdAt: row.created_at,
    currency: row.currency,
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

export async function getSessionWindow(username: string) {
  return getDb()
    .prepare(
      "SELECT created_at, sessions_valid_after FROM users WHERE username = ?",
    )
    .bind(username)
    .first<{ created_at: number; sessions_valid_after: number }>();
}

/** Sets a new password and invalidates every session issued before now. */
export async function updatePassword(username: string, hashedPassword: string) {
  await getDb()
    .prepare(
      "UPDATE users SET hashed_password = ?, sessions_valid_after = ? WHERE username = ?",
    )
    .bind(hashedPassword, Math.floor(Date.now() / 1000), username)
    .run();
}

/** Deletes the user; shops and drinks go with it through ON DELETE CASCADE. */
export async function deleteUser(username: string): Promise<boolean> {
  const result = await getDb()
    .prepare("DELETE FROM users WHERE username = ?")
    .bind(username)
    .run();
  return result.meta.changes > 0;
}
