// Downloads real egg / pet / biome artwork into public/img so the site never hotlinks.
// Sources: eldorado.gg blog (eggs + pets), IGN wiki (biome guardians).
import { mkdir, writeFile, access } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ELD = "https://www.eldorado.gg/blog/wp-content/uploads";
const IGN = "https://oyster.ignimgs.com/mediawiki/apis.ign.com/steal-an-egg-roblox";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

// id -> [egg file under 2026/09, pet file under 2026/08]
const ART = {
  chicken: ["Chicken_Egg.png.webp", "Chicken.png.webp"],
  dog: ["Dog_Egg.png.webp", "Dog-1.webp"],
  bird: ["Bird_Egg.png.webp", "Bird.png.webp"],
  owl: ["Burrowing_Owl_Egg.png.webp", "Burrowing-Owl.webp"],
  raccoon: ["Raccoon_Egg.png.webp", "Raccoon.webp"],
  bear: ["Bear_Egg.png.webp", "Bear.webp"],
  fox: ["Fox_Egg.png.webp", "Fox-1.webp"],
  "brr-brr-patapim": ["Brr_Brr_Patapim_Egg.png.webp", "Brr-Brr-Patapim.webp"],

  frog: ["Frog_Egg.png.webp", "Frog.webp"],
  duckling: ["Duckling_Egg.png.webp", "Duckling.webp"],
  catfish: ["Catfish_Egg.png.webp", "Catfish.png.webp"],
  turtle: ["Turtle_Egg.png.webp", "Turtle.webp"],
  "trulimero-trulicina": ["Trulimero_Trulicina_Egg.png.webp", "Trulimero-Trulicina.webp"],
  swan: ["Swan_Egg.png.webp", "Swan-1.webp"],
  axolotl: ["Axolotl_Egg.png.webp", "Axolotl.webp"],
  leviathan: ["Leviathan_Egg.png.webp", "Leviathan.webp"],

  jerboa: ["Jerboa_Egg.png.webp", "Jerboa.webp"],
  fennec: ["Fennec_Egg.png.webp", "Fennec.webp"],
  camel: ["Camel_Egg.png.webp", "Camel.png.webp"],
  "tob-tobi-tob-tob": ["Tob_Tobi_Tob_Tob_Egg.png.webp", "Tob-Tobi-Tob-Tob.webp"],
  snake: ["Snake_Egg.png.webp", "Snake.webp"],
  scorpion: ["Scorpion_Egg.png.webp", "Scorpion.webp"],
  "sand-spider": ["Sand_Spider_Egg.png.webp", "Sand-Spider.webp"],
  "royal-sphinx": ["Royal_Sphinx_Egg.png.webp", "Royal-Sphinx.webp"],

  toucan: ["Toucan_Egg.png.webp", "Toucan.webp"],
  chimpanzee: ["Chimpanzee_Egg.png.webp", "Chimpanzee.webp"],
  crocodile: ["Crocodile_Egg.png.webp", "Crocodile.webp"],
  gorilla: ["Gorilla_Egg.png.webp", "Gorilla.webp"],
  "orangutini-ananassini": ["Orangutini_Ananassini_Egg.png.webp", "Orangutini-Ananassini.webp"],
  spider: ["Spider_Egg.png.webp", "Spider.webp"],
  tiger: ["Tiger_Egg.png.webp", "Tiger.webp"],
  "king-snake": ["King_Snake_Egg.png.webp", "King-Snake.webp"],

  penguin: ["Penguin_Egg.png.webp", "Penguin.webp"],
  walrus: ["Walrus_Egg.png.webp", "Walrus.webp"],
  "polar-bear": ["Polar_Bear_Egg.png.webp", "Polar-Bear.webp"],
  "sabertooth-tiger": ["Sabertooth_Tiger_Egg.png.webp", "Sabertooth-Tiger.webp"],
  mammoth: ["Mammoth_Egg.png.webp", "Mammoth.webp"],
  "king-mammoth": ["King_Mammoth_Egg.png.webp", "King-Mammoth.webp"],
  yeti: ["Yeti_Egg.png.webp", "Yeti.webp"],
  "ice-dragon": ["Ice_Dragon_Egg.png.webp", "Ice-Dragon.webp"],

  "lava-gecko": ["Lava_Gecko_Egg.png.webp", "Lava-Gecko.webp"],
  "lava-frog": ["Lava_Frog_Egg.png.webp", "Lava-Frog.webp"],
  "flaming-bull": ["Flaming_Bull_Egg.png.webp", "Flaming-Bull.webp"],
  "lava-iguana": ["Lava_Iguana_Egg.png.webp", "Lava-Iguana.webp"],
  "chillin-chilli": ["Chillin_Chilli_Egg.png.webp", "Chillin-Chilli.webp"],
  cerberus: ["Cerberus_Egg.png.webp", "Cerberus.png.webp"],
  phoenix: ["Phoenix_Egg.png.webp", "Phoenix.webp"],
  "lava-dragon": ["Lava_Dragon_Egg.png.webp", "Lava-Dragon.webp"],

  parrotfish: ["Parrotfish_Egg.png.webp", "Parrotfish.webp"],
  swordfish: ["Swordfish_Egg.png.webp", "Swordfish.webp"],
  shark: ["Shark_Egg.png.webp", "Shark.webp"],
  orca: ["Orca_Egg.png.webp", "Orca.webp"],
  "whale-shark": ["Whale_Shark_Egg.png.webp", "Whale-Shark.webp"],
  "beluga-whale": ["Beluga_Whale_Egg.png.webp", "Beluga-Whale.webp"],
  kraken: ["Kraken_Egg.png.webp", "Kraken.webp"],
  "el-maja": ["El_Maja_Egg.png.webp", "El-Maja.webp"],

  dodo: ["Dodo_Egg.png.webp", "Dodo.webp"],
  pterodactyl: ["Pterodactyl_Egg.png.webp", "Pterodactyl.webp"],
  ankylosaurus: ["Ankylosaurus_Egg.png.webp", "Ankylosaurus.webp"],
  triceratops: ["Triceratops_Egg.png.webp", "Triceratops.webp"],
  bronto: ["Bronto_Egg.png.webp", "Bronto.webp"],
  tralaledon: ["Tralaledon_Egg.png.webp", "Tralaledon.webp"],
  "t-rex": ["T-Rex_Egg.png.webp", "T-Rex.webp"],
  mosasaurus: ["Mosasaurus_Egg.png.webp", "Mosasaurus.webp"],

  centapede: ["Centapede_Egg.png.webp", "Centapede.png.webp"],
  "cosmic-gecko": ["Cosmic_Gecko_Egg.png.webp", "Cosmic-Gecko.webp"],
  "cosmic-gorilla": ["Cosmic_Gorilla_Egg.png.webp", "Cosmic-Gorilla.webp"],
  "la-vacca-saturno-saturnita": [
    "La_Vacca_Saturno_Saturnita_Egg.png.webp",
    "La-Vacca-Saturno-Saturnita.webp",
  ],
  "cosmic-dragon": ["Cosmic_Dragon_Egg.png.webp", "Cosmic-Dragon.webp"],
  "cosmic-skeleton-boss": ["Cosmic_Skeleton_Boss_Egg.png.webp", "Cosmic-Skeleton-Boss.webp"],
  "eternal-lunar-dragon": ["Eternal_Lunar_Dragon_Egg.png.webp", "Eternal-Lunar-Dragon.webp"],
  unicorn: ["Unicorn_Egg.png.webp", "Unicorn.webp"],

  crane: ["Crane_Egg.webp", "Crane.webp"],
  salamander: ["Salamander_Egg.webp", "Salamander.webp"],
  "red-panda": ["Red_Panda_Egg.webp", "Red-Panda-1.webp"],
  koi: ["Koi_Egg.webp", "Koi.webp"],
  "snowy-owl": ["Snowy_Owl_Egg.webp", "Snowy-Owl.webp"],
  stag: ["Stag_Egg.webp", "Stag.webp"],
  "oni-tiger": ["Oni_Tiger_Egg.webp", "Oni-Tiger.webp"],
  kitsune: ["Kitsune_Egg.webp", "Kitsune-2.webp"],

  crustacia: ["Crustacia_Egg.webp", "Crustacia.webp"],
  spideron: ["Spideron_Egg.webp", "Spideron.webp"],
  bladehide: ["Bladehide_Egg.webp", "Bladehide.png-e1788531630856.webp"],
  mantaris: ["Mantaris_Egg.webp", "Mantaris.webp"],
  rhinotaur: ["Rhinotaur_Egg.webp", "Rhinotaur.webp"],
  "mutant-shark": ["Mutant_Shark_Egg.webp", "Mutant-Shark.webp"],
  "gorilla-king": ["Gorilla_King_Egg.webp", "Gorilla-King.webp"],
  nightflame: ["Nightflame_Egg.webp", "Nightflame.webp"],
};

