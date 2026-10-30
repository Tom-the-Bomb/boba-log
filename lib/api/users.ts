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

export async function getUserRow(username: string) {
  return getDb()
    .prepare(
      "SELECT username, created_at, currency FROM users WHERE username = ?",
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
  const [row, shops, drinks] = await Promise.all([
    getUserRow(username),
    listShops(username),
    listDrinks(username),
  ]);
  if (!row) {
    return null;
  }
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
