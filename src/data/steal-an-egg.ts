/**
 * Steal an Egg — biome / egg / pet dataset.
 *
 * Sources:
 *  - Eldorado blog "All Eggs" + "All Pets Index"  (egg art, pet art, income per second)
 *  - IGN wiki "All Biomes"                        (guardians, recommended speed, speed rewards)
 *
 * `cashReward` is not stored: every entry in both sources follows income x 100,
 * so it is derived in `cashReward()` below.
 */

export type RarityId =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary"
  | "mythic"
  | "cosmic"
  | "secret"
  | "eternal"
  | "divine";

export type BiomeId =
  | "forest"
  | "lake"
  | "desert"
  | "jungle"
  | "snow"
  | "volcano"
  | "abyss-ocean"
  | "prehistoric"
  | "cosmic"
  | "cherry-blossom"
  | "titan-temple";

export interface Rarity {
  id: RarityId;
  en: string;
  th: string;
  /** low -> high, used for sorting */
  tier: number;
  /** a `var(--r-*)` reference — see RARITIES below */
  color: string;
}

export interface Biome {
  id: BiomeId;
  order: number;
  en: string;
  th: string;
  /** recommended speed to outrun the guardian */
  speed: number;
  guardianEn: string;
  guardianTh: string;
  noteEn: string;
  noteTh: string;
  /** [highlight, shade] — drives the card gradients */
  accent: [string, string];
}

export interface Egg {
  id: string;
  biome: BiomeId;
  rarity: RarityId;
  /** pet name — the egg is "<name> Egg" / "ไข่<name>" */
  en: string;
  th: string;
  /** dollars per second the hatched pet generates */
  income: number;
  /** permanent speed granted on first collection; null where the wiki has no figure */
  speedReward: number | null;
}

/**
 * `color` is a CSS custom property, not a literal — globals.css retunes the
 * whole ramp for dark mode, so no component needs to know the active theme.
 */
export const RARITIES: Rarity[] = [
  { id: "common", en: "Common", th: "ธรรมดา", tier: 1, color: "var(--r-common)" },
  { id: "uncommon", en: "Uncommon", th: "ไม่ธรรมดา", tier: 2, color: "var(--r-uncommon)" },
  { id: "rare", en: "Rare", th: "หายาก", tier: 3, color: "var(--r-rare)" },
  { id: "epic", en: "Epic", th: "อีพิค", tier: 4, color: "var(--r-epic)" },
  { id: "legendary", en: "Legendary", th: "ตำนาน", tier: 5, color: "var(--r-legendary)" },
  { id: "mythic", en: "Mythic", th: "เทพนิยาย", tier: 6, color: "var(--r-mythic)" },
  { id: "cosmic", en: "Cosmic", th: "จักรวาล", tier: 7, color: "var(--r-cosmic)" },
  { id: "secret", en: "Secret", th: "ลับ", tier: 8, color: "var(--r-secret)" },
  { id: "eternal", en: "Eternal", th: "นิรันดร์", tier: 9, color: "var(--r-eternal)" },
  { id: "divine", en: "Divine", th: "เทพเจ้า", tier: 10, color: "var(--r-divine)" },
];

export const RARITY_BY_ID = Object.fromEntries(RARITIES.map((r) => [r.id, r])) as Record<RarityId, Rarity>;

