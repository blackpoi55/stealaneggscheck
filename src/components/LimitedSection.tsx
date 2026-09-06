"use client";

import Image from "next/image";
import CollectTick, { useCollected } from "./CollectTick";
import RiftEggRotation from "./RiftEggRotation";
import { RARITY_BY_ID, cashReward, compact, money } from "@/data/steal-an-egg";
import {
  LIMITED_BY_SOURCE,
  LIMITED_PETS,
  limitedGroupImg,
  limitedImg,
  type LimitedPet,
} from "@/data/limited";

export const LIMITED_ANCHOR = "limited";

const BANNER_LABEL: Record<number, string> = { 1: "ชุดที่ 1 · Set 1", 2: "ชุดที่ 2 · Set 2", 3: "ชุดที่ 3 · Set 3" };

function PetCard({ pet }: { pet: LimitedPet }) {
  const rarity = RARITY_BY_ID[pet.rarity];
  const collected = useCollected().has(pet.id);

  return (
    <div
      style={{ ["--c" as string]: rarity.color }}
      className={`card group relative flex flex-col overflow-hidden rounded-[18px] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[var(--card-shadow-hover)] ${
        collected ? "ring-1 ring-mint-600/60" : ""
      }`}
    >
      <div
        className="relative flex h-[11rem] items-center justify-center overflow-hidden"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 0%, color-mix(in oklab, var(--c) 15%, var(--panel-solid)) 0%, var(--panel-solid) 78%)",
        }}
      >
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 h-[7rem] w-[7rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-xl transition-transform duration-500 group-hover:scale-125"
          style={{ background: "color-mix(in oklab, var(--c) 40%, transparent)" }}
        />
        <Image
          src={limitedImg(pet.id)}
          alt={`${pet.th} / ${pet.en}`}
          width={220}
          height={220}
          sizes="220px"
          className={`relative w-auto object-contain transition-transform duration-500 ease-out group-hover:-translate-y-1 group-hover:scale-[1.06] ${
            pet.tile ? "h-[10.4rem]" : "h-[8.6rem]"
          }`}
        />

        {/* the tile art already carries the rarity strip and drop rate */}
        {!pet.tile && (
          <span
            className={`absolute left-3 top-3 rounded-full px-2 py-[3px] text-[10px] font-semibold ${
              pet.rarity === "divine" ? "prismatic text-black/80" : ""
            }`}
            style={
              pet.rarity === "divine"
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
        )}

        {pet.chance > 0 && !pet.tile && (
          <span className="num absolute bottom-2.5 left-3 rounded-full bg-surface-2 px-2 py-[2px] text-[10.5px] font-semibold text-ink-2">
            {pet.chance}%
          </span>
        )}

        <CollectTick id={pet.id} label={`${pet.th} / ${pet.en}`} className="absolute right-2.5 top-2.5 z-20" />
      </div>

      <div className="flex flex-1 flex-col gap-2.5 border-t rule p-3.5">
        <div className="min-h-[2.4rem]">
          <p className="headline truncate text-[14px] text-ink">{pet.th}</p>
          <p className="truncate text-[11.5px] text-ink-3">{pet.en}</p>
        </div>

        <dl className="mt-auto grid grid-cols-2 gap-x-3 border-t rule pt-2.5">
          <div>
            <dt className="text-[10px] leading-tight text-ink-3">รายได้ Income</dt>
            <dd className="num text-[13.5px] font-semibold text-ink">{money(pet.income)}/s</dd>
          </div>
          <div className="text-right">
            <dt className="text-[10px] leading-tight text-ink-3">ความเร็ว Speed</dt>
            <dd className="num text-[13.5px] font-semibold text-ink">
              {pet.speedReward === 0 ? "—" : `+${compact(pet.speedReward)}`}
            </dd>
          </div>
        </dl>

        <p className="num text-[10.5px] text-ink-3">
          เงินโบนัส · Cash {money(cashReward(pet))}
        </p>
      </div>
    </div>
  );
}

