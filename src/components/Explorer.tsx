"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import BiomeBanner from "./BiomeBanner";
import CollectionProgress from "./CollectionProgress";
import { useCollected } from "./CollectTick";
import EggCard from "./EggCard";
import EggDialog from "./EggDialog";
import { BROWSE_ANCHOR, biomeAnchor, useBrowse, type OwnedFilter, type SortId } from "./browse-context";
import { BIOMES, BIOME_BY_ID, EGGS, RARITIES, RARITY_BY_ID, type Egg } from "@/data/steal-an-egg";

const OWNED: { id: OwnedFilter; th: string; en: string }[] = [
  { id: "all", th: "ทั้งหมด", en: "All" },
  { id: "collected", th: "เก็บแล้ว", en: "Collected" },
  { id: "missing", th: "ยังไม่เก็บ", en: "Missing" },
];

const SORTS: { id: SortId; th: string; en: string }[] = [
  { id: "biome", th: "ตามไบโอม", en: "By biome" },
  { id: "rarity", th: "ระดับหายาก", en: "Rarity" },
  { id: "income-desc", th: "รายได้มาก→น้อย", en: "Income high→low" },
  { id: "income-asc", th: "รายได้น้อย→มาก", en: "Income low→high" },
  { id: "name", th: "ชื่อ A→Z", en: "Name A→Z" },
];

