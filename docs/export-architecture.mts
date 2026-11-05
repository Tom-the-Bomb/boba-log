// Renders architecture.excalidraw to architecture.png with Excalidraw's own
// exporter. Needs Google Chrome and a network connection (Excalidraw loads from esm.sh).
import { readFileSync, writeFileSync } from "node:fs";
import { chromium } from "playwright-core";

const EXCALIDRAW =
  "https://esm.sh/@excalidraw/excalidraw@0.18.0?deps=react@19.1.0,react-dom@19.1.0";

const scene = JSON.parse(
  readFileSync(new URL("architecture.excalidraw", import.meta.url), "utf8"),
);

const browser = await chromium.launch({ channel: "chrome" });
try {
  const page = await browser.newPage();
  const png = await page.evaluate(
    async ({ url, scene }) => {
      const { exportToSvg } = await import(url);
      const svg = await exportToSvg({
        elements: scene.elements,
        appState: { ...scene.appState, exportBackground: true, exportScale: 2 },
        files: scene.files,
        exportPadding: 32,
      });
      // exportToBlob can draw before the logo images load, so rasterize the SVG instead.
      const image = new Image();
      image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.outerHTML)}`;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      canvas.getContext("2d")!.drawImage(image, 0, 0);
      return canvas.toDataURL("image/png");
    },
    { url: EXCALIDRAW, scene },
  );
  writeFileSync(
    new URL("architecture.png", import.meta.url),
    Buffer.from(png.slice(png.indexOf(",") + 1), "base64"),
  );
} finally {
  await browser.close();
}
