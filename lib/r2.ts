// Use Cloudflare R2 binding when available (Workers/Pages environment)
// Falls back to AWS SDK for other environments (local dev, SSR)
function getR2Bucket(): R2Bucket | null {
  // @ts-expect-error - Cloudflare binding available in Workers runtime
  return globalThis.AVATAR_BUCKET ?? null;
}

// Fallback AWS SDK client for non-Workers environments
let awsSdkClient: any = null;
async function getAwsR2Client() {
  if (awsSdkClient) return awsSdkClient;

  const { S3Client } = await import("@aws-sdk/client-s3");
  awsSdkClient = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
  return awsSdkClient;
}

interface UploadAvatarInput {
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
