// Generates favicons and PWA icons from public/img/logo.png.
// (That file is actually WebP data — sharp sniffs the real format, so the
// generated PNGs are genuine PNGs regardless of the source extension.)
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = `${ROOT}/public/img/logo.png`;
const ICONS = `${ROOT}/public/icons`;

await mkdir(ICONS, { recursive: true });

const square = (size) => sharp(SRC).resize(size, size, { fit: "cover" }).png({ compressionLevel: 9 });

// Plain icons — the artwork fills the tile.
for (const size of [192, 512]) {
  await square(size).toFile(`${ICONS}/icon-${size}.png`);
}

// Apple touch icon sits on the home screen without a mask, so keep it full-bleed.
await square(180).toFile(`${ICONS}/apple-touch-icon.png`);

// Maskable icon — Android crops to a circle, so inset the art into the 80% safe area.
const SAFE = 512;
const inner = Math.round(SAFE * 0.78);
await sharp({
  create: {
    width: SAFE,
    height: SAFE,
    channels: 4,
    background: { r: 0x1a, g: 0x10, b: 0x2e, alpha: 1 },
  },
})
  .composite([
    {
      input: await sharp(SRC).resize(inner, inner, { fit: "cover" }).png().toBuffer(),
      top: Math.round((SAFE - inner) / 2),
      left: Math.round((SAFE - inner) / 2),
    },
  ])
  .png({ compressionLevel: 9 })
  .toFile(`${ICONS}/icon-maskable-512.png`);

// Next.js file convention: src/app/icon.png becomes the site favicon.
await square(96).toFile(`${ROOT}/src/app/icon.png`);

console.log("icons written to public/icons and src/app/icon.png");
