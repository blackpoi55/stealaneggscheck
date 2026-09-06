import Image from "next/image";
import Comments from "@/components/Comments";
import Explorer from "@/components/Explorer";
import InstallGuide from "@/components/InstallGuide";
import LimitedSection from "@/components/LimitedSection";
import Logo from "@/components/Logo";
import SiteNav from "@/components/SiteNav";
import VisitorCounter from "@/components/VisitorCounter";
import { BrowseProvider } from "@/components/browse-context";
import { LIMITED_PETS } from "@/data/limited";
import { BIOMES, EGGS, RARITY_BY_ID, SITE, eggImg, money } from "@/data/steal-an-egg";

/** The three Divine eggs carry the hero — the rarest art in the game. */
const SHOWCASE = ["kitsune", "nightflame", "unicorn"]
  .map((id) => EGGS.find((e) => e.id === id)!)
  .filter(Boolean);

export default function Home() {
  const stats = [
    { value: String(BIOMES.length), th: "ไบโอม", en: "Biomes" },
    { value: String(EGGS.length), th: "ไข่ตามไบโอม", en: "Biome eggs" },
    { value: String(LIMITED_PETS.length), th: "เพ็ตลิมิเต็ด", en: "Limited" },
        { value: money(Math.max(...EGGS.map((e) => e.income))) + "/s", th: "รายได้สูงสุด", en: "Top income" },
  ];

  return (
    <BrowseProvider>
      <SiteNav />

      {/* ── hero ──────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1320px] px-4 pb-4 pt-16 text-center sm:px-6 sm:pt-24">
        <a
          href={SITE.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex max-w-full items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-[12px] text-ink-2 hairline transition hover:text-ink"
        >
          <Logo className="h-4 w-4 rounded-full" px={48} />
          <span className="truncate">{SITE.creditTh}</span>
          <span className="hidden shrink-0 text-ink-3 sm:inline">· {SITE.creditEn}</span>
        </a>

        <h1 className="display mx-auto mt-6 max-w-4xl text-[2.6rem] text-ink sm:text-[4.2rem]">
          ไข่ไหน อยู่
          <span className="prismatic bg-clip-text text-transparent"> ไบโอมไหน</span>
        </h1>
        <p className="headline mx-auto mt-2 max-w-3xl text-[1.15rem] text-ink-2 sm:text-[1.9rem]">
          Which egg lives in which biome?
        </p>

        <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-relaxed text-ink-2 sm:text-[17px]">
          ไข่ครบทั้ง {EGGS.length} ใบใน Steal an Egg จัดเรียงตามไบโอม พร้อมรูปไข่จริง เพ็ตจริง
          ระดับความหายาก รายได้ต่อวินาที และความเร็วที่ต้องใช้หนีผู้พิทักษ์
          <span className="mt-1.5 block text-ink-3">
            All {EGGS.length} Steal an Egg eggs, grouped by biome — real egg and pet art, rarity, income per
            second, and the speed you need to outrun each guardian.
          </span>
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href={SITE.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-candy-500 px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-candy-600"
          >
            วาร์ปเข้าแมพ SweetParadise
          </a>
          <a
            href="#browse"
            className="group inline-flex items-center gap-1 rounded-full px-4 py-3 text-[15px] font-medium text-candy-500 transition hover:text-candy-600"
          >
            ดูไข่ทั้งหมด · Browse all eggs
            <span className="transition-transform group-hover:translate-x-0.5">›</span>
          </a>
          <a
            href="#install"
            className="group inline-flex items-center gap-1 rounded-full px-4 py-3 text-[15px] font-medium text-ink-2 transition hover:text-ink"
          >
            ติดตั้งเป็นแอป · Install app
            <span className="transition-transform group-hover:translate-x-0.5">›</span>
          </a>
        </div>

        {/* showcase */}
        <div className="mt-12 flex items-end justify-center gap-2 sm:gap-10">
          {SHOWCASE.map((egg, i) => (
            <figure key={egg.id} className="relative flex flex-col items-center">
              <span
                aria-hidden
                className="absolute bottom-10 h-24 w-24 rounded-full opacity-60 blur-2xl sm:h-32 sm:w-32"
                style={{
                  background: `color-mix(in oklab, ${RARITY_BY_ID[egg.rarity].color} 45%, transparent)`,
                }}
              />
              <Image
                src={eggImg(egg.id)}
                alt={`ไข่${egg.th} / ${egg.en} Egg`}
                width={320}
                height={320}
                priority={i === 0}
                className="animate-float relative h-24 w-24 object-contain sm:h-36 sm:w-36"
                style={{ animationDelay: `${i * 0.8}s` }}
              />
              <figcaption className="mt-2 text-[11.5px] text-ink-3 sm:text-[13px]">
                <span className="block font-medium text-ink-2">{egg.th}</span>
                {egg.en}
              </figcaption>
            </figure>
          ))}
        </div>

        {/* stats strip */}
        <dl className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-[20px] bg-[var(--hairline)] sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.en} className="bg-surface px-4 py-5">
              <dd className="num display text-[1.9rem] text-ink">{s.value}</dd>
              <dt className="mt-1 text-[12.5px] text-ink-2">{s.th}</dt>
              <dt className="text-[11px] text-ink-3">{s.en}</dt>
            </div>
          ))}
        </dl>
      </section>

      {/* ── browse ────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-[1320px] px-4 pb-24 pt-14 sm:px-6">
        <Explorer />
      </main>

      {/* ── limited eggs ──────────────────────────────────────────────── */}
      <LimitedSection />

      {/* ── install as an app ─────────────────────────────────────────── */}
      <div className="border-t rule">
        <InstallGuide />
      </div>

      {/* ── feedback (renders nothing when there is no database) ───────── */}
      <Comments />

      {/* ── footer ────────────────────────────────────────────────────── */}
      <footer className="border-t rule">
        <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <Logo className="h-10 w-10 rounded-2xl" px={128} />
              <div>
                <p className="headline text-[16px] text-ink">{SITE.creditTh}</p>
                <p className="text-[12.5px] text-ink-3">{SITE.creditEn}</p>
                <div className="mt-2">
                  <VisitorCounter />
                </div>
              </div>
            </div>
            <a
              href={SITE.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-candy-500 px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-candy-600"
            >
              วาร์ปเข้าแมพ · Play on Roblox
            </a>
          </div>

          <p className="mt-8 max-w-4xl text-[11.5px] leading-relaxed text-ink-3">
            ข้อมูลและรูปภาพอ้างอิงจาก · Data and artwork sourced from{" "}
            <a
              className="text-ink-2 underline-offset-2 hover:underline"
              href="https://www.eldorado.gg/blog/steal-an-egg/steal-an-egg-eggs-list/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Eldorado — Eggs List
            </a>
            ,{" "}
            <a
              className="text-ink-2 underline-offset-2 hover:underline"
              href="https://www.eldorado.gg/blog/steal-an-egg/steal-an-egg-all-pets-index/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Eldorado — All Pets Index
            </a>{" "}
            และ{" "}
            <a
              className="text-ink-2 underline-offset-2 hover:underline"
              href="https://www.ign.com/wikis/steal-an-egg-roblox/All_Biomes"
              target="_blank"
              rel="noopener noreferrer"
            >
              IGN Wiki — All Biomes
            </a>
            . Steal an Egg และ Roblox เป็นเครื่องหมายการค้าของเจ้าของลิขสิทธิ์ · Steal an Egg and Roblox are
            trademarks of their respective owners. เว็บนี้เป็นแฟนไซต์ ไม่ได้สังกัดผู้พัฒนาเกม · Unofficial fan
            site.
          </p>
        </div>
      </footer>
    </BrowseProvider>
  );
}
