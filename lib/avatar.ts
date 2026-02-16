import { uploadAvatarToR2 } from "./r2";

export async function processAndUploadAvatar({
  file,
  shopId,
}: {
  file: File;
  shopId: number;
}) {
  const arrayBuffer = await file.arrayBuffer();
  const body = Buffer.from(arrayBuffer);

  await uploadAvatarToR2({ shopId, body });
}