export const BIOMES: Biome[] = [
  {
    id: "forest",
    order: 1,
    en: "Forest",
    th: "ป่าไม้",
    speed: 0,
    guardianEn: "Chicken",
    guardianTh: "ไก่",
    noteEn: "The starting area. No speed requirement and the easiest guardian in the game.",
    noteTh: "โซนเริ่มต้น ไม่ต้องใช้ความเร็ว และมีผู้พิทักษ์ที่หนีง่ายที่สุดในเกม",
    accent: ["#34d399", "#065f46"],
  },
  {
    id: "lake",
    order: 2,
    en: "Lake",
    th: "ทะเลสาบ",
    speed: 900,
    guardianEn: "Swan",
    guardianTh: "หงส์",
    noteEn: "First zone with a real speed check — reaching the nest no longer guarantees you keep the egg.",
    noteTh: "โซนแรกที่มีเงื่อนไขความเร็วจริง ๆ ถึงรังได้ไม่ได้แปลว่าจะเอาไข่กลับได้",
    accent: ["#38bdf8", "#075985"],
  },
  {
    id: "desert",
    order: 3,
    en: "Desert",
    th: "ทะเลทราย",
    speed: 10_000,
    guardianEn: "Scorpion",
    guardianTh: "แมงป่อง",
    noteEn: "Open ground with almost no cover, so taking the shortest line back matters most here.",
    noteTh: "พื้นที่โล่งไม่มีที่กำบัง ต้องวิ่งกลับเส้นทางที่สั้นที่สุดเท่านั้น",
    accent: ["#fcd34d", "#b45309"],
  },
  {
    id: "jungle",
    order: 4,
    en: "Jungle",
    th: "ป่าดงดิบ",
    speed: 40_000,
    guardianEn: "Tiger",
    guardianTh: "เสือโคร่ง",
    noteEn: "The Tiger closes the gap fast if you hesitate for even a moment after grabbing an egg.",
    noteTh: "เสือไล่ทันเร็วมาก ถ้าลังเลแม้แต่นิดเดียวหลังหยิบไข่ก็โดนจับ",
    accent: ["#a3e635", "#3f6212"],
  },
  {
    id: "snow",
    order: 5,
    en: "Snow",
    th: "หิมะ",
    speed: 170_000,
    guardianEn: "Yeti",
    guardianTh: "เยติ",
    noteEn: "The Yeti is huge and easy to track, but this is where the first Eternal pet shows up.",
    noteTh: "เยติตัวใหญ่มองเห็นง่าย แต่โซนนี้คือจุดที่เพ็ตระดับ Eternal ตัวแรกโผล่มา",
    accent: ["#bae6fd", "#0284c7"],
  },
  {
    id: "volcano",
    order: 6,
    en: "Volcano",
    th: "ภูเขาไฟ",
    speed: 700_000,
    guardianEn: "Cerberus",
    guardianTh: "เซอร์เบอรัส",
    noteEn: "Start of the late game. Best income per effort outside of the Secret tier.",
    noteTh: "จุดเริ่มของช่วงปลายเกม คุ้มค่าที่สุดถ้ายังไม่แตะระดับ Secret",
    accent: ["#fb923c", "#991b1b"],
  },
  {
    id: "abyss-ocean",
    order: 7,
    en: "Abyss Ocean",
    th: "ทะเลลึก",
    speed: 2_500_000,
    guardianEn: "Beluga Whale",
    guardianTh: "วาฬเบลูกา",
    noteEn: "First zone where the requirement hits millions — even a small speed loss is noticeable.",
    noteTh: "โซนแรกที่ต้องใช้ความเร็วระดับล้าน เสียความเร็วนิดเดียวก็รู้สึกได้",
    accent: ["#22d3ee", "#164e63"],
  },
  {
    id: "prehistoric",
    order: 8,
    en: "Prehistoric",
    th: "ยุคก่อนประวัติศาสตร์",
    speed: 18_000_000,
    guardianEn: "T-Rex",
    guardianTh: "ที-เร็กซ์",
    noteEn: "Long runs back to the pen, so getting caught here costs a lot of time.",
    noteTh: "ระยะวิ่งกลับไกล ถ้าโดนจับที่นี่จะเสียเวลามาก",
    accent: ["#d97706", "#44403c"],
  },
  {
    id: "cosmic",
    order: 9,
    en: "Cosmic",
    th: "จักรวาล",
    speed: 700_000_000,
    guardianEn: "Cosmic Skeleton Boss",
    guardianTh: "บอสโครงกระดูกจักรวาล",
    noteEn: "Comes right after the biggest speed jump in the game — 18M straight to 700M.",
    noteTh: "อยู่หลังการกระโดดของความเร็วที่สูงที่สุดในเกม จาก 18M ไป 700M ทันที",
    accent: ["#a78bfa", "#4c1d95"],
  },
  {
    id: "cherry-blossom",
    order: 10,
    en: "Cherry Blossom",
    th: "ซากุระ",
    speed: 2_500_000_000,
    guardianEn: "Oni Tiger",
    guardianTh: "เสือโอนิ",
    noteEn: "Home of the Sakura Incubator, unlocked with a Crane. Getting caught can send you back to Abyss Ocean.",
    noteTh: "ที่ตั้งของ Sakura Incubator ปลดล็อกด้วย Crane ถ้าโดนจับอาจถูกส่งกลับไปถึงทะเลลึก",
    accent: ["#f9a8d4", "#9d174d"],
  },
  {
    id: "titan-temple",
    order: 11,
    en: "Titan Temple",
    th: "วิหารไททัน",
    speed: 7_000_000_000,
    guardianEn: "Gorilla King",
    guardianTh: "ราชากอริลลา",
    noteEn: "Newest and furthest biome on the map, holding the highest-earning pet in the game.",
    noteTh: "ไบโอมใหม่ล่าสุดและไกลที่สุดบนแมป มีเพ็ตที่ทำเงินสูงที่สุดในเกม",
    accent: ["#fb7185", "#4c0519"],
  },
];

