const SIZE = 256;

export async function resizeImageToWebP(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(SIZE, SIZE);
  const ctx = canvas.getContext("2d")!;

  const side = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - side) / 2;
  const sy = (bitmap.height - side) / 2;

  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, SIZE, SIZE);
  bitmap.close();

  const blob = await canvas.convertToBlob({
    type: "image/webp",
    quality: 0.82,
  });
  return new File([blob], file.name, { type: "image/webp" });
}
