"use client";

import Image from "next/image";
import { useCollected } from "./CollectTick";
import { biomeImg, compact, money, type Biome, type Egg } from "@/data/steal-an-egg";

export default function BiomeBanner({ biome, eggs }: { biome: Biome; eggs: Egg[] }) {
  const best = eggs.reduce<Egg | null>((a, b) => (!a || b.income > a.income ? b : a), null);
  const collected = useCollected();
  const have = eggs.reduce((n, e) => n + (collected.has(e.id) ? 1 : 0), 0);

  return (
    <div className="relative overflow-hidden rounded-[22px]">
      <Image
        src={biomeImg(biome.id)}
        alt={`ไบโอม${biome.th} / ${biome.en} biome`}
        width={1600}
        height={900}
        sizes="(max-width: 1024px) 100vw, 1240px"
        className="absolute inset-0 h-full w-full object-cover"
        priority={biome.order === 1}
      />
      {/* image stays legible under the type without washing the scene out */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${biome.accent[1]}26 0%, ${biome.accent[1]}b8 62%, ${biome.accent[1]}f0 100%)`,
        }}
      />

      <div className="relative flex min-h-[15rem] flex-col justify-end gap-6 p-5 sm:min-h-[17rem] sm:flex-row sm:items-end sm:justify-between sm:p-7">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="num text-[11px] font-medium uppercase tracking-[0.14em] text-white/70">
              ไบโอมที่ {biome.order} · Biome {biome.order}
            </p>
            <span
              className={`num rounded-full px-2 py-[2px] text-[11px] font-semibold backdrop-blur-md ${
                have === eggs.length ? "bg-mint-600 text-white" : "bg-black/35 text-white/85"
              }`}
            >
              {have === eggs.length ? "✓ " : ""}
              เก็บแล้ว {have}/{eggs.length}
            </span>
          </div>
          <h2 className="display mt-1.5 text-[2rem] text-white sm:text-[2.6rem]">{biome.th}</h2>
          <p className="headline text-[15px] text-white/70 sm:text-[17px]">{biome.en}</p>
          <p className="mt-3 max-w-lg text-[13px] leading-relaxed text-white/80">
            {biome.noteTh}
            <br />
            <span className="text-white/60">{biome.noteEn}</span>
          </p>
        </div>

        <dl className="grid shrink-0 grid-cols-3 gap-px overflow-hidden rounded-2xl bg-white/20 text-white sm:w-[24rem]">
          {[
            { th: "ผู้พิทักษ์", en: "Guardian", value: biome.guardianTh, sub: biome.guardianEn },
            {
              th: "ความเร็ว",
              en: "Speed",
              value: biome.speed === 0 ? "0" : compact(biome.speed),
              sub: biome.speed === 0 ? "ไม่ต้องใช้ / none" : "ที่แนะนำ / rec.",
            },
            {
              th: "รายได้สูงสุด",
              en: "Top pet",
              value: best ? `${money(best.income)}/s` : "—",
              sub: best?.en ?? "",
            },
          ].map((s) => (
            <div key={s.en} className="bg-black/35 px-3 py-2.5 backdrop-blur-md">
              <dt className="text-[9.5px] uppercase tracking-[0.08em] text-white/60">
                {s.th} · {s.en}
              </dt>
              <dd className="num mt-1 truncate text-[13.5px] font-semibold leading-tight">{s.value}</dd>
              <dd className="truncate text-[10.5px] leading-tight text-white/60">{s.sub}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