export const BIOME_BY_ID = Object.fromEntries(BIOMES.map((b) => [b.id, b])) as Record<BiomeId, Biome>;

export const EGGS: Egg[] = [
  // ── Forest ──────────────────────────────────────────────────────────────
  { id: "chicken", biome: "forest", rarity: "common", en: "Chicken", th: "ไก่", income: 1, speedReward: 420 },
  { id: "dog", biome: "forest", rarity: "common", en: "Dog", th: "สุนัข", income: 2, speedReward: 460 },
  { id: "bird", biome: "forest", rarity: "uncommon", en: "Bird", th: "นก", income: 8, speedReward: 500 },
  { id: "owl", biome: "forest", rarity: "rare", en: "Burrowing Owl", th: "นกฮูกขุดโพรง", income: 35, speedReward: 560 },
  { id: "raccoon", biome: "forest", rarity: "rare", en: "Raccoon", th: "แรคคูน", income: 45, speedReward: 620 },
  { id: "bear", biome: "forest", rarity: "epic", en: "Bear", th: "หมี", income: 240, speedReward: 820 },
  { id: "fox", biome: "forest", rarity: "epic", en: "Fox", th: "สุนัขจิ้งจอก", income: 180, speedReward: 720 },
  { id: "brr-brr-patapim", biome: "forest", rarity: "legendary", en: "Brr Brr Patapim", th: "เบรอ เบรอ ปาตาปิม", income: 1_800, speedReward: 1_000 },

  // ── Lake ────────────────────────────────────────────────────────────────
  { id: "frog", biome: "lake", rarity: "common", en: "Frog", th: "กบ", income: 3, speedReward: 2_000 },
  { id: "duckling", biome: "lake", rarity: "common", en: "Duckling", th: "ลูกเป็ด", income: 4, speedReward: 2_200 },
  { id: "catfish", biome: "lake", rarity: "uncommon", en: "Catfish", th: "ปลาดุก", income: 12, speedReward: 2_500 },
  { id: "turtle", biome: "lake", rarity: "rare", en: "Turtle", th: "เต่า", income: 60, speedReward: 2_700 },
  { id: "trulimero-trulicina", biome: "lake", rarity: "epic", en: "Trulimero Trulicina", th: "ทรูลิเมโร ทรูลิชินา", income: 260, speedReward: 3_000 },
  { id: "swan", biome: "lake", rarity: "epic", en: "Swan", th: "หงส์", income: 320, speedReward: 3_500 },
  { id: "axolotl", biome: "lake", rarity: "legendary", en: "Axolotl", th: "อโซล็อตล์", income: 2_800, speedReward: 4_000 },
  { id: "leviathan", biome: "lake", rarity: "cosmic", en: "Leviathan", th: "ลีไวอาธาน", income: 220_000, speedReward: 5_000 },

  // ── Desert ──────────────────────────────────────────────────────────────
  { id: "jerboa", biome: "desert", rarity: "common", en: "Jerboa", th: "หนูจิงโจ้", income: 6, speedReward: 7_200 },
  { id: "fennec", biome: "desert", rarity: "uncommon", en: "Fennec", th: "จิ้งจอกเฟนเนก", income: 18, speedReward: 8_100 },
  { id: "camel", biome: "desert", rarity: "rare", en: "Camel", th: "อูฐ", income: 75, speedReward: 9_000 },
  { id: "tob-tobi-tob-tob", biome: "desert", rarity: "epic", en: "Tob Tobi Tob Tob", th: "ท็อบ โทบิ ท็อบ ท็อบ", income: 325, speedReward: 9_900 },
  { id: "snake", biome: "desert", rarity: "legendary", en: "Snake", th: "งู", income: 3_600, speedReward: 10_800 },
  { id: "scorpion", biome: "desert", rarity: "mythic", en: "Scorpion", th: "แมงป่อง", income: 18_500, speedReward: null },
  { id: "sand-spider", biome: "desert", rarity: "mythic", en: "Sand Spider", th: "แมงมุมทราย", income: 16_000, speedReward: 12_600 },
  { id: "royal-sphinx", biome: "desert", rarity: "cosmic", en: "Royal Sphinx", th: "สฟิงซ์หลวง", income: 280_000, speedReward: 18_000 },

  // ── Jungle ──────────────────────────────────────────────────────────────
  { id: "toucan", biome: "jungle", rarity: "rare", en: "Toucan", th: "นกทูแคน", income: 110, speedReward: 8_100 },
  { id: "chimpanzee", biome: "jungle", rarity: "rare", en: "Chimpanzee", th: "ชิมแปนซี", income: 90, speedReward: 7_200 },
  { id: "crocodile", biome: "jungle", rarity: "epic", en: "Crocodile", th: "จระเข้", income: 420, speedReward: 9_000 },
  { id: "gorilla", biome: "jungle", rarity: "legendary", en: "Gorilla", th: "กอริลลา", income: 4_800, speedReward: 9_900 },
  { id: "orangutini-ananassini", biome: "jungle", rarity: "legendary", en: "Orangutini Ananassini", th: "โอรังกูตินี อะนานัสซินี", income: 5_500, speedReward: 10_800 },
  { id: "spider", biome: "jungle", rarity: "mythic", en: "Spider", th: "แมงมุม", income: 22_000, speedReward: 12_600 },
  { id: "tiger", biome: "jungle", rarity: "mythic", en: "Tiger", th: "เสือโคร่ง", income: 28_000, speedReward: 14_400 },
  { id: "king-snake", biome: "jungle", rarity: "secret", en: "King Snake", th: "ราชางู", income: 3_500_000, speedReward: 18_000 },

  // ── Snow ────────────────────────────────────────────────────────────────
  { id: "penguin", biome: "snow", rarity: "rare", en: "Penguin", th: "เพนกวิน", income: 140, speedReward: 12_800 },
  { id: "walrus", biome: "snow", rarity: "epic", en: "Walrus", th: "วอลรัส", income: 600, speedReward: 14_400 },
  { id: "polar-bear", biome: "snow", rarity: "legendary", en: "Polar Bear", th: "หมีขั้วโลก", income: 7_000, speedReward: 16_000 },
  { id: "sabertooth-tiger", biome: "snow", rarity: "mythic", en: "Sabertooth Tiger", th: "เสือเขี้ยวดาบ", income: 35_000, speedReward: 17_600 },
  { id: "mammoth", biome: "snow", rarity: "mythic", en: "Mammoth", th: "แมมมอธ", income: 42_000, speedReward: 19_200 },
  { id: "king-mammoth", biome: "snow", rarity: "cosmic", en: "King Mammoth", th: "ราชาแมมมอธ", income: 400_000, speedReward: 22_400 },
  { id: "yeti", biome: "snow", rarity: "secret", en: "Yeti", th: "เยติ", income: 5_000_000, speedReward: 25_600 },
  { id: "ice-dragon", biome: "snow", rarity: "eternal", en: "Ice Dragon", th: "มังกรน้ำแข็ง", income: 65_000_000, speedReward: 32_000 },

  // ── Volcano ─────────────────────────────────────────────────────────────
  { id: "lava-gecko", biome: "volcano", rarity: "rare", en: "Lava Gecko", th: "ตุ๊กแกลาวา", income: 180, speedReward: 24_000 },
  { id: "lava-frog", biome: "volcano", rarity: "epic", en: "Lava Frog", th: "กบลาวา", income: 850, speedReward: 27_000 },
  { id: "flaming-bull", biome: "volcano", rarity: "legendary", en: "Flaming Bull", th: "กระทิงเพลิง", income: 9_500, speedReward: 30_000 },
  { id: "lava-iguana", biome: "volcano", rarity: "legendary", en: "Lava Iguana", th: "อีกัวน่าลาวา", income: 11_000, speedReward: 36_000 },
  { id: "chillin-chilli", biome: "volcano", rarity: "mythic", en: "Chillin Chilli", th: "ชิลลิน ชิลลี่", income: 55_000, speedReward: 33_000 },
  { id: "cerberus", biome: "volcano", rarity: "secret", en: "Cerberus", th: "เซอร์เบอรัส", income: 8_000_000, speedReward: 42_000 },
  { id: "phoenix", biome: "volcano", rarity: "eternal", en: "Phoenix", th: "ฟีนิกซ์", income: 85_000_000, speedReward: 48_000 },
  { id: "lava-dragon", biome: "volcano", rarity: "eternal", en: "Lava Dragon", th: "มังกรลาวา", income: 100_000_000, speedReward: 60_000 },

  // ── Abyss Ocean ─────────────────────────────────────────────────────────
  { id: "parrotfish", biome: "abyss-ocean", rarity: "rare", en: "Parrotfish", th: "ปลานกแก้ว", income: 220, speedReward: 72_000 },
  { id: "swordfish", biome: "abyss-ocean", rarity: "epic", en: "Swordfish", th: "ปลากระโทงดาบ", income: 1_100, speedReward: 81_000 },
  { id: "shark", biome: "abyss-ocean", rarity: "legendary", en: "Shark", th: "ฉลาม", income: 15_000, speedReward: 90_000 },
  { id: "orca", biome: "abyss-ocean", rarity: "mythic", en: "Orca", th: "วาฬเพชฌฆาต", income: 80_000, speedReward: 99_000 },
  { id: "whale-shark", biome: "abyss-ocean", rarity: "cosmic", en: "Whale Shark", th: "ฉลามวาฬ", income: 700_000, speedReward: 108_000 },
  { id: "beluga-whale", biome: "abyss-ocean", rarity: "cosmic", en: "Beluga Whale", th: "วาฬเบลูกา", income: 850_000, speedReward: 126_000 },
  { id: "kraken", biome: "abyss-ocean", rarity: "secret", en: "Kraken", th: "คราเคน", income: 15_000_000, speedReward: 144_000 },
  { id: "el-maja", biome: "abyss-ocean", rarity: "eternal", en: "El Maja", th: "เอล มาฮา", income: 130_000_000, speedReward: 180_000 },

  // ── Prehistoric ─────────────────────────────────────────────────────────
  { id: "dodo", biome: "prehistoric", rarity: "rare", en: "Dodo", th: "นกโดโด", income: 280, speedReward: 240_000 },
  { id: "pterodactyl", biome: "prehistoric", rarity: "legendary", en: "Pterodactyl", th: "เทอโรแดกทิล", income: 22_000, speedReward: 270_000 },
  { id: "ankylosaurus", biome: "prehistoric", rarity: "mythic", en: "Ankylosaurus", th: "แองคิโลซอรัส", income: 120_000, speedReward: 330_000 },
  { id: "triceratops", biome: "prehistoric", rarity: "cosmic", en: "Triceratops", th: "ไทรเซราทอปส์", income: 1_200_000, speedReward: 360_000 },
  { id: "bronto", biome: "prehistoric", rarity: "cosmic", en: "Bronto", th: "บรอนโต", income: 1_500_000, speedReward: 300_000 },
  { id: "tralaledon", biome: "prehistoric", rarity: "secret", en: "Tralaledon", th: "ทราลาเลดอน", income: 32_000_000, speedReward: 480_000 },
  { id: "t-rex", biome: "prehistoric", rarity: "secret", en: "T-Rex", th: "ที-เร็กซ์", income: 25_000_000, speedReward: 420_000 },
  { id: "mosasaurus", biome: "prehistoric", rarity: "eternal", en: "Mosasaurus", th: "โมซาซอรัส", income: 180_000_000, speedReward: 600_000 },

  // ── Cosmic ──────────────────────────────────────────────────────────────
  { id: "centapede", biome: "cosmic", rarity: "epic", en: "Centapede", th: "ตะขาบ", income: 1_500, speedReward: 960_000 },
  { id: "cosmic-gecko", biome: "cosmic", rarity: "legendary", en: "Cosmic Gecko", th: "ตุ๊กแกจักรวาล", income: 30_000, speedReward: 1_000_000 },
  { id: "cosmic-gorilla", biome: "cosmic", rarity: "mythic", en: "Cosmic Gorilla", th: "กอริลลาจักรวาล", income: 180_000, speedReward: 1_200_000 },
  { id: "la-vacca-saturno-saturnita", biome: "cosmic", rarity: "cosmic", en: "La Vacca Saturno Saturnita", th: "ลา วักกา ซาตูร์โน ซาตูร์นิตา", income: 2_200_000, speedReward: 1_300_000 },
  { id: "cosmic-dragon", biome: "cosmic", rarity: "secret", en: "Cosmic Dragon", th: "มังกรจักรวาล", income: 60_000_000, speedReward: 1_400_000 },
  { id: "cosmic-skeleton-boss", biome: "cosmic", rarity: "secret", en: "Cosmic Skeleton Boss", th: "บอสโครงกระดูกจักรวาล", income: 45_000_000, speedReward: 1_600_000 },
  { id: "eternal-lunar-dragon", biome: "cosmic", rarity: "eternal", en: "Eternal Lunar Dragon", th: "มังกรจันทราอมตะ", income: 250_000_000, speedReward: 1_900_000 },
  { id: "unicorn", biome: "cosmic", rarity: "divine", en: "Unicorn", th: "ยูนิคอร์น", income: 1_000_000_000, speedReward: 2_400_000 },

  // ── Cherry Blossom ──────────────────────────────────────────────────────
  { id: "crane", biome: "cherry-blossom", rarity: "epic", en: "Crane", th: "นกกระเรียน", income: 4_000, speedReward: 2_700_000 },
  { id: "salamander", biome: "cherry-blossom", rarity: "legendary", en: "Salamander", th: "ซาลาแมนเดอร์", income: 74_000, speedReward: 3_000_000 },
  { id: "red-panda", biome: "cherry-blossom", rarity: "mythic", en: "Red Panda", th: "แพนด้าแดง", income: 450_000, speedReward: 3_400_000 },
  { id: "koi", biome: "cherry-blossom", rarity: "cosmic", en: "Koi", th: "ปลาคาร์ปโคย", income: 12_000_000, speedReward: 4_200_000 },
  { id: "snowy-owl", biome: "cherry-blossom", rarity: "cosmic", en: "Snowy Owl", th: "นกฮูกหิมะ", income: 7_500_000, speedReward: 3_700_000 },
  { id: "stag", biome: "cherry-blossom", rarity: "secret", en: "Stag", th: "กวางเขาใหญ่", income: 145_000_000, speedReward: 4_800_000 },
  { id: "oni-tiger", biome: "cherry-blossom", rarity: "eternal", en: "Oni Tiger", th: "เสือโอนิ", income: 600_000_000, speedReward: 5_400_000 },
  { id: "kitsune", biome: "cherry-blossom", rarity: "divine", en: "Kitsune", th: "คิตสึเนะ จิ้งจอกเก้าหาง", income: 1_800_000_000, speedReward: 6_500_000 },

  // ── Titan Temple ────────────────────────────────────────────────────────
  { id: "crustacia", biome: "titan-temple", rarity: "legendary", en: "Crustacia", th: "ครัสเตเชีย", income: 130_000, speedReward: 2_700_000 },
  { id: "spideron", biome: "titan-temple", rarity: "legendary", en: "Spideron", th: "สไปเดอรอน", income: 95_000, speedReward: 2_700_000 },
  { id: "bladehide", biome: "titan-temple", rarity: "mythic", en: "Bladehide", th: "เบลดไฮด์", income: 750_000, speedReward: 4_800_000 },
  { id: "mantaris", biome: "titan-temple", rarity: "cosmic", en: "Mantaris", th: "แมนทาริส", income: 11_000_000, speedReward: 3_400_000 },
  { id: "rhinotaur", biome: "titan-temple", rarity: "cosmic", en: "Rhinotaur", th: "ไรโนทอร์", income: 17_500_000, speedReward: 3_000_000 },
  { id: "mutant-shark", biome: "titan-temple", rarity: "secret", en: "Mutant Shark", th: "ฉลามกลายพันธุ์", income: 215_000_000, speedReward: 4_100_000 },
  { id: "gorilla-king", biome: "titan-temple", rarity: "eternal", en: "Gorilla King", th: "ราชากอริลลา", income: 880_000_000, speedReward: 5_400_000 },
  { id: "nightflame", biome: "titan-temple", rarity: "divine", en: "Nightflame", th: "ไนท์เฟลม", income: 3_000_000_000, speedReward: 6_800_000 },
];

