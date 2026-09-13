/**
 * Limited pets — the ones that never come from a biome nest.
 *
 * Source: IGN wiki "All Eggs" (drop rates) + "All Pets" (income, speed, cash).
 * Luminous art is from the Fandom wiki.
 *
 * Before Update 4, 6 + 12 + 15 matched the in-game "Unlocked: x/33" counter
 * exactly. Update 4 added the 12 Luminous pets; the new counter total is not
 * confirmed yet.
 */

import type { RarityId } from "./steal-an-egg";

export type LimitedSource = "brainrot" | "luminous" | "monster" | "rift";

export interface LimitedGroup {
  id: LimitedSource;
  en: string;
  th: string;
  /** how you get the egg */
  howTh: string;
  howEn: string;
  accent: [string, string];
  /** public/img/limited/group-<id>.png exists for these */
  banner: boolean;
}

export interface LimitedPet {
  id: string;
  source: LimitedSource;
  en: string;
  th: string;
  rarity: RarityId;
  /** dollars per second */
  income: number;
  /** permanent speed on first collection */
  speedReward: number;
  /** hatch chance within its egg, in percent */
  chance: number;
  /** rift eggs rotate through three banners */
  banner?: 1 | 2 | 3;
  /** income was derived from the listed cash reward, not stated directly */
  derived?: boolean;
  /** art is the in-game index tile, which already shows rarity and drop rate */
  tile?: boolean;
}

export const LIMITED_GROUPS: LimitedGroup[] = [
  {
    id: "brainrot",
    en: "Brainrot Eggs",
    th: "ไข่เบรนร็อต",
    howTh: "ไข่อีเวนต์แบบจำกัดเวลา ได้จากร้านค้าในเกมช่วงที่อีเวนต์เปิด",
    howEn: "Limited event eggs from the in-game shop while the event runs.",
    accent: ["#fbbf24", "#7c2d12"],
    banner: false,
  },
  {
    id: "luminous",
    en: "Luminous Eggs",
    th: "ไข่ลูมินัส",
    howTh: "ซื้อด้วย Robux ในร้านค้า: 99 = 1 ฟอง, 249 = 3 ฟอง, 799 = 10 ฟอง, 3,499 = 50 ฟอง — มาแทนไข่มอนสเตอร์ในอัปเดต 4 แต่ละตัวมีโอกาส 1% สุ่มใหม่เป็นตัว Luminous ซึ่งทำเงินสูงกว่าตัวปกติมาก",
    howEn: "Bought with Robux: 99 for one, 249 for three, 799 for ten, 3,499 for fifty. Replaced the Monster Egg in Update 4. Each pet has a 1% re-roll into its Luminous variant, worth far more than the base.",
    accent: ["#22d3ee", "#164e63"],
    banner: true,
  },
  {
    id: "monster",
    en: "Monster Eggs",
    th: "ไข่มอนสเตอร์",
    howTh: "เลิกขายแล้ว — ถูกแทนด้วยไข่ลูมินัสในอัปเดต 4 · ตอนที่ยังขายราคา 99 Robux ต่อฟอง ตัว Mecha คือเวอร์ชันหายากของแต่ละตัว ออก 1% เท่ากันหมด และทำเงินเป็น 2 เท่า",
    howEn: "No longer sold — replaced by the Luminous Egg in Update 4. It cost 99 Robux each. Each Mecha is the rare variant of its base pet — 1% each, and worth double.",
    accent: ["#f97316", "#7c2d12"],
    banner: true,
  },
  {
    id: "rift",
    en: "Rift / Void Eggs",
    th: "ไข่ริฟต์ (วอยด์)",
    howTh: "ได้จาก Rift โดยสังเวยเพ็ต 3 ตัวตามที่พอร์ทัลกำหนด แบนเนอร์เปลี่ยนทุก 3 ชั่วโมง ทั้งหมดมี 3 ชุด",
    howEn: "From the Rift — sacrifice the three pets the portal asks for. The banner rotates every 3 hours across three sets.",
    accent: ["#a78bfa", "#312e81"],
    banner: true,
  },
];

