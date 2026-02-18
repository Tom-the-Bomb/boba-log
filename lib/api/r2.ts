import { getCloudflareContext } from "@opennextjs/cloudflare";

function getR2(): R2Bucket {
  const { env } = getCloudflareContext();
  return env.R2;
}

interface UploadAvatarInput {
  shopId: number;
  body: ArrayBuffer;
}

const AVATAR_EXISTS_CACHE_TTL_MS = 5 * 60 * 1000;
const avatarExistsCache = new Map<
  number,
  { exists: boolean; expiresAt: number }
>();

export function getPublicAvatarUrl(shopId: number) {
  return `/api/avatars/${shopId}`;
}

export async function checkPublicAvatarExists(shopId: number) {
  const now = Date.now();
  const cached = avatarExistsCache.get(shopId);
  if (cached && cached.expiresAt > now) {
    return cached.exists;
  }

  try {
    const r2 = getR2();
    const obj = await r2.head(`${shopId}.webp`);
    const exists = obj !== null;
    avatarExistsCache.set(shopId, {
      exists,
      expiresAt: now + AVATAR_EXISTS_CACHE_TTL_MS,
    });
    return exists;
  } catch {
    avatarExistsCache.set(shopId, {
      exists: false,
      expiresAt: now + AVATAR_EXISTS_CACHE_TTL_MS,
    });
    return false;
  }
}

export async function uploadAvatarToR2({ shopId, body }: UploadAvatarInput) {
  const r2 = getR2();

  await r2.put(`${shopId}.webp`, body, {
    httpMetadata: {
      contentType: "image/webp",
      cacheControl: "public, max-age=31536000, immutable",
    },
  });

  avatarExistsCache.set(shopId, {
    exists: true,
    expiresAt: Date.now() + AVATAR_EXISTS_CACHE_TTL_MS,
  });
}

export async function deleteAvatarFromR2(shopId: number) {
  const r2 = getR2();
  await r2.delete(`${shopId}.webp`);
  avatarExistsCache.delete(shopId);
}
