import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const bucketName = process.env.R2_BUCKET_NAME!;

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export interface UploadAvatarInput {
  shopId: number;
  body: Buffer;
}

const AVATAR_EXISTS_CACHE_TTL_MS = 5 * 60 * 1000;
const avatarExistsCache = new Map<
  number,
  { exists: boolean; expiresAt: number }
>();

export function getPublicAvatarUrl(shopId: number) {
  return `https://pub-6f87896bfc764c28b490965d4a30c76d.r2.dev/${shopId}.webp`;
}

export async function checkPublicAvatarExists(shopId: number) {
  const now = Date.now();
  const cached = avatarExistsCache.get(shopId);
  if (cached && cached.expiresAt > now) {
    return cached.exists;
  }

  try {
    const response = await fetch(getPublicAvatarUrl(shopId), {
      method: "HEAD",
      cache: "no-store",
    });
    const exists = response.ok;
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
  await r2Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: `${shopId}.webp`,
      Body: body,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  avatarExistsCache.set(shopId, {
    exists: true,
    expiresAt: Date.now() + AVATAR_EXISTS_CACHE_TTL_MS,
  });
}
