"use client";

import { useRef } from "react";
import { useCollected } from "./CollectTick";
import { clearAll, replaceAll } from "@/lib/collection";
import { BIOMES, EGGS } from "@/data/steal-an-egg";
import { LIMITED_PETS } from "@/data/limited";

const PER_BIOME = BIOMES.map((b) => ({ biome: b, ids: EGGS.filter((e) => e.biome === b.id).map((e) => e.id) }));

export default function CollectionProgress() {
  const collected = useCollected();
  const fileRef = useRef<HTMLInputElement>(null);

  const total = EGGS.length;
  const have = EGGS.reduce((n, e) => n + (collected.has(e.id) ? 1 : 0), 0);
  const pct = Math.round((have / total) * 100);

  const limitedHave = LIMITED_PETS.reduce((n, p) => n + (collected.has(p.id) ? 1 : 0), 0);

  const exportFile = () => {
    const blob = new Blob([JSON.stringify({ collected: [...collected] }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sweetparadise-eggs.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFile = async (file: File) => {
    try {
      const data: unknown = JSON.parse(await file.text());
      const ids =
        Array.isArray(data) ? data : (data as { collected?: unknown })?.collected;
      if (!Array.isArray(ids)) throw new Error("bad shape");
      const valid = new Set([...EGGS.map((e) => e.id), ...LIMITED_PETS.map((p) => p.id)]);
      replaceAll(ids.filter((v): v is string => typeof v === "string" && valid.has(v)));
    } catch {
      alert("ไฟล์ไม่ถูกต้อง · That file could not be read");
    }
  };

  return (
    <section className="card mb-6 rounded-[22px] p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-ink-3">
            เช็กลิสต์ของฉัน · My checklist
          </p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="num display text-[2.2rem] text-ink">{have}</span>
            <span className="num text-[15px] text-ink-3">/ {total}</span>
            <span className="num ml-1 rounded-full bg-mint-600/12 px-2 py-0.5 text-[12px] font-semibold text-mint-600">
              {pct}%
            </span>
          </p>
          <p className="text-[12.5px] text-ink-3">
            ไข่ตามไบโอม · Biome eggs — กดวงกลม ✓ บนไข่เพื่อบันทึก
          </p>
          <a
            href="#limited"
            className="num mt-2 inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-[12px] font-medium text-ink-2 transition hover:text-ink"
          >
            + เพ็ตลิมิเต็ด {limitedHave}/{LIMITED_PETS.length}
            <span className="text-ink-3">Limited ›</span>
          </a>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={exportFile}
            className="rounded-full bg-surface-3 px-3 py-1.5 text-[12px] font-medium text-ink transition hover:bg-surface-2"
          >
            ส่งออก · Export
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-full bg-surface-3 px-3 py-1.5 text-[12px] font-medium text-ink transition hover:bg-surface-2"
          >
            นำเข้า · Import
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void importFile(f);
              e.target.value = "";
            }}
          />
          {have > 0 && (
            <button
              type="button"
              onClick={() => {
                if (confirm("ล้างเช็กลิสต์ทั้งหมด? · Clear the whole checklist?")) clearAll();
              }}
              className="rounded-full px-3 py-1.5 text-[12px] font-medium text-ink-3 transition hover:text-candy-500"
            >
              ล้าง · Clear
            </button>
          )}
        </div>
      </div>

      {/* overall bar */}
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-3">
        <div
          className="h-full rounded-full bg-mint-600 transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* per-biome */}
      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {PER_BIOME.map(({ biome, ids }) => {
          const n = ids.reduce((acc, id) => acc + (collected.has(id) ? 1 : 0), 0);
          const done = n === ids.length;
          return (
            <li key={biome.id}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-[12px] text-ink-2">
                  {biome.th} <span className="text-ink-3">{biome.en}</span>
                </span>
                <span
                  className={`num shrink-0 text-[11.5px] font-semibold ${done ? "text-mint-600" : "text-ink-3"}`}
                >
                  {done ? "✓ " : ""}
                  {n}/{ids.length}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-3">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{
                    width: `${(n / ids.length) * 100}%`,
                    background: done ? "var(--color-mint-600)" : biome.accent[0],
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
