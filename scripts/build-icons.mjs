// Generates favicons and PWA icons from public/img/logo.png.
// (That file is actually WebP data — sharp sniffs the real format, so the
// generated PNGs are genuine PNGs regardless of the source extension.)
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = `${ROOT}/public/img/logo.png`;
const ICONS = `${ROOT}/public/icons`;

await mkdir(ICONS, { recursive: true });

const square = (size) => sharp(SRC).resize(size, size, { fit: "cover" }).png({ compressionLevel: 9 });

// Plain icons — the artwork fills the tile.
for (const size of [32, 192, 512]) {
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

// A real /favicon.ico for bare requests from bookmarks, crawlers and chat
// unfurlers. Since Vista an .ico may simply wrap a PNG, so the container is
// a 6-byte header plus one 16-byte directory entry.
const ico = await square(32).toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // one image
header.writeUInt8(32, 6); // width
header.writeUInt8(32, 7); // height
header.writeUInt8(0, 8); // palette size
header.writeUInt8(0, 9); // reserved
header.writeUInt16LE(1, 10); // colour planes
header.writeUInt16LE(32, 12); // bits per pixel
header.writeUInt32LE(ico.byteLength, 14);
header.writeUInt32LE(22, 18); // offset of the image data
await writeFile(`${ROOT}/public/favicon.ico`, Buffer.concat([header, ico]));

console.log("icons written to public/icons + public/favicon.ico");
