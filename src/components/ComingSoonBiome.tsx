"use client";

import type { UpcomingBiome } from "@/data/upcoming";

/**
 * A biome the game has but the guides do not. Shown so the site admits the
 * gap instead of silently looking out of date, with the names that are already
 * visible in the index and blanks where the numbers would go.
 */
export default function ComingSoonBiome({ biome }: { biome: UpcomingBiome }) {
  const slots = [
    ...biome.known.map((pet) => ({ ...pet, known: true })),
    ...Array.from({ length: biome.unknown }, () => ({ en: "???", th: "???", known: false })),
  ];

  return (
    <section id={`biome-${biome.id}`} style={{ scrollMarginTop: "calc(var(--filter-h, 6.5rem) + 1rem)" }}>
      <div className="relative overflow-hidden rounded-[22px]">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `linear-gradient(100deg, ${biome.accent[0]} 0%, ${biome.accent[0]}cc 38%, ${biome.accent[1]}dd 62%, ${biome.accent[1]} 100%)`,
          }}
        />
        {/* a soft seam where heaven meets hell, in place of the missing art */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 100% at 50% 50%, rgba(255,255,255,.35), transparent 60%), radial-gradient(90% 60% at 50% 120%, rgba(0,0,0,.45), transparent 70%)",
          }}
        />

        <div className="relative flex min-h-[13rem] flex-col justify-end gap-5 p-5 sm:min-h-[15rem] sm:flex-row sm:items-end sm:justify-between sm:p-7">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="num text-[11px] font-medium uppercase tracking-[0.14em] text-white/75">
                ไบโอมที่ {biome.order} · Biome {biome.order}
              </p>
              <span className="rounded-full bg-white px-2.5 py-[3px] text-[10.5px] font-bold uppercase tracking-wide text-black/80">
                ใหม่ · New
              </span>
            </div>

            <h2 className="display mt-1.5 text-[2rem] text-white sm:text-[2.6rem]">{biome.th}</h2>
            <p className="headline text-[15px] text-white/75 sm:text-[17px]">{biome.en}</p>
            <p className="mt-3 max-w-lg text-[13px] leading-relaxed text-white/85">
              {biome.noteTh}
              <br />
              <span className="text-white/60">{biome.noteEn}</span>
            </p>
          </div>

          <dl className="grid shrink-0 grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/20 text-white sm:w-[19rem]">
            {[
              { th: "ผู้พิทักษ์", en: "Guardian" },
              { th: "ความเร็ว", en: "Speed" },
            ].map((s) => (
              <div key={s.en} className="bg-black/35 px-3 py-2.5 backdrop-blur-md">
                <dt className="text-[9.5px] uppercase tracking-[0.08em] text-white/60">
                  {s.th} · {s.en}
                </dt>
                <dd className="num mt-1 text-[13.5px] font-semibold leading-tight">ยังไม่มีข้อมูล</dd>
                <dd className="text-[10.5px] leading-tight text-white/60">not published yet</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
        {slots.map((pet, i) => (
          <div
            key={`${pet.en}-${i}`}
            className="card relative flex flex-col overflow-hidden rounded-[18px] opacity-80"
          >
            <div className="relative grid h-[9.5rem] place-items-center overflow-hidden bg-surface-2">
              <span
                aria-hidden
                className="absolute h-[5.5rem] w-[5.5rem] rounded-full opacity-40 blur-xl"
                style={{ background: pet.known ? biome.accent[0] : biome.accent[1] }}
              />
              <span className="relative text-[2.6rem] opacity-45" aria-hidden>
                {pet.known ? "🥚" : "❓"}
              </span>
              <span className="absolute left-3 top-3 rounded-full bg-surface-3 px-2 py-[3px] text-[10px] font-semibold text-ink-3">
                เร็ว ๆ นี้
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-3 border-t rule p-3.5">
              <div className="min-h-[2.6rem]">
                <p className="headline truncate text-[14.5px] text-ink">{pet.th}</p>
                <p className="truncate text-[12px] text-ink-3">{pet.en}</p>
              </div>
              <dl className="mt-auto grid grid-cols-2 gap-x-3 border-t rule pt-2.5">
                <div>
                  <dt className="text-[10px] leading-tight text-ink-3">รายได้ Income</dt>
                  <dd className="num text-[13.5px] font-semibold text-ink-3">—</dd>
                </div>
                <div className="text-right">
                  <dt className="text-[10px] leading-tight text-ink-3">ความเร็ว Speed</dt>
                  <dd className="num text-[13.5px] font-semibold text-ink-3">—</dd>
                </div>
              </dl>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-[12px] leading-relaxed text-ink-3">
        เจอตัวเลขในเกมแล้วบอกได้เลย เดี๋ยวอัปเดตให้ทันที · Spotted the real numbers in game? Tell us and they go
        straight in.
      </p>
    </section>
  );
}
