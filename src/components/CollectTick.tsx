"use client";

import { useSyncExternalStore } from "react";
import { getServerSnapshot, getSnapshot, subscribe, toggle } from "@/lib/collection";

export function useCollected() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Round tick used on egg cards and in the egg dialog. */
export default function CollectTick({
  id,
  label,
  size = "sm",
  className = "",
}: {
  id: string;
  /** the egg's name, so the control reads sensibly to a screen reader */
  label: string;
  size?: "sm" | "lg";
  className?: string;
}) {
  const collected = useCollected().has(id);
  const box = size === "lg" ? "h-9 w-9" : "h-7 w-7";
  const tick = size === "lg" ? "h-[18px] w-[18px]" : "h-[15px] w-[15px]";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      aria-pressed={collected}
      aria-label={
        collected ? `เอา ${label} ออกจากเช็กลิสต์ / Remove from checklist` : `ทำเครื่องหมายว่าเก็บ ${label} แล้ว / Mark as collected`
      }
      title={collected ? "เก็บแล้ว · Collected" : "ยังไม่เก็บ · Not collected"}
      className={`grid ${box} place-items-center rounded-full transition ${
        collected
          ? "bg-mint-600 text-white shadow-[0_2px_10px_-2px_rgba(16,150,105,.7)]"
          : "bg-surface-3 text-ink-3 hover:bg-surface-3 hover:text-ink"
      } ${className}`}
    >
      <svg viewBox="0 0 24 24" className={tick} fill="none" stroke="currentColor" strokeWidth="2.6">
        <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
