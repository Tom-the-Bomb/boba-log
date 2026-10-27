// Paints the alpha masks in public/textures on a Chrome canvas: the tileable
// 宣纸 paper fibre and the ink-wash mountain plates (wide, and narrow for
// phones). Seeded, so reruns reproduce the same files. Needs Google Chrome.
import { chromium } from "playwright-core";
import sharp from "sharp";

type Peak = [centre: number, height: number, width: number];
type MistBand = [y: number, height: number, alpha: number];

interface Ridge {
  base: number;
  amp: number;
  rough: number;
  alpha: number;
  depth: number;
  peaks: Peak[];
}

interface Plate {
  name: string;
  width: number;
  height: number;
  seed: number;
  noise: number;
  ridges: Ridge[];
  mist: MistBand[];
}

const OUTPUT_DIR = new URL("../public/textures/", import.meta.url);
const PAPER_SIZE = 512;
const PAPER_SEED = 1729;
const AVIF_QUALITY = 75;

const PLATES: Plate[] = [
  {
    name: "ink-mountains",
    width: 2880,
    height: 640,
    seed: 4096,
    noise: 1.9,
    ridges: [
      {
        base: 300,
        amp: 210,
        rough: 0.56,
        alpha: 0.42,
        depth: 300,
        // The tallest peak sits in the landing page's gap between the copy and
        // the hanging scroll.
        peaks: [
          [0.1, 0.85, 0.08],
          [0.385, 1.15, 0.07],
          [0.78, 0.8, 0.1],
        ],
      },
      {
        base: 400,
        amp: 150,
        rough: 0.52,
        alpha: 0.6,
        depth: 220,
        peaks: [
          [0.24, 0.75, 0.11],
          [0.6, 0.7, 0.1],
        ],
      },
      {
        base: 520,
        amp: 70,
        rough: 0.5,
        alpha: 0.75,
        depth: 140,
        peaks: [
          [0.12, 0.4, 0.2],
          [0.68, 0.35, 0.25],
        ],
      },
    ],
    mist: [
      [360, 70, 0.55],
      [470, 60, 0.5],
      [580, 80, 0.7],
    ],
  },
  {
    name: "ink-mountains-narrow",
    width: 1400,
    height: 800,
    seed: 2048,
    noise: 1.4,
    ridges: [
      {
        base: 430,
        amp: 330,
        rough: 0.5,
        alpha: 0.42,
        depth: 380,
        peaks: [
          [0.64, 1.15, 0.2],
          [0.14, 0.6, 0.16],
        ],
      },
      {
        base: 550,
        amp: 190,
        rough: 0.5,
        alpha: 0.6,
        depth: 280,
        peaks: [[0.32, 0.85, 0.22]],
      },
      {
        base: 690,
        amp: 70,
        rough: 0.5,
        alpha: 0.75,
        depth: 150,
        peaks: [[0.8, 0.35, 0.3]],
      },
    ],
    mist: [
      [450, 80, 0.55],
      [590, 70, 0.5],
      [725, 90, 0.7],
    ],
  },
];