export const LIMITED_PETS: LimitedPet[] = [
  // ── Brainrot ────────────────────────────────────────────────────────────
  { id: "tung-tung-sahur", source: "brainrot", en: "Tung Tung Sahur", th: "ตุง ตุง ซาฮูร์", rarity: "rare", income: 100, speedReward: 640, chance: 0, derived: true },
  { id: "bananita-dolphinita", source: "brainrot", en: "Bananita Dolphinita", th: "บานานิต้า ดอลฟินิต้า", rarity: "epic", income: 400, speedReward: 710, chance: 0, derived: true },
  { id: "belula-beluga", source: "brainrot", en: "Belula Beluga", th: "เบลูล่า เบลูก้า", rarity: "mythic", income: 40_000, speedReward: 2_500, chance: 0, derived: true },
  { id: "mangolini-parrochini", source: "brainrot", en: "Mangolini Parrochini", th: "แมงโกลินี พาร์โรคินี", rarity: "cosmic", income: 800_000, speedReward: 267_000, chance: 0, derived: true },
  { id: "bomboclat-crocolat", source: "brainrot", en: "Bomboclat Crocolat", th: "บอมโบแคลต ครอกโกแลต", rarity: "secret", income: 20_000_000, speedReward: 860_000, chance: 0, derived: true },
  { id: "strawberry-elephant", source: "brainrot", en: "Strawberry Elephant", th: "ช้างสตรอว์เบอร์รี", rarity: "eternal", income: 110_000_000, speedReward: 143_000, chance: 0, derived: true },

  // ── Monster (Robux shop) — no speed bonus on any of them ────────────────
  // Luminous — IGN lists cash only ("Unknown" income, no speed), so income is
  // cash / 100. A Luminous re-roll keeps its base pet's rarity, as Mecha does.
  { id: "spike", source: "luminous", en: "Spike", th: "สไปค์", rarity: "legendary", income: 15_000, speedReward: 0, chance: 39, derived: true },
  { id: "spirit-manta", source: "luminous", en: "Spirit Manta", th: "กระเบนวิญญาณ", rarity: "mythic", income: 75_000, speedReward: 0, chance: 24, derived: true },
  { id: "abyss-shark", source: "luminous", en: "Abyss Shark", th: "ฉลามห้วงลึก", rarity: "cosmic", income: 2_500_000, speedReward: 0, chance: 18, derived: true },
  { id: "electric-eel", source: "luminous", en: "Electric Eel", th: "ปลาไหลไฟฟ้า", rarity: "secret", income: 200_000_000, speedReward: 0, chance: 11, derived: true },
  { id: "terra-snapper", source: "luminous", en: "Terra Snapper", th: "เทอร์ร่า สแนปเปอร์", rarity: "eternal", income: 750_000_000, speedReward: 0, chance: 6.5, derived: true },
  { id: "cthulhu", source: "luminous", en: "Cthulhu", th: "คธูลู", rarity: "divine", income: 3_000_000_000, speedReward: 0, chance: 0.5, derived: true },
  { id: "luminous-spike", source: "luminous", en: "Luminous Spike", th: "ลูมินัส สไปค์", rarity: "legendary", income: 350_000_000, speedReward: 0, chance: 1, derived: true },
  { id: "luminous-spirit-manta", source: "luminous", en: "Luminous Spirit Manta", th: "ลูมินัส กระเบนวิญญาณ", rarity: "mythic", income: 500_000_000, speedReward: 0, chance: 1, derived: true },
  { id: "luminous-abyss-shark", source: "luminous", en: "Luminous Abyss Shark", th: "ลูมินัส ฉลามห้วงลึก", rarity: "cosmic", income: 600_000_000, speedReward: 0, chance: 1, derived: true },
  { id: "luminous-electric-eel", source: "luminous", en: "Luminous Electric Eel", th: "ลูมินัส ปลาไหลไฟฟ้า", rarity: "secret", income: 1_750_000_000, speedReward: 0, chance: 1, derived: true },
  { id: "luminous-terra-snapper", source: "luminous", en: "Luminous Terra Snapper", th: "ลูมินัส เทอร์ร่า สแนปเปอร์", rarity: "eternal", income: 2_500_000_000, speedReward: 0, chance: 1, derived: true },
  { id: "luminous-cthulhu", source: "luminous", en: "Luminous Cthulhu", th: "ลูมินัส คธูลู", rarity: "divine", income: 6_500_000_000, speedReward: 0, chance: 1, derived: true },

  { id: "scorpio", source: "monster", en: "Scorpio", th: "สกอร์ปิโอ", rarity: "legendary", income: 10_000, speedReward: 0, chance: 39 },
  { id: "froggo", source: "monster", en: "Froggo", th: "ฟร็อกโก", rarity: "mythic", income: 50_000, speedReward: 0, chance: 24, derived: true },
  { id: "crawler", source: "monster", en: "Crawler", th: "ครอว์เลอร์", rarity: "cosmic", income: 1_500_000, speedReward: 0, chance: 18, derived: true },
  { id: "crocodon", source: "monster", en: "Crocodon", th: "ครอกโคดอน", rarity: "secret", income: 30_000_000, speedReward: 0, chance: 11, derived: true },
  { id: "krakenoid", source: "monster", en: "Krakenoid", th: "คราเคนอยด์", rarity: "eternal", income: 500_000_000, speedReward: 0, chance: 6.5, derived: true },
  { id: "dreadscale", source: "monster", en: "Dreadscale", th: "เดรดสเกล", rarity: "divine", income: 2_000_000_000, speedReward: 0, chance: 0.5, derived: true },
  { id: "mecha-scorpio", source: "monster", en: "Mecha Scorpio", th: "เมคา สกอร์ปิโอ", rarity: "legendary", income: 20_000, speedReward: 0, chance: 1, derived: true },
  { id: "mecha-froggo", source: "monster", en: "Mecha Froggo", th: "เมคา ฟร็อกโก", rarity: "mythic", income: 100_000, speedReward: 0, chance: 1, derived: true },
  { id: "mecha-crawler", source: "monster", en: "Mecha Crawler", th: "เมคา ครอว์เลอร์", rarity: "cosmic", income: 3_000_000, speedReward: 0, chance: 1, derived: true },
  { id: "mecha-crocodon", source: "monster", en: "Mecha Crocodon", th: "เมคา ครอกโคดอน", rarity: "secret", income: 60_000_000, speedReward: 0, chance: 1, derived: true },
  { id: "mecha-krakenoid", source: "monster", en: "Mecha Krakenoid", th: "เมคา คราเคนอยด์", rarity: "eternal", income: 1_000_000_000, speedReward: 0, chance: 1, derived: true },
  { id: "mecha-dreadscale", source: "monster", en: "Mecha Dreadscale", th: "เมคา เดรดสเกล", rarity: "divine", income: 4_000_000_000, speedReward: 0, chance: 1, derived: true },

  // ── Rift banner 1 ───────────────────────────────────────────────────────
  { id: "rift-eye", source: "rift", tile: true, banner: 1, en: "Rift Eye", th: "ริฟต์อาย", rarity: "legendary", income: 11_000, speedReward: 42_000, chance: 45 },
  { id: "voidmaw", source: "rift", tile: true, banner: 1, en: "Voidmaw", th: "วอยด์มอว์", rarity: "mythic", income: 50_000, speedReward: 42_000, chance: 36 },
  { id: "ventinal", source: "rift", tile: true, banner: 1, en: "Ventinal", th: "เวนตินัล", rarity: "cosmic", income: 585_000, speedReward: 34_000, chance: 15 },
  { id: "wendigo", source: "rift", tile: true, banner: 1, en: "Wendigo", th: "เวนดิโก", rarity: "secret", income: 15_000_000, speedReward: 40_000, chance: 4 },
  { id: "world-eater", source: "rift", tile: true, banner: 1, en: "World Eater", th: "เวิลด์ อีตเตอร์", rarity: "eternal", income: 500_000_000, speedReward: 60_000, chance: 0.5 },

  // ── Rift banner 2 ───────────────────────────────────────────────────────
  { id: "void-angler", source: "rift", tile: true, banner: 2, en: "Void Angler", th: "วอยด์ แองเกลอร์", rarity: "legendary", income: 30_000, speedReward: 42_000, chance: 45 },
  { id: "riftwing", source: "rift", tile: true, banner: 2, en: "Riftwing", th: "ริฟต์วิง", rarity: "mythic", income: 220_000, speedReward: 42_000, chance: 36 },
  { id: "dreadclaw", source: "rift", tile: true, banner: 2, en: "Dreadclaw", th: "เดรดคลอว์", rarity: "cosmic", income: 2_200_000, speedReward: 30_000, chance: 15 },
  { id: "mawbreaker", source: "rift", tile: true, banner: 2, en: "Mawbreaker", th: "มอว์เบรกเกอร์", rarity: "secret", income: 60_000_000, speedReward: 42_000, chance: 4 },
  { id: "void-serpent", source: "rift", tile: true, banner: 2, en: "Void Serpent", th: "วอยด์ เซอร์เพนต์", rarity: "eternal", income: 900_000_000, speedReward: 45_000, chance: 0.5 },

  // ── Rift banner 3 ───────────────────────────────────────────────────────
  { id: "shardling", source: "rift", tile: true, banner: 3, en: "Shardling", th: "ชาร์ดลิง", rarity: "mythic", income: 450_000, speedReward: 42_000, chance: 45 },
  { id: "shattered-ram", source: "rift", tile: true, banner: 3, en: "Shattered Ram", th: "ชัตเทอร์ด แรม", rarity: "cosmic", income: 8_000_000, speedReward: 42_000, chance: 36 },
  { id: "shardwing", source: "rift", tile: true, banner: 3, en: "Shardwing", th: "ชาร์ดวิง", rarity: "secret", income: 145_000_000, speedReward: 32_000, chance: 15 },
  { id: "shattered-drake", source: "rift", tile: true, banner: 3, en: "Shattered Drake", th: "ชัตเทอร์ด เดรก", rarity: "eternal", income: 800_000_000, speedReward: 65_000, chance: 5 },
  { id: "shattered-colossus", source: "rift", tile: true, banner: 3, en: "Shattered Colossus", th: "ชัตเทอร์ด โคลอสซัส", rarity: "divine", income: 3_500_000_000, speedReward: 48_000, chance: 0.5 },
];

export const LIMITED_BY_SOURCE = LIMITED_GROUPS.map((group) => ({
  group,
  pets: LIMITED_PETS.filter((p) => p.source === group.id),
}));

export const limitedImg = (id: string) => `/img/limited/${id}.png`;
export const limitedGroupImg = (id: LimitedSource) => `/img/limited/group-${id}.png`;
