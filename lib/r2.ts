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
  userId: string;
  shopName: string;
  body: Buffer;
}

export function getPublicAvatarUrlFromKey(userId: string, shopName: string) {
  return `https://pub-6f87896bfc764c28b490965d4a30c76d.r2.dev/${userId}/${encodeURIComponent(shopName)}.webp`;
}

export async function uploadAvatarToR2({
  userId,
  shopName,
  body,
}: UploadAvatarInput) {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: `${userId}/${encodeURIComponent(shopName)}.webp`,
      Body: body,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
}
