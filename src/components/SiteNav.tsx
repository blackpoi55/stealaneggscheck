"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { biomeAnchor, useBrowse } from "./browse-context";
import { BIOMES, SITE, biomeImg, type BiomeId } from "@/data/steal-an-egg";

export default function SiteNav() {
  const { jumpTo } = useBrowse();
  const [active, setActive] = useState<BiomeId | "all">("all");
  const headerRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  // Publish the real nav height so the filter bar and anchor offsets follow it.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const publish = () =>
      document.documentElement.style.setProperty("--nav-h", `${Math.round(el.offsetHeight)}px`);
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Scroll spy — highlights whichever biome section is on screen.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      // a section counts as current once its top clears the nav + filter bar
      const filterH =
        parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--filter-h")) || 104;
      const y = window.scrollY + (headerRef.current?.offsetHeight ?? 112) + filterH + 60;
      let current: BiomeId | "all" = "all";
      for (const b of BIOMES) {
        const el = document.getElementById(biomeAnchor(b.id));
        if (el && el.getBoundingClientRect().top + window.scrollY <= y) current = b.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Keep the highlighted chip in view. Scroll the rail directly — scrollIntoView
  // would also nudge the window and fight the smooth jump that is under way.
  useEffect(() => {
    const rail = railRef.current;
    const chip = rail?.querySelector<HTMLElement>('[data-active="true"]');
    if (!rail || !chip) return;
    const target = chip.offsetLeft - rail.clientWidth / 2 + chip.offsetWidth / 2;
    rail.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [active]);

  return (
    <header ref={headerRef} className="sticky top-0 z-50 panel border-b rule">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
        {/* row 1 — brand + actions */}
        <div className="flex h-12 items-center gap-3">
          <a
            href={SITE.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-w-0 items-center gap-2"
          >
            <Logo className="h-6 w-6 rounded-[7px]" />
            <span className="truncate text-[13.5px] font-semibold tracking-[-0.01em] text-ink">
              SweetParadise
            </span>
            <span className="hidden text-[12px] text-ink-3 sm:inline">· Steal an Egg</span>
          </a>

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

        {/* row 2 — jump straight to any biome, laid out two rows deep so the
            rail barely needs horizontal scrolling */}
        <nav
          ref={railRef}
          aria-label="ไปที่ไบโอม / Jump to biome"
          className="-mx-4 overflow-x-auto px-4 pb-2.5 no-scrollbar rail-fade sm:-mx-6 sm:px-6"
        >
          <div className="grid auto-cols-max grid-flow-col grid-rows-2 justify-start gap-x-1.5 gap-y-1">
            <BiomeChip active={active === "all"} onClick={() => jumpTo("all")} th="ทั้งหมด" en="All" />
            {BIOMES.map((b) => (
              <BiomeChip
                key={b.id}
                active={active === b.id}
                onClick={() => jumpTo(b.id)}
                th={b.th}
                en={b.en}
                img={biomeImg(b.id)}
                accent={b.accent[0]}
              />
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}

function BiomeChip({
  active,
  onClick,
  th,
  en,
  img,
  accent,
}: {
  active: boolean;
  onClick: () => void;
  th: string;
  en: string;
  img?: string;
  accent?: string;
}) {
  return (
    <button
      type="button"
      data-active={active}
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={`flex shrink-0 items-center gap-1.5 rounded-full py-[3px] pl-[3px] pr-2.5 transition ${
        active ? "bg-ink text-surface" : "text-ink-2 hover:bg-surface-3 hover:text-ink"
      }`}
    >
      {img ? (
        <Image
          src={img}
          alt=""
          width={64}
          height={64}
          sizes="22px"
          className="h-[22px] w-[22px] shrink-0 rounded-full object-cover"
          style={{ boxShadow: `0 0 0 1.5px ${active ? "transparent" : accent}` }}
        />
      ) : (
        <span className="prismatic h-[22px] w-[22px] shrink-0 rounded-full" />
      )}
      <span className="whitespace-nowrap text-[12px] font-medium leading-none">
        {th}
        <span className="ml-1 text-[10.5px] opacity-60">{en}</span>
      </span>
    </button>
  );
}
