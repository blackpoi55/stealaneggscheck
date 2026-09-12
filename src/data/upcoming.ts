/**
 * Biomes that exist in game but have no published data yet.
 *
 * Angels & Demons shipped with the Angels vs Demons event. As of 2026-09-13
 * neither IGN, Eldorado nor the Fandom wiki lists it — the wiki page is an
 * empty placeholder — so there are no incomes, rarities or speed figures to
 * quote. The names below were read off the in-game pet index; everything else
 * stays blank rather than guessed, and this moves into `steal-an-egg.ts`
 * proper once real numbers exist.
 */

export type UpcomingBiomeId = "angels-demons";

export interface UpcomingBiome {
  id: UpcomingBiomeId;
  order: number;
  en: string;
  th: string;
  noteTh: string;
  noteEn: string;
  /** [highlight, shade] — no artwork yet, so this paints the banner */
  accent: [string, string];
  /** names visible in the index; the rest are still silhouettes */
  known: { en: string; th: string }[];
  unknown: number;
}

export const UPCOMING_BIOMES: UpcomingBiome[] = [
  {
    id: "angels-demons",
    order: 12,
    en: "Angels & Demons",
    th: "นางฟ้ากับปีศาจ",
    noteTh: "ไบโอมใหม่จากอีเวนต์ Angels vs Demons ฝั่งสวรรค์กับฝั่งนรกแบ่งครึ่งกัน ตอนนี้ยังไม่มีเว็บไหนลงข้อมูลรายได้หรือความเร็วที่ต้องใช้ — พอมีเมื่อไหร่จะอัปเดตทันที",
    noteEn: "The new biome from the Angels vs Demons event. No source lists its income or speed figures yet; this fills in as soon as they do.",
    accent: ["#fbbf24", "#7f1d1d"],
    known: [
      { en: "Winged Lamb", th: "ลูกแกะมีปีก" },
      { en: "Toro", th: "โทโร่" },
      { en: "Demon Hound", th: "หมานรก" },
      { en: "Imp", th: "อิมป์" },
      { en: "Sacred Moth", th: "ผีเสื้อศักดิ์สิทธิ์" },
      { en: "Holy Peacock", th: "นกยูงศักดิ์สิทธิ์" },
    ],
    unknown: 2,
  },
];

export const ANGELS_DEMONS_ANCHOR = "biome-angels-demons";
