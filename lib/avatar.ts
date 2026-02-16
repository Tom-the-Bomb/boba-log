import { uploadAvatarToR2 } from "./r2";

export async function processAndUploadAvatar({
  file,
  shopId,
}: {
  file: File;
  shopId: number;
}) {
  const body = await file.arrayBuffer();
  await uploadAvatarToR2({ shopId, body });
}
