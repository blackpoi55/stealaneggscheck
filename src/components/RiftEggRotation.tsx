"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { EventsState } from "@/app/api/events/route";

const RESYNC_MS = 10 * 60 * 1000;

const pad = (n: number) => String(n).padStart(2, "0");

const format = (t: number) => {
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  return h > 0 ? `${h} ชม. ${pad(m)} นาที` : `${m} นาที ${pad(t % 60)} วิ`;
};

/**
 * Which of the three egg banners is live. Separate from the boss portal —
 * this one turns over every three hours, the portal every thirty minutes.
 */
export default function RiftEggRotation() {
  const [state, setState] = useState<EventsState | null>(null);
  const [left, setLeft] = useState(0);
  const seed = useRef<{ seconds: number; at: number } | null>(null);

  const sync = useCallback(async () => {
    try {
      const data: EventsState = await (await fetch("/api/events", { cache: "no-store" })).json();
      setState(data);
      if (data.riftEggs.configured && typeof data.riftEggs.secondsToNext === "number") {
        seed.current = { seconds: data.riftEggs.secondsToNext, at: performance.now() };
        setLeft(data.riftEggs.secondsToNext);
      }
    } catch {
      // keep whatever we last knew
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void sync();
    const resync = setInterval(() => void sync(), RESYNC_MS);
    return () => clearInterval(resync);
  }, [sync]);

  useEffect(() => {
    const tick = setInterval(() => {
      const s = seed.current;
      if (!s) return;
      const remaining = Math.max(0, Math.round(s.seconds - (performance.now() - s.at) / 1000));
      setLeft(remaining);
      if (remaining === 0) setTimeout(() => void sync(), 2000);
    }, 1000);
    return () => clearInterval(tick);
  }, [sync]);

  if (!state?.enabled || !state.riftEggs.configured) return null;

  return (
    <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl bg-surface px-4 py-3 text-[13px] text-ink-2 hairline">
      <span className="font-semibold text-ink">ตอนนี้ชุดที่ {state.riftEggs.currentBanner}</span>
      <span className="text-ink-3">· เปลี่ยนเป็นชุดที่ {state.riftEggs.nextBanner} ในอีก</span>
      <span className="num font-semibold text-ink">{format(left)}</span>
      <span className="text-ink-3">· Set {state.riftEggs.currentBanner} is live</span>
    </p>
  );
}