const BIOME_ART = {
  forest: "a/a5/Forest_Guardian_Steal_Egg.png",
  lake: "d/dd/Lake_Guardian_Steal_Egg.png",
  desert: "8/84/Desert_Guardian_Steal_Egg.png",
  jungle: "f/f3/Jungle_Guardian_Steal_Egg.png",
  snow: "9/91/Snow_Guardian_Steal_Egg.png",
  volcano: "3/35/Volcano_Guardian_Steal_Egg.png",
  "abyss-ocean": "c/c1/Abyss_Ocean_Guardian_Steal_Egg.png",
  prehistoric: "3/3e/Prehistoric_Guardian_Steal_Egg.png",
  cosmic: "9/9a/Cosmic_Guardian_Steal_Egg.png",
  "cherry-blossom": "8/87/Cherry_Blossom_Guardian_Steal_Egg.png",
  "titan-temple": "1/1e/Titan_Temple_Guardian_Steal_Egg.png",
};


/** Limited pets (Brainrot / Monster / Rift eggs) — art lives on the IGN wiki. */
const LIMITED_ART = {
  "tung-tung-sahur": "b/b0/Tung_Tung_Sahur_Icon.png",
  "bananita-dolphinita": "6/60/Bananita_Dolphinita_Icon.png",
  "belula-beluga": "c/ce/Belula_Beluga_Icon.png",
  "mangolini-parrochini": "7/70/Mangolini_Parrochini_Icon.png",
  "bomboclat-crocolat": "f/f3/Crocolat_Icon.png",
  "strawberry-elephant": "f/fd/Strawberry_Elephant_Steal_Egg.png",

  scorpio: "6/69/Scorpio_Icon.png",
  froggo: "e/ed/Froggo_Icon.png",
  crawler: "3/3f/Crawler_icon.png",
  crocodon: "4/46/Crocodon_Icon.png",
  krakenoid: "c/c6/Krakenoid.png",
  dreadscale: "3/3b/Dreadscale.png",
  "mecha-scorpio": "3/39/Mecha_Scorpion_Icon.png",
  "mecha-froggo": "c/c2/Mecha_Froggo_Icon.png",
  "mecha-crawler": "9/98/Mecha_Crawler_Icon.png",
  "mecha-crocodon": "2/26/Mecha_Crocodon_Icon.png",
  "mecha-krakenoid": "2/23/Mecha_Krakenoid_Icon.png",
  "mecha-dreadscale": "6/6b/Mecha_Dreadscale_Icon.png",

  "rift-eye": "1/15/Rift_Eye_Steal_Egg.png",
  voidmaw: "3/3d/Voidmaw_Steal_Egg.png",
  ventinal: "e/ea/Ventinal_Steal_Egg.png",
  wendigo: "4/4e/Wendigo_Steal_Egg.png",
  "world-eater": "3/3b/World_Eater_Steal_Egg.png",
  "void-angler": "9/9b/Void_Angler_Steal_Egg.png",
  riftwing: "8/88/Riftwing_Steal_Egg.png",
  dreadclaw: "2/2f/Dreadclaw_Steal_Egg.png",
  mawbreaker: "e/ed/Mawbreaker_Steal_Egg.png",
  "void-serpent": "d/d9/Void_Serpent_Steal_Egg.png",
  shardling: "3/38/Shardling_Steal_Egg.png",
  "shattered-ram": "c/c7/Shattered_Ram_Steal_Egg.png",
  shardwing: "c/cb/Shardwing_Steal_Egg.png",
  "shattered-drake": "4/40/Shattered_Drake_Steal_Egg.png",
  "shattered-colossus": "a/ac/Shattered_Colossus_Steal_Egg.png",
};