/* ── helpers ─────────────────────────────────────────────────────────────── */

const UNITS: [number, string][] = [
  [1e12, "T"],
  [1e9, "B"],
  [1e6, "M"],
  [1e3, "K"],
];

/** 1800 -> "1.8K", 65000000 -> "65M" */
export function compact(n: number): string {
  for (const [size, suffix] of UNITS) {
    if (n >= size) {
      const v = n / size;
      return `${v % 1 === 0 ? v : Number(v.toFixed(2))}${suffix}`;
    }
  }
  return String(n);
}

export const money = (n: number) => `$${compact(n)}`;

/** First-collection cash bonus — every source lists it as income x 100. */
export const cashReward = (egg: Egg) => egg.income * 100;

export const eggImg = (id: string) => `/img/eggs/${id}.webp`;
export const petImg = (id: string) => `/img/pets/${id}.webp`;
export const biomeImg = (id: BiomeId) => `/img/biomes/${id}.png`;

export const EGGS_BY_BIOME = BIOMES.map((biome) => ({
  biome,
  eggs: EGGS.filter((e) => e.biome === biome.id),
}));

export const SITE = {
  mapNameTh: "SweetParadise",
  mapNameEn: "Sweet Paradise",
  mapUrl: "https://www.roblox.com/th/games/115633751220614/Sweet-paradise",
  creditTh: "สร้างโดยแมพ SweetParadise",
  creditEn: "Made by the SweetParadise map",
} as const;
