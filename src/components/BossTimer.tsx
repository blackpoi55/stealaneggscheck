"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { chimeNow, chimeWarn } from "@/lib/chime";
import { notificationPermission, notify, requestNotifications } from "@/lib/notify";
import type { EventsState } from "@/app/api/events/route";

export const BOSS_ANCHOR = "boss";

const SOUND_KEY = "sp-boss-sound";
const NOTIFY_KEY = "sp-boss-notify";
const WARN_SECONDS = 60;
const RESYNC_MS = 10 * 60 * 1000;
const HALF_HOUR_MS = 30 * 60 * 1000;

/* ── preferences kept outside React ─────────────────────────────────────── */

const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // private mode — the choice just won't persist
  }
  listeners.forEach((l) => l());
};

const soundOn = () => read(SOUND_KEY) === "1";

/** Only counts as on once the browser has actually granted permission. */
const notifyOn = () => read(NOTIFY_KEY) === "1" && notificationPermission() === "granted";

/* ── helpers ────────────────────────────────────────────────────────────── */

const pad = (n: number) => String(n).padStart(2, "0");
const format = (t: number) => `${pad(Math.floor(t / 60))}:${pad(t % 60)}`;

/**
 * The portal opens on the hour and the half hour, so the clock labels are
 * snapped to the nearest boundary — that keeps them right even when the
 * device clock is a little off, while the countdown itself is the server's.
 */
function openingTimes(secondsLeft: number, count: number) {
  const next = Math.round((Date.now() + secondsLeft * 1000) / HALF_HOUR_MS) * HALF_HOUR_MS;
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(next + i * HALF_HOUR_MS);
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });
}