export default function Explorer() {
  const { query, setQuery, rarities, toggleRarity, sort, setSort, owned, setOwned, dirty, reset } =
    useBrowse();
  const collected = useCollected();
  const [selected, setSelected] = useState<Egg | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  // Publish the filter bar height so biome anchors land below it, not under it.
  useEffect(() => {
    const el = filterRef.current;
    if (!el) return;
    const publish = () =>
      document.documentElement.style.setProperty("--filter-h", `${Math.round(el.offsetHeight)}px`);
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = EGGS.filter((egg) => {
      if (rarities.length && !rarities.includes(egg.rarity)) return false;
      if (owned !== "all" && collected.has(egg.id) !== (owned === "collected")) return false;
      if (!q) return true;
      const b = BIOME_BY_ID[egg.biome];
      const r = RARITY_BY_ID[egg.rarity];
      return [egg.en, egg.th, b.en, b.th, r.en, r.th, b.guardianEn, b.guardianTh]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });

    switch (sort) {
      case "rarity":
        return list.sort(
          (a, b) => RARITY_BY_ID[b.rarity].tier - RARITY_BY_ID[a.rarity].tier || b.income - a.income
        );
      case "income-desc":
        return list.sort((a, b) => b.income - a.income);
      case "income-asc":
        return list.sort((a, b) => a.income - b.income);
      case "name":
        return list.sort((a, b) => a.en.localeCompare(b.en));
      default:
        return list.sort(
          (a, b) =>
            BIOME_BY_ID[a.biome].order - BIOME_BY_ID[b.biome].order ||
            RARITY_BY_ID[a.rarity].tier - RARITY_BY_ID[b.rarity].tier
        );
    }
  }, [query, rarities, sort, owned, collected]);

  const groups = useMemo(
    () =>
      BIOMES.map((b) => ({ biome: b, eggs: filtered.filter((e) => e.biome === b.id) })).filter(
        (g) => g.eggs.length > 0
      ),
    [filtered]
  );

  const grouped = sort === "biome";

  return (
    <section id={BROWSE_ANCHOR}>
      <CollectionProgress />

      {/* ── filter bar — parks itself right under the nav ───────────────── */}
      <div
        ref={filterRef}
        className="card sticky z-30 mb-8 rounded-2xl p-2.5"
        style={{ top: "calc(var(--nav-h, 7rem) + 0.5rem)" }}
      >
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <span className="sr-only">ค้นหาไข่ / Search eggs</span>
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาไข่ เพ็ต หรือไบโอม · Search egg, pet or biome…"
              className="w-full rounded-xl bg-surface-2 py-2.5 pl-10 pr-4 text-[13.5px] text-ink outline-none transition placeholder:text-ink-3 focus:ring-2 focus:ring-candy-500"
            />
          </label>

          <div className="flex items-center gap-2">
            <label className="relative flex-1 lg:flex-none">
              <span className="sr-only">เรียงลำดับ / Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortId)}
                className="w-full appearance-none rounded-xl bg-surface-2 py-2.5 pl-3.5 pr-9 text-[13px] font-medium text-ink outline-none transition focus:ring-2 focus:ring-candy-500"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.th} · {s.en}
                  </option>
                ))}
              </select>
              <svg
                viewBox="0 0 24 24"
                className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </label>

            {dirty && (
              <button
                type="button"
                onClick={reset}
                className="shrink-0 rounded-xl bg-surface-3 px-3.5 py-2.5 text-[12.5px] font-medium text-ink transition hover:bg-candy-500 hover:text-white"
              >
                ล้าง · Reset
              </button>
            )}
          </div>
        </div>

        {/* rarity + checklist chips */}
        <div className="-mx-2.5 mt-2.5 overflow-x-auto px-2.5 no-scrollbar">
          <div className="flex min-w-max items-center gap-1.5">
            <span className="mr-1 text-[11px] text-ink-3">เช็กลิสต์ · Owned</span>
            {OWNED.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setOwned(o.id)}
                aria-pressed={owned === o.id}
                className={`rounded-full px-2.5 py-1 text-[11.5px] font-medium transition ${
                  owned === o.id
                    ? "bg-mint-600 text-white"
                    : "bg-surface-2 text-ink-2 hover:text-ink"
                }`}
              >
                {o.th} <span className="opacity-60">{o.en}</span>
              </button>
            ))}
            <span className="mx-2 h-4 w-px shrink-0 bg-[var(--hairline)]" />
            <span className="mr-1 text-[11px] text-ink-3">ระดับ · Rarity</span>
            {RARITIES.map((r) => {
              const on = rarities.includes(r.id);
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => toggleRarity(r.id)}
                  aria-pressed={on}
                  className="rounded-full px-2.5 py-1 text-[11.5px] font-medium transition"
                  style={{
                    color: on ? "#fff" : r.color,
                    background: on ? r.color : `color-mix(in oklab, ${r.color} 11%, var(--panel-solid))`,
                    boxShadow: on
                      ? "none"
                      : `inset 0 0 0 1px color-mix(in oklab, ${r.color} 26%, transparent)`,
                  }}
                >
                  {r.th} <span className="opacity-60">{r.en}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <p className="mb-5 text-[13px] text-ink-3">
        พบ <span className="num font-semibold text-ink">{filtered.length}</span> ใบ ·{" "}
        <span className="num font-semibold text-ink">{filtered.length}</span> eggs
      </p>

      {filtered.length === 0 ? (
        <div className="card rounded-[22px] px-6 py-20 text-center">
          <p className="text-4xl">🍬</p>
          <p className="headline mt-3 text-[17px] text-ink">ไม่พบไข่ที่ตรงกับตัวกรอง</p>
          <p className="text-[13.5px] text-ink-3">No eggs match these filters</p>
          <button
            type="button"
            onClick={reset}
            className="mt-5 rounded-full bg-candy-500 px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-candy-600"
          >
            ล้างตัวกรอง · Reset filters
          </button>
        </div>
      ) : grouped ? (
        <div className="space-y-14">
          {groups.map(({ biome: b, eggs }) => (
            <section
              key={b.id}
              id={biomeAnchor(b.id)}
              // html's scroll-padding already clears the nav; clear the filter bar too
              style={{ scrollMarginTop: "calc(var(--filter-h, 6.5rem) + 1rem)" }}
            >
              <BiomeBanner biome={b} eggs={eggs} />
              <div className="mt-5 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
                {eggs.map((egg) => (
                  <EggCard key={egg.id} egg={egg} onOpen={setSelected} showBiome={false} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((egg) => (
            <EggCard key={egg.id} egg={egg} onOpen={setSelected} />
          ))}
        </div>
      )}

      <EggDialog egg={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
