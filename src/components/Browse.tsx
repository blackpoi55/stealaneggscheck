"use client";

import Explorer from "./Explorer";
import LimitedSection from "./LimitedSection";
import { useBrowse, type TabId } from "./browse-context";
import { EGGS } from "@/data/steal-an-egg";
import { LIMITED_PETS } from "@/data/limited";

const TABS: { id: TabId; th: string; en: string; count: number }[] = [
  { id: "biome", th: "ไข่ตามไบโอม", en: "Biome eggs", count: EGGS.length },
  { id: "limited", th: "ลิมิเต็ด", en: "Limited", count: LIMITED_PETS.length },
];

export default function Browse() {
  const { tab, setTab } = useBrowse();

  return (
    <>
      <div
        role="tablist"
        aria-label="ประเภทไข่ / Egg type"
        className="mx-auto mb-8 flex w-full max-w-md gap-1 rounded-2xl bg-surface-2 p-1"
      >
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={`flex-1 rounded-xl px-3 py-2.5 text-center transition ${
                active ? "card text-ink" : "text-ink-2 hover:text-ink"
              }`}
            >
              <span className="headline block text-[14.5px]">
                {t.th} <span className="num opacity-55">{t.count}</span>
              </span>
              <span className="block text-[11px] text-ink-3">{t.en}</span>
            </button>
          );
        })}
      </div>

      {tab === "biome" ? <Explorer /> : <LimitedSection />}
    </>
  );
}
