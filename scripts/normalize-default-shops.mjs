import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const INPUT_DIR = path.join(process.cwd(), "public", "default-shops");
const OUTPUT_SIZE = 256;
const WEBP_QUALITY = 92;
const RETRY_ATTEMPTS = 10;
const LOCK_RETRY_DELAY_MS = 200;

const SUPPORTED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".tiff",
]);

function isFileLockError(error) {
  return (
    error &&
    typeof error === "object" &&
    "code" in error &&
    ["EBUSY", "EPERM", "UNKNOWN"].includes(error.code)
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withFileLockRetry(action, attempts = RETRY_ATTEMPTS) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await action();
    } catch (error) {
      if (!isFileLockError(error) || attempt === attempts - 1) {
        throw error;
      }
      await sleep((attempt + 1) * LOCK_RETRY_DELAY_MS);
    }
  }
}

async function listSupportedImageFiles() {
  const entries = await fs.readdir(INPUT_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) =>
      SUPPORTED_EXTENSIONS.has(path.extname(name).toLowerCase()),
    )
    .sort((a, b) => a.localeCompare(b));
}

async function normalizeImage(fileName) {
  const sourcePath = path.join(INPUT_DIR, fileName);
  const { name: baseName, ext } = path.parse(fileName);
  const outputName = `${baseName}.webp`;
  const outputPath = path.join(INPUT_DIR, outputName);
  const sourceIsWebp = ext.toLowerCase() === ".webp";

  const normalizedBuffer = await sharp(sourcePath)
    .resize(OUTPUT_SIZE, OUTPUT_SIZE, {
      fit: "cover",
      position: "centre",
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  await withFileLockRetry(() => fs.writeFile(outputPath, normalizedBuffer));

  if (!sourceIsWebp) {
    await withFileLockRetry(() => fs.rm(sourcePath, { force: true }));
  }

  return { source: fileName, output: outputName };
}

async function normalizeDefaultShopImages() {
  const files = await listSupportedImageFiles();

  if (files.length === 0) {
    console.log("No supported image files found in public/default-shops.");
    return;
  }

  const summary = [];

  for (const fileName of files) {
    try {
      summary.push(await normalizeImage(fileName));
    } catch (error) {
      if (isFileLockError(error)) {
        throw new Error(
          `File appears locked during write: ${fileName}. Try pausing sync/indexing and rerun.`,
        );
      }
      throw error;
    }
  }

  console.log(
    `Normalized ${summary.length} image${summary.length === 1 ? "" : "s"} to ${OUTPUT_SIZE}x${OUTPUT_SIZE} WebP:`,
  );
  for (const row of summary) {
    console.log(`- ${row.source} -> ${row.output}`);
  }
}

normalizeDefaultShopImages().catch((error) => {
  console.error("Failed to normalize default shop images.");
  console.error(error);
  process.exitCode = 1;
});
