import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { BIOME_BY_ID, EGGS, RARITY_BY_ID, money } from "@/data/steal-an-egg";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Steal an Egg — SweetParadise";

export function generateStaticParams() {
  return EGGS.map((e) => ({ id: e.id }));
}

/** Rarity colours live in CSS custom properties, which Satori cannot resolve. */
const OG_RARITY: Record<string, string> = {
  common: "#8b98ab",
  uncommon: "#2fc98a",
  rare: "#5b9bff",
  epic: "#b183ff",
  legendary: "#ffb43d",
  mythic: "#ff5f86",
  cosmic: "#3ed0e8",
  secret: "#e277f0",
  eternal: "#ff8a3d",
  divine: "#ffd977",
};

export default async function OgImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const egg = EGGS.find((e) => e.id === id);
  if (!egg) return new ImageResponse(<div style={{ background: "#0d0c10", width: "100%", height: "100%" }} />, size);

  const biome = BIOME_BY_ID[egg.biome];
  const rarity = RARITY_BY_ID[egg.rarity];
  const accent = OG_RARITY[egg.rarity] ?? "#f4318c";

  // Satori has no WebP decoder, so re-encode the artwork as PNG first.
  const png = await sharp(await readFile(join(process.cwd(), "public", "img", "eggs", `${id}.webp`)))
    .resize(420, 420, { fit: "inside" })
    .png()
    .toBuffer();
  const art = `data:image/png;base64,${png.toString("base64")}`;

  // Latin only — the bundled Satori font has no Thai glyphs.
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          background: `linear-gradient(135deg, #0d0c10 0%, #17151b 55%, ${accent}33 100%)`,
          padding: 64,
          color: "#f6f4f8",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1, paddingRight: 40 }}>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "8px 18px",
              borderRadius: 999,
              background: `${accent}26`,
              color: accent,
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            {rarity.en}
          </div>
          <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -2, marginTop: 22, lineHeight: 1.05 }}>
            {`${egg.en} Egg`}
          </div>
          <div style={{ fontSize: 34, color: "#a09aa8", marginTop: 10 }}>
            {`${biome.en} biome · ${money(egg.income)}/s`}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: "auto", fontSize: 26, color: "#726c7a" }}>
            <div style={{ display: "flex", width: 12, height: 12, borderRadius: 999, background: accent }} />
            SweetParadise · Steal an Egg biome guide
          </div>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={art} width={420} height={420} alt="" style={{ objectFit: "contain" }} />
      </div>
    ),
    size
  );
}
