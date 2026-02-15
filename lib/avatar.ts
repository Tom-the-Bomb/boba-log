import sharp from "sharp";
import { uploadAvatarToR2 } from "./r2";
import { normalizeShopNameForAvatar } from "./shop-avatar";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function processAndUploadAvatar({
  file,
  userId,
  shopName,
}: {
  file: File;
  userId: string;
  shopName: string;
}) {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error("Unsupported image format.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const inputBuffer = Buffer.from(arrayBuffer);

  const image = sharp(inputBuffer, { failOn: "error" });
  const metadata = await image.metadata();
  const detectedFormat = metadata.format;

  if (!detectedFormat || !["jpeg", "png", "webp"].includes(detectedFormat)) {
    throw new Error("Unsupported image format.");
  }

  const normalizedShopName = normalizeShopNameForAvatar(shopName) || "shop";
  const outputBuffer = await image
    .resize(256, 256, { fit: "cover", position: "centre" })
    .webp({ quality: 82 })
    .toBuffer();

  await uploadAvatarToR2({
    userId,
    shopName: normalizedShopName,
    body: outputBuffer,
  });
}
