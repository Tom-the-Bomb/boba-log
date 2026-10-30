import { getCloudflareContext } from "@opennextjs/cloudflare";

const AVATAR_CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_AVATAR_BYTES = 512 * 1024;
const avatarVersions = new Map<
  number,
  { version: number | null; expiresAt: number }
>();

function getR2(): R2Bucket {
  return getCloudflareContext().env.R2;
}

function avatarKey(shopId: number) {
  return `${shopId}.webp`;
}

// The version changes with every upload, so the URL can be cached forever.
function avatarUrl(shopId: number, version: number | null) {
  return version === null ? null : `/api/avatars/${shopId}?v=${version}`;
}

function rememberAvatar(shopId: number, version: number | null) {
  avatarVersions.set(shopId, {
    version,
    expiresAt: Date.now() + AVATAR_CACHE_TTL_MS,
  });
  return avatarUrl(shopId, version);
}

export async function getAvatarUrl(shopId: number) {
  const cached = avatarVersions.get(shopId);
  if (cached && cached.expiresAt > Date.now()) {
    return avatarUrl(shopId, cached.version);
  }
  try {
    const object = await getR2().head(avatarKey(shopId));
    return rememberAvatar(shopId, object ? object.uploaded.getTime() : null);
  } catch {
    return rememberAvatar(shopId, null);
  }
}

export function getAvatar(shopId: number) {
  return getR2().get(avatarKey(shopId));
}

export function avatarType(bytes: Uint8Array) {
  if (bytes.length > MAX_AVATAR_BYTES) {
    return null;
  }
  const ascii = (start: number, end: number) =>
    String.fromCharCode(...bytes.subarray(start, end));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") {
    return "image/webp";
  }
  if (ascii(1, 4) === "PNG" && bytes[0] === 0x89) {
    return "image/png";
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  return null;
}

export async function uploadAvatar(
  shopId: number,
  body: Uint8Array,
  contentType: string,
) {
  const object = await getR2().put(avatarKey(shopId), body, {
    httpMetadata: {
      contentType,
      cacheControl: "public, max-age=31536000, immutable",
    },
  });
  if (!object) {
    throw new Error("Avatar upload failed.");
  }
  return rememberAvatar(shopId, object.uploaded.getTime());
}

export async function deleteAvatars(shopIds: number[]) {
  if (shopIds.length === 0) {
    return;
  }
  await getR2().delete(shopIds.map(avatarKey));
  for (const shopId of shopIds) {
    rememberAvatar(shopId, null);
  }
}
