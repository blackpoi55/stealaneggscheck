"use client";

import Image from "next/image";
import Link from "next/link";
import CollectTick, { useCollected } from "./CollectTick";
import SideBadge from "./SideBadge";
import {
  BIOME_BY_ID,
  RARITY_BY_ID,
  compact,
  eggImg,
  money,
  petImg,
  type Egg,
} from "@/data/steal-an-egg";

export default function EggCard({
  egg,
  onOpen,
  showBiome = true,
}: {
  egg: Egg;
  onOpen: (egg: Egg) => void;
  showBiome?: boolean;
}) {
  const rarity = RARITY_BY_ID[egg.rarity];
  const biome = BIOME_BY_ID[egg.biome];
  const collected = useCollected().has(egg.id);

  return (
    <div
      style={{ ["--c" as string]: rarity.color }}
      className={`card group relative flex flex-col overflow-hidden rounded-[18px] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[var(--card-shadow-hover)] has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-candy-500 ${
        collected ? "ring-1 ring-mint-600/60" : ""
      }`}
    >
      {/* stage — a quiet tinted field so pale eggs still read */}
      <div
        className="relative flex h-[9.5rem] items-center justify-center overflow-hidden"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 0%, color-mix(in oklab, var(--c) 15%, var(--panel-solid)) 0%, var(--panel-solid) 78%)",
        }}
      >
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 h-[5.8rem] w-[5.8rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-xl transition-transform duration-500 group-hover:scale-125"
          style={{ background: "color-mix(in oklab, var(--c) 40%, transparent)" }}
        />
        <Image
          src={eggImg(egg.id)}
          alt={`ไข่${egg.th} / ${egg.en} Egg`}
          width={220}
          height={220}
          sizes="220px"
          className="relative h-[7.4rem] w-auto object-contain transition-transform duration-500 ease-out group-hover:-translate-y-1 group-hover:scale-[1.06]"
        />

        <span
          className={`absolute left-3 top-3 rounded-full px-2 py-[3px] text-[10px] font-semibold tracking-[-0.005em] ${
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
          {rarity.en}
        </span>

        <SideBadge side={egg.side} className="absolute bottom-2.5 left-3" />

        {/* sits above the stretched link */}
        <CollectTick id={egg.id} label={`${egg.th} / ${egg.en}`} className="absolute right-2.5 top-2.5 z-20" />
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col gap-3 border-t rule p-3.5">
        <div className="flex items-start gap-2.5">
          <span
            className="grid h-[4.5rem] w-[4.5rem] shrink-0 place-items-center rounded-2xl"
            style={{ background: "color-mix(in oklab, var(--c) 12%, var(--panel-solid))" }}
          >
            <Image
              src={petImg(egg.id)}
              alt={`เพ็ต${egg.th} / ${egg.en} pet`}
              width={128}
              height={128}
              sizes="128px"
              className="h-14 w-14 object-contain"
            />
          </span>
          <span className="min-w-0 flex-1 self-center">
            {/* a real link so the egg page is crawlable and middle-clickable,
                intercepted into the quick-view dialog for plain clicks */}
            <Link
              href={`/egg/${egg.id}`}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                e.preventDefault();
                onOpen(egg);
              }}
              className="headline block truncate text-[14.5px] text-ink outline-none after:absolute after:inset-0 after:content-['']"
            >
              {egg.th}
            </Link>
            <span className="block truncate text-[12px] text-ink-3">{egg.en}</span>
          </span>
        </div>

        {showBiome && (
          <span className="flex items-center gap-1.5 text-[11.5px] text-ink-2">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: biome.accent[0] }} />
            <span className="truncate">
              {biome.th} <span className="text-ink-3">· {biome.en}</span>
            </span>
          </span>
        )}

        <dl className="mt-auto grid grid-cols-2 gap-x-3 border-t rule pt-2.5">
          <div>
            {/* no middot here — the pair wraps to two lines on narrow cards */}
            <dt className="text-[10px] leading-tight text-ink-3">รายได้ Income</dt>
            <dd className="num text-[13.5px] font-semibold text-ink">{money(egg.income)}/s</dd>
          </div>
          <div className="text-right">
            <dt className="text-[10px] leading-tight text-ink-3">ความเร็ว Speed</dt>
            <dd className="num text-[13.5px] font-semibold text-ink">
              {egg.speedReward === null ? "—" : `+${compact(egg.speedReward)}`}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