export default function BossTimer() {
  const [state, setState] = useState<EventsState | null>(null);
  const [left, setLeft] = useState(0);

  const sound = useSyncExternalStore(subscribe, soundOn, () => false);
  const notifications = useSyncExternalStore(subscribe, notifyOn, () => false);

  // The countdown runs off a monotonic clock seeded by the server's own
  // "seconds remaining", so a wrong clock on the visitor's device changes
  // nothing.
  const seed = useRef<{ seconds: number; at: number } | null>(null);
  const warned = useRef(false);
  const fired = useRef(false);

  const sync = useCallback(async () => {
    try {
      const data: EventsState = await (await fetch("/api/events", { cache: "no-store" })).json();
      setState(data);
      if (typeof data.boss.secondsToNext === "number") {
        seed.current = { seconds: data.boss.secondsToNext, at: performance.now() };
        setLeft(data.boss.secondsToNext);
        warned.current = data.boss.secondsToNext <= WARN_SECONDS;
        fired.current = false;
      }
    } catch {
      // keep whatever we last knew
    }
  }, []);

  useEffect(() => {
    // Fetching the schedule is the "subscribe to an external system" case the
    // rule is meant to allow — setState runs when the request resolves.
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

      if (remaining <= WARN_SECONDS && remaining > 0 && !warned.current) {
        warned.current = true;
        if (soundOn()) chimeWarn();
        if (notifyOn()) {
          void notify(
            "ประตูบอสใกล้เปิดแล้ว",
            `อีก ${remaining} วินาที · Boss rift opens in under a minute`,
            "sp-boss"
          );
        }
      }

      if (remaining === 0 && !fired.current) {
        fired.current = true;
        if (soundOn()) chimeNow();
        if (notifyOn()) {
          void notify("ประตูบอสเปิดแล้ว!", "เข้าไปตี Abyss Overlord ได้เลย · The rift is open", "sp-boss");
        }
        setTimeout(() => void sync(), 2000);
      }
    }, 250);
    return () => clearInterval(tick);
  }, [sync]);

  const toggleSound = () => {
    const next = !sound;
    write(SOUND_KEY, next ? "1" : "0");
    if (next) chimeWarn(); // preview, and unlocks audio for the later plays
  };

  const toggleNotifications = async () => {
    if (notifications) {
      write(NOTIFY_KEY, "0");
      return;
    }
    const granted = await requestNotifications();
    write(NOTIFY_KEY, granted ? "1" : "0");
    if (granted) {
      void notify("เปิดแจ้งเตือนแล้ว", "จะเตือนก่อนประตูบอสเปิด 1 นาที · Alerts are on", "sp-boss");
    }
  };

  if (!state?.enabled) return null;

  const last = left > 0 && left <= WARN_SECONDS;
  const [nextAt, ...following] = openingTimes(left, 4);

  return (
    <section id={BOSS_ANCHOR} className="card relative overflow-hidden rounded-[22px] scroll-mt-[11rem]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 130% at 10% 0%, rgba(139,92,246,.26), transparent 70%), radial-gradient(60% 130% at 90% 100%, rgba(244,49,140,.18), transparent 70%)",
        }}
      />

      <div className="relative grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-grape-500/12 px-2.5 py-1 text-[11px] font-semibold text-grape-500">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-grape-500 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-grape-500" />
              </span>
              ทุกนาทีที่ :00 และ :30 · On the clock
            </span>

            <button
              type="button"
              onClick={toggleSound}
              aria-pressed={sound}
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                sound ? "bg-mint-600 text-white" : "bg-surface-3 text-ink-2 hover:text-ink"
              }`}
            >
              {sound ? "🔔 เสียงเตือนเปิด · Sound on" : "🔕 เสียงเตือน · Sound"}
            </button>

            <button
              type="button"
              onClick={() => void toggleNotifications()}
              aria-pressed={notifications}
              title={
                notificationPermission() === "denied"
                  ? "เบราว์เซอร์บล็อกการแจ้งเตือนไว้ ต้องไปเปิดในตั้งค่าเว็บไซต์"
                  : undefined
              }
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                notifications ? "bg-grape-500 text-white" : "bg-surface-3 text-ink-2 hover:text-ink"
              }`}
            >
              {notifications ? "🔔 แจ้งเตือนเปิด · Notify on" : "💬 แจ้งเตือน · Notify"}
            </button>
          </div>

          <p className="mt-3 text-[12px] uppercase tracking-[0.14em] text-ink-3">
            ประตูบอสเปิดในอีก · Boss rift opens in
          </p>
          <p
            className={`num display mt-0.5 text-[3.4rem] leading-none transition-colors sm:text-[4.4rem] ${
              last ? "animate-pulse text-candy-500" : "text-ink"
            }`}
          >
            {format(left)}
          </p>

          <p className="mt-1.5 text-[13px] text-ink-2">
            {last ? (
              <span className="font-semibold text-candy-500">ใกล้เปิดแล้ว เตรียมตัว · Opening now</span>
            ) : (
              <>
                เปิด <b className="num text-ink">{nextAt} น.</b>{" "}
                <span className="text-ink-3">— บอส Abyss Overlord</span>
              </>
            )}
          </p>

          <p className="num mt-1 text-[11.5px] text-ink-3">รอบถัดไป · then {following.join(" · ")}</p>
        </div>

        {/* what you are queueing for */}
        <dl className="grid shrink-0 grid-cols-2 gap-2 lg:w-[19rem]">
          {[
            { th: "เลือดบอส", en: "Boss HP", value: "27,300" },
            { th: "เฟส", en: "Phases", value: "2" },
            { th: "โทเคนที่ได้", en: "Tokens", value: "1.2–1.5K" },
            { th: "ของแถม", en: "Bonus", value: "Secret Rift Egg" },
          ].map((s) => (
            <div key={s.en} className="rounded-2xl bg-surface-2 px-3.5 py-3">
              <dt className="text-[10.5px] text-ink-3">
                {s.th} · {s.en}
              </dt>
              <dd className="num mt-0.5 text-[15px] font-semibold text-ink">{s.value}</dd>
            </div>
          ))}
          <p className="col-span-2 text-[11.5px] leading-relaxed text-ink-3">
            เฟส 1 ทุบคริสตัลรอบตัวบอสให้หมดก่อน เฟส 2 ตีแขนแล้วค่อยเข้าตีตัวบอส · ตีคนเดียวไม่ไหว
            ชวนคนอื่นเข้าริฟต์เดียวกันได้
          </p>
        </dl>
      </div>
    </section>
  );
}
