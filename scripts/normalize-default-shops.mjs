import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const inputDir = path.join(process.cwd(), "public", "default-shops");
const supportedExtensions = new Set([
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

async function writeWithRetry(filePath, data, attempts = 10) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      await fs.writeFile(filePath, data);
      return;
    } catch (error) {
      if (!isFileLockError(error) || attempt === attempts - 1) {
        throw error;
      }
      await sleep((attempt + 1) * 200);
    }
  }
}

async function removeWithRetry(targetPath, attempts = 10) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      await fs.rm(targetPath, { force: true });
      return;
    } catch (error) {
      if (!isFileLockError(error) || attempt === attempts - 1) {
        throw error;
      }
      await sleep((attempt + 1) * 200);
    }
  }
}

async function normalizeDefaultShopImages() {
  const entries = await fs.readdir(inputDir, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) =>
      supportedExtensions.has(path.extname(name).toLowerCase()),
    );

  if (files.length === 0) {
    console.log("No supported image files found in public/default-shops.");
    return;
  }

  const summary = [];

  for (const fileName of files) {
    const sourcePath = path.join(inputDir, fileName);
    const baseName = path.parse(fileName).name;
    const outputName = `${baseName}.webp`;
    const outputPath = path.join(inputDir, outputName);
    const sourceIsWebp = path.extname(fileName).toLowerCase() === ".webp";

    try {
      const inputBuffer = await fs.readFile(sourcePath);
      const normalizedBuffer = await sharp(inputBuffer)
        .resize(256, 256, {
          fit: "cover",
          position: "centre",
        })
        .webp({ quality: 92 })
        .toBuffer();

      await writeWithRetry(outputPath, normalizedBuffer);

      if (!sourceIsWebp) {
        await removeWithRetry(sourcePath);
      }

      summary.push({ source: fileName, output: outputName });
    } catch (error) {
      if (isFileLockError(error)) {
        throw new Error(
          `File appears locked during write: ${fileName}. Try pausing sync/indexing and rerun.`,
        );
      }
      throw error;
    }
  }

  console.log("Normalized images to 256x256 WebP:");
  for (const row of summary) {
    console.log(`- ${row.source} -> ${row.output}`);
  }
}

normalizeDefaultShopImages().catch((error) => {
  console.error("Failed to normalize default shop images.");
  console.error(error);
  process.exitCode = 1;
});
