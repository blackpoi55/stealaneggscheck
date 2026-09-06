import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import CollectTick from "@/components/CollectTick";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import {
  BIOME_BY_ID,
  EGGS,
  RARITY_BY_ID,
  SITE,
  biomeImg,
  cashReward,
  compact,
  eggImg,
  money,
  petImg,
} from "@/data/steal-an-egg";
import { absolute } from "@/lib/site";

export function generateStaticParams() {
  return EGGS.map((e) => ({ id: e.id }));
}

const find = (id: string) => EGGS.find((e) => e.id === id);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const egg = find(id);
  if (!egg) return {};

  const biome = BIOME_BY_ID[egg.biome];
  const rarity = RARITY_BY_ID[egg.rarity];
  const title = `ไข่${egg.th} · ${egg.en} Egg — ไบโอม${biome.th} / ${biome.en}`;
  const description = `ไข่${egg.th} (${egg.en} Egg) อยู่ไบโอม${biome.th} ระดับ ${rarity.en} รายได้ ${money(egg.income)}/วินาที ผู้พิทักษ์คือ${biome.guardianTh} · Found in the ${biome.en} biome, ${rarity.en} tier, ${money(egg.income)}/s, guarded by the ${biome.guardianEn}.`;

  return {
    title,
    description,
    alternates: { canonical: `/egg/${egg.id}` },
    openGraph: { title, description, type: "article", url: absolute(`/egg/${egg.id}`) },
  };
}