/** Banner art for the three limited sources. */
const LIMITED_GROUP_ART = {
  monster: "1/18/Monster_Eggs_Steal_an_Egg.png",
  rift: "8/80/The_Rift_Rotation_Steal_Egg.png",
};

const LIMITED_EGG_ART = {
  monster: "1/18/Monster_Eggs_Steal_an_Egg.png",
  rift: "1/1a/Riftborn_Egg.png",
};

const exists = (p) => access(p).then(() => true, () => false);

async function grab(urls, dest) {
  if (await exists(dest)) return "cached";
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA, Referer: new URL(url).origin },
      });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.byteLength < 500) continue;
      await mkdir(dirname(dest), { recursive: true });
      await writeFile(dest, buf);
      return "ok";
    } catch {
      // try the next candidate URL
    }
  }
  return "fail";
}

// eldorado stores some files as Foo.png.webp and others as Foo.webp
const variants = (base, file) => {
  const bare = file.replace(/\.png\.webp$/, ".webp");
  const png = file.endsWith(".png.webp") ? file : file.replace(/\.webp$/, ".png.webp");
  return [...new Set([`${base}/${file}`, `${base}/${bare}`, `${base}/${png}`])];
};

const jobs = [];
for (const [id, [eggFile, petFile]] of Object.entries(ART)) {
  jobs.push(["egg", id, variants(`${ELD}/2026/09`, eggFile), `${ROOT}/public/img/eggs/${id}.webp`]);
  jobs.push(["pet", id, variants(`${ELD}/2026/08`, petFile), `${ROOT}/public/img/pets/${id}.webp`]);
}
for (const [id, path] of Object.entries(BIOME_ART)) {
  jobs.push(["biome", id, [`${IGN}/${path}`], `${ROOT}/public/img/biomes/${id}.png`]);
}
for (const [id, path] of Object.entries(LIMITED_ART)) {
  jobs.push(["limited", id, [`${IGN}/${path}`], `${ROOT}/public/img/limited/${id}.png`]);
}
for (const [id, path] of Object.entries(LIMITED_GROUP_ART)) {
  jobs.push(["group", id, [`${IGN}/${path}`], `${ROOT}/public/img/limited/group-${id}.png`]);
}
for (const [id, path] of Object.entries(LIMITED_EGG_ART)) {
  jobs.push(["egg", id, [`${IGN}/${path}`], `${ROOT}/public/img/limited/egg-${id}.png`]);
}

const failures = [];
let done = 0;
const queue = [...jobs];
await Promise.all(
  Array.from({ length: 8 }, async () => {
    while (queue.length) {
      const [kind, id, urls, dest] = queue.shift();
      if ((await grab(urls, dest)) === "fail") failures.push(`${kind}/${id}`);
      done++;
      if (done % 25 === 0) console.log(`  ${done}/${jobs.length}`);
    }
  })
);

console.log(`\n${jobs.length - failures.length}/${jobs.length} assets ready`);
if (failures.length) {
  console.log("missing:\n  " + failures.join("\n  "));
  process.exitCode = 1;
}