// Runs in the page, so it must not reference anything outside itself.
function paint({
  plates,
  paperSize,
  paperSeed,
}: {
  plates: Plate[];
  paperSize: number;
  paperSeed: number;
}) {
  function rng(seed: number) {
    let state = seed >>> 0;
    return () => {
      state = (state + 0x6d2b79f5) | 0;
      let t = Math.imul(state ^ (state >>> 15), 1 | state);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function canvas(width: number, height: number) {
    const element = document.createElement("canvas");
    element.width = width;
    element.height = height;
    const context = element.getContext("2d");
    if (!context) {
      throw new Error("Canvas 2D is unavailable.");
    }
    return { element, context };
  }

  function paintPaper() {
    const size = paperSize;
    const { element, context } = canvas(size, size);
    const random = rng(paperSeed);
    // Draws at every wrapped offset so the tile repeats without seams.
    const wrapped = (draw: () => void) => {
      for (const dx of [-size, 0, size]) {
        for (const dy of [-size, 0, size]) {
          context.save();
          context.translate(dx, dy);
          draw();
          context.restore();
        }
      }
    };

    for (let i = 0; i < 160; i++) {
      const x = random() * size;
      const y = random() * size;
      const radius = 20 + random() * 70;
      const alpha = 0.012 + random() * 0.02;
      wrapped(() => {
        const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(0,0,0,${alpha})`);
        gradient.addColorStop(1, "rgba(0,0,0,0)");
        context.fillStyle = gradient;
        context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      });
    }

    context.lineCap = "round";
    for (let i = 0; i < 800; i++) {
      const x = random() * size;
      const y = random() * size;
      const angle = random() * Math.PI * 2;
      const length = 18 + Math.pow(random(), 2) * 150;
      const bend = (random() - 0.5) * length * 0.5;
      const x2 = x + Math.cos(angle) * length;
      const y2 = y + Math.sin(angle) * length;
      const cx = (x + x2) / 2 + Math.cos(angle + Math.PI / 2) * bend;
      const cy = (y + y2) / 2 + Math.sin(angle + Math.PI / 2) * bend;
      const lineWidth = 0.35 + random() * 0.9;
      const alpha = 0.05 + random() * 0.11;
      wrapped(() => {
        context.strokeStyle = `rgba(0,0,0,${alpha})`;
        context.lineWidth = lineWidth;
        context.beginPath();
        context.moveTo(x, y);
        context.quadraticCurveTo(cx, cy, x2, y2);
        context.stroke();
      });
    }

    for (let i = 0; i < 2600; i++) {
      const x = random() * size;
      const y = random() * size;
      const alpha = 0.04 + random() * 0.08;
      const speck = 0.4 + random() * 0.9;
      context.fillStyle = `rgba(0,0,0,${alpha})`;
      context.fillRect(x, y, speck, speck);
    }

    return element.toDataURL("image/png");
  }

  function paintMountains({ width, height, seed, noise, ridges, mist }: Plate) {
    const ink = canvas(width, height);
    const random = rng(seed);

    function profile(n: number, rough: number, peaks: Peak[]) {
      const points = new Array<number>(n + 1).fill(0);
      points[0] = random();
      points[n] = random();
      let step = n;
      let scale = noise;
      while (step > 1) {
        const half = step / 2;
        for (let i = half; i < n; i += step) {
          points[i] =
            (points[i - half] + points[i + half]) / 2 +
            (random() - 0.5) * scale;
        }
        step = half;
        scale *= rough;
      }
      for (const [centre, peakHeight, peakWidth] of peaks) {
        for (let i = 0; i <= n; i++) {
          const d = (i / n - centre) / peakWidth;
          points[i] +=
            peakHeight * Math.exp(-d * d * 2.2) * (1 - Math.abs(d) * 0.15);
        }
      }
      return points;
    }

    for (const ridge of ridges) {
      const n = 512;
      const points = profile(n, ridge.rough, ridge.peaks);
      const min = Math.min(...points);
      const max = Math.max(...points);
      const ys = points.map(
        (v) => ridge.base - ((v - min) / (max - min)) * ridge.amp,
      );
      const path = new Path2D();
      path.moveTo(0, height);
      ys.forEach((y, i) => path.lineTo((i / n) * width, y));
      path.lineTo(width, height);
      path.closePath();

      const { element: layer, context } = canvas(width, height);
      context.save();
      context.clip(path);
      for (let i = 0; i <= n; i++) {
        const x = (i / n) * width;
        const y = ys[i];
        const gradient = context.createLinearGradient(0, y, 0, y + ridge.depth);
        gradient.addColorStop(0, `rgba(0,0,0,${ridge.alpha})`);
        gradient.addColorStop(0.35, `rgba(0,0,0,${ridge.alpha * 0.45})`);
        gradient.addColorStop(1, "rgba(0,0,0,0)");
        context.fillStyle = gradient;
        context.fillRect(x - 1, y - 2, width / n + 2, ridge.depth + 4);
      }
      const strokes = Math.round((900 * width) / 2880);
      for (let s = 0; s < strokes; s++) {
        const i = Math.floor(random() * n);
        const x = (i / n) * width + (random() - 0.5) * 6;
        const y = ys[i] + random() * ridge.depth * 0.45;
        context.strokeStyle = `rgba(0,0,0,${0.05 + random() * 0.12})`;
        context.lineWidth = 0.6 + random() * 1.8;
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + (random() - 0.6) * 18, y + 10 + random() * 40);
        context.stroke();
      }
      context.restore();

      context.filter = "blur(2.5px)";
      context.strokeStyle = `rgba(0,0,0,${Math.min(1, ridge.alpha * 0.9)})`;
      context.lineWidth = 3;
      context.beginPath();
      ys.forEach((y, i) =>
        i ? context.lineTo((i / n) * width, y + 1) : context.moveTo(0, y + 1),
      );
      context.stroke();
      context.filter = "none";

      context.globalCompositeOperation = "destination-out";
      const flecks = Math.round((26000 * width * height) / (2880 * 640));
      for (let f = 0; f < flecks; f++) {
        context.fillStyle = `rgba(0,0,0,${0.15 + random() * 0.5})`;
        context.fillRect(
          random() * width,
          random() * height,
          1 + random() * 1.5,
          1 + random() * 1.5,
        );
      }
      context.globalCompositeOperation = "source-over";

      ink.context.filter = "blur(1.2px)";
      ink.context.drawImage(layer, 0, 0);
      ink.context.filter = "none";
    }

    ink.context.globalCompositeOperation = "destination-out";
    for (const [bandY, bandHeight, alpha] of mist) {
      for (let x = -200; x < width + 200; x += 260) {
        const cx = x + random() * 200;
        const cy = bandY + (random() - 0.5) * 30;
        const radius = 260 + random() * 220;
        const gradient = ink.context.createRadialGradient(
          cx,
          cy,
          0,
          cx,
          cy,
          radius,
        );
        gradient.addColorStop(0, `rgba(0,0,0,${alpha})`);
        gradient.addColorStop(1, "rgba(0,0,0,0)");
        ink.context.save();
        ink.context.translate(cx, cy);
        ink.context.scale(1, bandHeight / radius);
        ink.context.translate(-cx, -cy);
        ink.context.fillStyle = gradient;
        ink.context.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
        ink.context.restore();
      }
    }
    const foot = ink.context.createLinearGradient(
      0,
      height * 0.55,
      0,
      height * 0.95,
    );
    foot.addColorStop(0, "rgba(0,0,0,0)");
    foot.addColorStop(1, "rgba(0,0,0,1)");
    ink.context.fillStyle = foot;
    ink.context.fillRect(0, height * 0.55, width, height * 0.45);
    ink.context.globalCompositeOperation = "source-over";

    return ink.element.toDataURL("image/png");
  }

  return {
    paper: paintPaper(),
    plates: plates.map((plate) => ({
      name: plate.name,
      png: paintMountains(plate),
    })),
  };
}

function decode(dataUrl: string) {
  return Buffer.from(dataUrl.slice(dataUrl.indexOf(",") + 1), "base64");
}

const browser = await chromium.launch({ channel: "chrome" });
try {
  const page = await browser.newPage();
  const { paper, plates } = await page.evaluate(paint, {
    plates: PLATES,
    paperSize: PAPER_SIZE,
    paperSeed: PAPER_SEED,
  });

  // Lossless keeps the fibre's fine strands; AVIF keeps the mist gradients
  // smooth where lossy WebP alpha terraced them into bands.
  await sharp(decode(paper))
    .webp({ lossless: true, effort: 6 })
    .toFile(new URL("paper-fibre.webp", OUTPUT_DIR).pathname);
  for (const { name, png } of plates) {
    await sharp(decode(png))
      .avif({ quality: AVIF_QUALITY, effort: 9 })
      .toFile(new URL(`${name}.avif`, OUTPUT_DIR).pathname);
  }
  console.log("Textures written to public/textures.");
} finally {
  await browser.close();
}