export default async function EggPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const egg = find(id);
  if (!egg) notFound();

  const biome = BIOME_BY_ID[egg.biome];
  const rarity = RARITY_BY_ID[egg.rarity];
  const siblings = EGGS.filter((e) => e.biome === egg.biome && e.id !== egg.id);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "ไข่ทั้งหมด · All eggs", item: absolute("/") },
          {
            "@type": "ListItem",
            position: 2,
            name: `${biome.th} · ${biome.en}`,
            item: absolute(`/#biome-${biome.id}`),
          },
          { "@type": "ListItem", position: 3, name: `${egg.th} · ${egg.en} Egg` },
        ],
      },
      {
        "@type": "Thing",
        name: `${egg.en} Egg`,
        alternateName: `ไข่${egg.th}`,
        image: absolute(eggImg(egg.id)),
        description: `${rarity.en} egg from the ${biome.en} biome in Steal an Egg. Hatches ${egg.en} at ${money(egg.income)} per second.`,
        url: absolute(`/egg/${egg.id}`),
      },
    ],
  };

  return (
    <div style={{ ["--c" as string]: rarity.color }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* slim header — the full biome nav belongs to the index page */}
      <header className="sticky top-0 z-50 panel border-b rule">
        <div className="mx-auto flex h-12 max-w-[1000px] items-center gap-3 px-4 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <Logo className="h-6 w-6 rounded-[7px]" />
            <span className="truncate text-[13.5px] font-semibold tracking-[-0.01em] text-ink">
              SweetParadise
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-1">
            <a
              href={SITE.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-full bg-candy-500 px-3.5 py-1.5 text-[12.5px] font-semibold text-white transition hover:bg-candy-600 sm:block"
            >
              วาร์ปเข้าแมพ · Play
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1000px] px-4 pb-20 pt-8 sm:px-6">
        <nav aria-label="breadcrumb" className="text-[12.5px] text-ink-3">
          <Link href="/" className="hover:text-ink">
            ไข่ทั้งหมด · All eggs
          </Link>
          <span className="mx-1.5">›</span>
          <Link href={`/#biome-${biome.id}`} className="hover:text-ink">
            {biome.th} · {biome.en}
          </Link>
        </nav>

        <div className="mt-5 grid gap-6 md:grid-cols-[minmax(0,20rem)_1fr]">
          {/* art */}
          <div
            className="card relative grid place-items-center overflow-hidden rounded-[26px] py-10"
            style={{
              background:
                "radial-gradient(110% 90% at 50% 0%, color-mix(in oklab, var(--c) 20%, var(--panel-solid)) 0%, var(--panel-solid) 76%)",
            }}
          >
            <span
              aria-hidden
              className="absolute h-40 w-40 rounded-full opacity-60 blur-3xl"
              style={{ background: "color-mix(in oklab, var(--c) 55%, transparent)" }}
            />
            <Image
              src={eggImg(egg.id)}
              alt={`ไข่${egg.th} / ${egg.en} Egg`}
              width={420}
              height={420}
              priority
              className="animate-float relative h-44 w-44 object-contain"
            />
          </div>

          {/* facts */}
          <div>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                egg.rarity === "divine" ? "prismatic text-black/80" : ""
              }`}
              style={
                egg.rarity === "divine"
                  ? undefined
                  : {
                      color: "var(--c)",
                      background: "color-mix(in oklab, var(--c) 12%, var(--panel-solid))",
                      boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--c) 28%, transparent)",
                    }
              }
            >
              {rarity.th} · {rarity.en}
            </span>

            <h1 className="display mt-2.5 text-[2.2rem] text-ink sm:text-[2.8rem]">ไข่{egg.th}</h1>
            <p className="headline text-[17px] text-ink-2">{egg.en} Egg</p>

            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-surface-2 p-3">
              <span
                className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl"
                style={{ background: "color-mix(in oklab, var(--c) 13%, var(--panel-solid))" }}
              >
                <Image
                  src={petImg(egg.id)}
                  alt={`เพ็ต${egg.th} / ${egg.en} pet`}
                  width={192}
                  height={192}
                  className="h-16 w-16 object-contain"
                />
              </span>
              <span>
                <span className="block text-[11px] text-ink-3">ฟักออกมาเป็น · Hatches into</span>
                <span className="headline block text-[16px] text-ink">{egg.th}</span>
                <span className="block text-[12.5px] text-ink-3">{egg.en}</span>
              </span>
              <span className="ml-auto flex items-center gap-2 pr-1">
                <CollectTick id={egg.id} label={`${egg.th} / ${egg.en}`} size="lg" />
              </span>
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[
                { th: "รายได้/วิ", en: "Income", value: `${money(egg.income)}/s` },
                {
                  th: "โบนัสความเร็ว",
                  en: "Speed",
                  value: egg.speedReward === null ? "—" : `+${compact(egg.speedReward)}`,
                  hint: egg.speedReward === null ? "ไม่มีข้อมูล / no data" : "ครั้งแรก / first time",
                },
                {
                  th: "เงินโบนัส",
                  en: "Cash",
                  value: money(cashReward(egg)),
                  hint: "ครั้งแรก / first time",
                },
              ].map((s) => (
                <div key={s.en} className="rounded-2xl bg-surface-2 px-3.5 py-3">
                  <dt className="text-[10.5px] text-ink-3">
                    {s.th} · {s.en}
                  </dt>
                  <dd className="num mt-0.5 text-[17px] font-semibold tracking-[-0.02em] text-ink">
                    {s.value}
                  </dd>
                  {s.hint && <dd className="text-[10.5px] text-ink-3">{s.hint}</dd>}
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* biome */}
        <Link
          href={`/#biome-${biome.id}`}
          className="relative mt-6 block overflow-hidden rounded-[22px] transition hover:opacity-95"
        >
          <Image
            src={biomeImg(biome.id)}
            alt={`ไบโอม${biome.th} / ${biome.en} biome`}
            width={1600}
            height={900}
            sizes="(max-width: 1024px) 100vw, 1000px"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, ${biome.accent[1]}26 0%, ${biome.accent[1]}bb 60%, ${biome.accent[1]}f2 100%)`,
            }}
          />
          <div className="relative flex min-h-[13rem] flex-col justify-end gap-4 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
            <div>
              <p className="text-[10.5px] uppercase tracking-[0.12em] text-white/70">
                พบที่ไบโอม · Found in
              </p>
              <p className="display text-[1.9rem] text-white">{biome.th}</p>
              <p className="headline text-[14px] text-white/75">{biome.en}</p>
              <p className="mt-2 max-w-lg text-[12.5px] leading-relaxed text-white/80">
                {biome.noteTh}
                <br />
                <span className="text-white/60">{biome.noteEn}</span>
              </p>
            </div>
            <dl className="grid shrink-0 grid-cols-2 gap-px overflow-hidden rounded-xl bg-white/20 text-white sm:w-56">
              <div className="bg-black/35 px-2.5 py-2 backdrop-blur-md">
                <dt className="text-[9.5px] uppercase tracking-[0.08em] text-white/60">
                  ผู้พิทักษ์ · Guard
                </dt>
                <dd className="truncate text-[12.5px] font-semibold leading-tight">{biome.guardianTh}</dd>
                <dd className="truncate text-[10px] leading-tight text-white/60">{biome.guardianEn}</dd>
              </div>
              <div className="bg-black/35 px-2.5 py-2 backdrop-blur-md">
                <dt className="text-[9.5px] uppercase tracking-[0.08em] text-white/60">
                  ความเร็ว · Speed
                </dt>
                <dd className="num text-[12.5px] font-semibold leading-tight">
                  {biome.speed === 0 ? "0" : compact(biome.speed)}
                </dd>
                <dd className="truncate text-[10px] leading-tight text-white/60">
                  {biome.speed === 0 ? "ไม่ต้องใช้" : "ที่แนะนำ / rec."}
                </dd>
              </div>
            </dl>
          </div>
        </Link>

        {/* siblings */}
        <h2 className="headline mt-10 text-[18px] text-ink">
          ไข่อื่นในไบโอม{biome.th} <span className="text-ink-3">· More {biome.en} eggs</span>
        </h2>
        <ul className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
          {siblings.map((s) => {
            const r = RARITY_BY_ID[s.rarity];
            return (
              <li key={s.id}>
                <Link
                  href={`/egg/${s.id}`}
                  className="card flex flex-col items-center gap-1.5 rounded-2xl p-3 transition hover:-translate-y-0.5 hover:shadow-[var(--card-shadow-hover)]"
                  style={{ ["--c" as string]: r.color }}
                >
                  <Image
                    src={eggImg(s.id)}
                    alt=""
                    width={160}
                    height={160}
                    sizes="160px"
                    className="h-[4.6rem] w-[4.6rem] object-contain"
                  />
                  <span className="w-full truncate text-center text-[12px] font-medium text-ink">
                    {s.th}
                  </span>
                  <span className="w-full truncate text-center text-[10.5px] text-ink-3">{s.en}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-surface-3 px-5 py-2.5 text-[14px] font-medium text-ink transition hover:bg-surface-2"
          >
            ‹ ดูไข่ทั้งหมด · All eggs
          </Link>
          <a
            href={SITE.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-candy-500 px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-candy-600"
          >
            วาร์ปเข้าแมพ SweetParadise
          </a>
        </div>
      </main>
    </div>
  );
}
