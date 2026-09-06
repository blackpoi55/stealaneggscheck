import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ไข่ไหนอยู่ไบโอมไหน · Steal an Egg Biome Guide",
    short_name: "SweetParadise",
    description:
      "ไข่ครบทั้ง 88 ใบใน Steal an Egg แยกตามไบโอม พร้อมรูปไข่จริงและเพ็ตจริง · All 88 Steal an Egg eggs grouped by biome, with real art.",
    lang: "th",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f6f4f7",
    theme_color: "#f4318c",
    categories: ["games", "reference", "utilities"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