export default function LimitedSection() {
  const collected = useCollected();
  const have = LIMITED_PETS.reduce((n, p) => n + (collected.has(p.id) ? 1 : 0), 0);

  return (
    <section id={LIMITED_ANCHOR}>
      <div>
        <div className="text-center">
          <p className="text-[12px] uppercase tracking-[0.14em] text-ink-3">
            ไม่ได้มาจากไบโอม · Limited eggs
          </p>
          <h2 className="display mx-auto mt-2 max-w-3xl text-[2rem] text-ink sm:text-[2.75rem]">
            เพ็ตลิมิเต็ดอีก {LIMITED_PETS.length} ตัว
          </h2>
          <p className="headline mt-1 text-[1.05rem] text-ink-2 sm:text-[1.4rem]">
            {LIMITED_PETS.length} more you cannot hatch from a nest
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-[14.5px] leading-relaxed text-ink-2">
            พวกนี้คือช่องที่ขึ้น ??? ในดัชนีสัตว์เลี้ยง มาจากไข่อีเวนต์ ร้าน Robux และ Rift ไม่ได้มาจากรังในไบโอม
            <span className="mt-1 block text-ink-3">
              These fill the ??? slots in the pet index — event eggs, the Robux shop and the Rift.
            </span>
          </p>
          <p className="num mt-4 inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-[13.5px] font-semibold text-ink hairline">
            เก็บแล้ว {have}/{LIMITED_PETS.length}
          </p>
        </div>

        <div className="mt-8 space-y-12">
          {LIMITED_BY_SOURCE.map(({ group, pets }) => {
            const groupHave = pets.reduce((n, p) => n + (collected.has(p.id) ? 1 : 0), 0);
            const banners = [...new Set(pets.map((p) => p.banner).filter(Boolean))] as number[];

            return (
              <section key={group.id} id={`limited-${group.id}`} className="scroll-mt-[11rem]">
                <div className="relative overflow-hidden rounded-[22px]">
                  {group.banner && (
                    <Image
                      src={limitedGroupImg(group.id)}
                      alt=""
                      width={1600}
                      height={900}
                      sizes="(max-width: 1024px) 100vw, 1240px"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: group.banner
                        ? `linear-gradient(180deg, ${group.accent[1]}30 0%, ${group.accent[1]}c4 62%, ${group.accent[1]}f2 100%)`
                        : `linear-gradient(135deg, ${group.accent[0]} 0%, ${group.accent[1]} 100%)`,
                    }}
                  />
                  <div className="relative flex min-h-[11rem] flex-col justify-end gap-4 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
                    <div className="min-w-0">
                      <span className="num inline-flex rounded-full bg-black/35 px-2.5 py-[3px] text-[11px] font-semibold text-white backdrop-blur-md">
                        เก็บแล้ว {groupHave}/{pets.length}
                      </span>
                      <h3 className="display mt-1.5 text-[1.8rem] text-white sm:text-[2.2rem]">{group.th}</h3>
                      <p className="headline text-[14px] text-white/75">{group.en}</p>
                      <p className="mt-2.5 max-w-2xl text-[12.5px] leading-relaxed text-white/85">
                        {group.howTh}
                        <br />
                        <span className="text-white/60">{group.howEn}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {group.id === "rift" && <RiftEggRotation />}

                {banners.length > 0
                  ? banners.map((b) => (
                      <div key={b}>
                        <p className="mb-2.5 mt-5 text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-3">
                          {BANNER_LABEL[b]}
                        </p>
                        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
                          {pets
                            .filter((p) => p.banner === b)
                            .map((pet) => (
                              <PetCard key={pet.id} pet={pet} />
                            ))}
                        </div>
                      </div>
                    ))
                  : (
                      <div className="mt-5 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
                        {pets.map((pet) => (
                          <PetCard key={pet.id} pet={pet} />
                        ))}
                      </div>
                    )}
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}
