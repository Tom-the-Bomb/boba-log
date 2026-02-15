import { randomUUID } from "crypto";
import { WithId } from "mongodb";
import { getUsersCollection } from "./mongodb";
import { BobaShop, PublicUser, ShopDocument, UserDocument } from "./types";
import { getPublicAvatarUrlFromKey } from "./r2";
import { normalizeShopNameForAvatar } from "./shop-avatar";

function toPublicShop(userId: string, shop: ShopDocument): BobaShop {
  const normalizedShopName = normalizeShopNameForAvatar(shop.name) || "shop";
  return {
    ...shop,
    avatar: getPublicAvatarUrlFromKey(userId, normalizedShopName),
  };
}

function toPublicUser(user: WithId<UserDocument>): PublicUser {
  const userId = user._id.toString();
  return {
    username: user.username,
    created_at: user.created_at,
    shops: user.shops.map((shop) => toPublicShop(userId, shop)),
  };
}

export async function getUserByUsername(username: string) {
  const users = await getUsersCollection();
  return users.findOne({ username }) as Promise<WithId<UserDocument> | null>;
}

export async function createUser(username: string, hashedPassword: string) {
  const users = await getUsersCollection();
  const createdAt = new Date().toISOString();

  await users.insertOne({
    username,
    hashed_password: hashedPassword,
    created_at: createdAt,
    shops: [],
  });

  const user = (await users.findOne({
    username,
  })) as WithId<UserDocument> | null;
  if (!user) {
    throw new Error("Could not create user.");
  }

  return toPublicUser(user);
}

export async function getPublicUser(username: string) {
  const user = await getUserByUsername(username);
  if (!user) return null;
  return toPublicUser(user);
}

export async function addShop(username: string, name: string) {
  const users = await getUsersCollection();
  const user = (await users.findOne({
    username,
  })) as WithId<UserDocument> | null;
  if (!user) {
    throw new Error("User not found.");
  }

  const newShop: ShopDocument = {
    id: randomUUID(),
    name,
    total: 0,
    dates: {},
  };

  const updatedShops = [...user.shops, newShop];
  await users.updateOne({ username }, { $set: { shops: updatedShops } });

  return toPublicShop(user._id.toString(), newShop);
}

function todayIsoDateKey() {
  const now = new Date();
  const utcMidnight = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  return utcMidnight.toISOString();
}

export async function incrementShop(username: string, shopId: string) {
  const users = await getUsersCollection();
  const user = (await users.findOne({
    username,
  })) as WithId<UserDocument> | null;
  if (!user) {
    throw new Error("User not found.");
  }

  const dateKey = todayIsoDateKey();
  const updatedShops = user.shops.map((shop) => {
    if (shop.id !== shopId) return shop;
    return {
      ...shop,
      total: shop.total + 1,
      dates: {
        ...shop.dates,
        [dateKey]: (shop.dates[dateKey] ?? 0) + 1,
      },
    };
  });

  await users.updateOne({ username }, { $set: { shops: updatedShops } });

  const shop = updatedShops.find((item) => item.id === shopId);
  return shop ? toPublicShop(user._id.toString(), shop) : null;
}

export async function undoShopIncrement(username: string, shopId: string) {
  const users = await getUsersCollection();
  const user = (await users.findOne({
    username,
  })) as WithId<UserDocument> | null;
  if (!user) {
    throw new Error("User not found.");
  }

  const dateKey = todayIsoDateKey();
  const updatedShops = user.shops.map((shop) => {
    if (shop.id !== shopId) return shop;
    if (shop.total <= 0) return shop;

    const todayCount = shop.dates[dateKey] ?? 0;
    const updatedDates = { ...shop.dates };
    if (todayCount <= 1) {
      delete updatedDates[dateKey];
    } else {
      updatedDates[dateKey] = todayCount - 1;
    }

    return {
      ...shop,
      total: shop.total - 1,
      dates: updatedDates,
    };
  });

  await users.updateOne({ username }, { $set: { shops: updatedShops } });

  const shop = updatedShops.find((item) => item.id === shopId);
  return shop ? toPublicShop(user._id.toString(), shop) : null;
}
