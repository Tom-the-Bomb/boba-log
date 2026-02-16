const SIZE = 256;

export async function resizeImageToWebP(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(SIZE, SIZE);
  const ctx = canvas.getContext("2d")!;

  // Cover-fit: scale and center-crop
  const scale = Math.max(SIZE / bitmap.width, SIZE / bitmap.height);
  const sw = SIZE / scale;
  const sh = SIZE / scale;
  const sx = (bitmap.width - sw) / 2;
  const sy = (bitmap.height - sh) / 2;

  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, SIZE, SIZE);
  bitmap.close();

  const blob = await canvas.convertToBlob({
    type: "image/webp",
    quality: 0.82,
  });
  return new File([blob], "avatar.webp", { type: "image/webp" });
}
