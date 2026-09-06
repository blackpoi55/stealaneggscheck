"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import CollectTick, { useCollected } from "./CollectTick";
import {
  BIOME_BY_ID,
  RARITY_BY_ID,
  biomeImg,
  cashReward,
  compact,
  eggImg,
  money,
  petImg,
  type Egg,
} from "@/data/steal-an-egg";

function Stat({ th, en, value, hint }: { th: string; en: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl bg-surface-2 px-3.5 py-3">
      <p className="text-[10.5px] text-ink-3">
        {th} · {en}
      </p>
      <p className="num mt-0.5 text-[17px] font-semibold tracking-[-0.02em] text-ink">{value}</p>
      {hint && <p className="text-[10.5px] text-ink-3">{hint}</p>}
    </div>
  );
}

function CollectedToggle({ id, label }: { id: string; label: string }) {
  const collected = useCollected().has(id);
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full py-1 pl-1 pr-3.5 text-[13px] font-medium transition ${
        collected ? "bg-mint-600/12 text-mint-600" : "bg-surface-2 text-ink-2"
      }`}
    >
      <CollectTick id={id} label={label} />
      {collected ? "เก็บแล้ว · Collected" : "ยังไม่เก็บ · Not collected"}
    </span>
  );
}

export default function EggDialog({ egg, onClose }: { egg: Egg | null; onClose: () => void }) {
  useEffect(() => {
    if (!egg) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [egg, onClose]);

  if (!egg) return null;

  const rarity = RARITY_BY_ID[egg.rarity];
  const biome = BIOME_BY_ID[egg.biome];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center overflow-y-auto bg-black/45 p-0 backdrop-blur-md sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${egg.th} / ${egg.en}`}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ ["--c" as string]: rarity.color }}
        className="animate-rise card relative my-auto w-full max-w-xl overflow-hidden rounded-t-[26px] sm:rounded-[26px]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="ปิด / Close"
          className="absolute right-3.5 top-3.5 z-20 grid h-8 w-8 place-items-center rounded-full bg-black/10 text-ink transition hover:bg-black/20 dark:bg-white/12 dark:hover:bg-white/25"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>

        {/* hero: egg → pet */}
        <div
          className="relative flex items-center justify-center gap-4 px-6 pb-7 pt-9"
          style={{
            background:
              "radial-gradient(110% 100% at 50% 0%, color-mix(in oklab, var(--c) 20%, var(--panel-solid)) 0%, var(--panel-solid) 76%)",
          }}
        >
          <div className="relative grid h-32 w-32 place-items-center">
            <span
              aria-hidden
              className="absolute inset-4 rounded-full opacity-70 blur-2xl"
              style={{ background: "color-mix(in oklab, var(--c) 50%, transparent)" }}
            />
            <Image
              src={eggImg(egg.id)}
              alt={`ไข่${egg.th} / ${egg.en} Egg`}
              width={280}
              height={280}
              className="animate-float relative h-28 w-28 object-contain"
            />
          </div>
          <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-ink-3" fill="none" stroke="currentColor" strokeWidth="1.9">
            <path d="M5 12h13m0 0l-5-5m5 5l-5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div
            className="grid h-28 w-28 shrink-0 place-items-center rounded-3xl"
            style={{ background: "color-mix(in oklab, var(--c) 13%, var(--panel-solid))" }}
          >
            <Image
              src={petImg(egg.id)}
              alt={`เพ็ต${egg.th} / ${egg.en} pet`}
              width={192}
              height={192}
              className="h-[5.6rem] w-[5.6rem] object-contain"
            />
          </div>
        </div>

        <div className="border-t rule p-5 sm:p-6">
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

          <h2 className="display mt-2.5 text-[1.75rem] text-ink">ไข่{egg.th}</h2>
          <p className="headline text-[15px] text-ink-2">{egg.en} Egg</p>
          <p className="mt-1.5 text-[12.5px] text-ink-3">
            ฟักออกมาเป็น <span className="text-ink-2">{egg.th}</span> · Hatches into{" "}
            <span className="text-ink-2">{egg.en}</span>
          </p>

          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            <CollectedToggle id={egg.id} label={`${egg.th} / ${egg.en}`} />
            <Link
              href={`/egg/${egg.id}`}
              className="group inline-flex items-center gap-1 rounded-full bg-surface-2 px-4 py-2 text-[13px] font-medium text-ink transition hover:bg-surface-3"
            >
              เปิดหน้าเต็ม · Open page
              <span className="transition-transform group-hover:translate-x-0.5">›</span>
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Stat th="รายได้/วิ" en="Income" value={`${money(egg.income)}/s`} />
            <Stat
              th="โบนัสความเร็ว"
              en="Speed"
              value={egg.speedReward === null ? "—" : `+${compact(egg.speedReward)}`}
              hint={egg.speedReward === null ? "ไม่มีข้อมูล / no data" : "ครั้งแรก / first time"}
            />
            <Stat th="เงินโบนัส" en="Cash" value={money(cashReward(egg))} hint="ครั้งแรก / first time" />
          </div>

          {/* where it lives */}
          <div className="relative mt-3 overflow-hidden rounded-2xl">
            <Image
              src={biomeImg(biome.id)}
              alt={`ไบโอม${biome.th} / ${biome.en} biome`}
              width={1200}
              height={675}
              sizes="(max-width: 640px) 92vw, 560px"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(180deg, ${biome.accent[1]}2e 0%, ${biome.accent[1]}c4 60%, ${biome.accent[1]}f2 100%)`,
              }}
            />
            <div className="relative flex min-h-[8.5rem] flex-col justify-end gap-3 p-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.12em] text-white/70">
                  พบที่ไบโอม · Found in
                </p>
                <p className="headline text-[1.35rem] text-white">{biome.th}</p>
                <p className="text-[12.5px] text-white/70">{biome.en}</p>
              </div>
              <div className="grid shrink-0 grid-cols-2 gap-px overflow-hidden rounded-xl bg-white/20 text-white sm:w-52">
                <div className="bg-black/35 px-2.5 py-2 backdrop-blur-md">
                  <p className="text-[9.5px] uppercase tracking-[0.08em] text-white/60">ผู้พิทักษ์ · Guard</p>
                  <p className="truncate text-[12.5px] font-semibold leading-tight">{biome.guardianTh}</p>
                  <p className="truncate text-[10px] leading-tight text-white/60">{biome.guardianEn}</p>
                </div>
                <div className="bg-black/35 px-2.5 py-2 backdrop-blur-md">
                  <p className="text-[9.5px] uppercase tracking-[0.08em] text-white/60">ความเร็ว · Speed</p>
                  <p className="num truncate text-[12.5px] font-semibold leading-tight">
                    {biome.speed === 0 ? "0" : compact(biome.speed)}
                  </p>
                  <p className="truncate text-[10px] leading-tight text-white/60">
                    {biome.speed === 0 ? "ไม่ต้องใช้" : "ที่แนะนำ / rec."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-3 text-[12.5px] leading-relaxed text-ink-3">
            {biome.noteTh}
            <br />
            {biome.noteEn}
          </p>
        </div>
      </div>
    </div>
  );
}
