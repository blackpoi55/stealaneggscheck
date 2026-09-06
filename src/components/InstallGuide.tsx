"use client";

import { useSyncExternalStore } from "react";

/* ── install-prompt store ─────────────────────────────────────────────────
   Chrome fires `beforeinstallprompt` very early — often before React mounts —
   so the listener lives at module scope and components read it from here.   */

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferred: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as InstallPromptEvent;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    emit();
  });
}

const subscribePrompt = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/* ── platform + installed-state stores ───────────────────────────────────── */

type Platform = "windows" | "ios" | "android";

const detectPlatform = (): Platform => {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "windows";
};

const noopSubscribe = () => () => {};

const subscribeStandalone = (l: () => void) => {
  const mq = window.matchMedia("(display-mode: standalone)");
  mq.addEventListener("change", l);
  return () => mq.removeEventListener("change", l);
};

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

/* ── steps ───────────────────────────────────────────────────────────────── */

const GUIDES: {
  id: Platform;
  th: string;
  en: string;
  browser: string;
  icon: React.ReactNode;
  steps: { th: string; en: string }[];
}[] = [
  {
    id: "windows",
    th: "วินโดวส์",
    en: "Windows",
    browser: "Chrome / Edge",
    icon: (
      <path d="M3 5.6l7.2-1v6.6H3V5.6zm0 12.8l7.2 1v-6.5H3v5.5zM11.6 4.4L21 3v8.2h-9.4V4.4zm0 8.2H21V21l-9.4-1.4v-7z" />
    ),
    steps: [
      { th: "เปิดเว็บนี้ด้วย Chrome หรือ Edge", en: "Open this page in Chrome or Edge" },
      { th: "กดไอคอนติดตั้ง (จอเล็กมีลูกศรลง) ท้ายช่องที่อยู่เว็บ", en: "Click the install icon at the end of the address bar" },
      { th: "กด “ติดตั้ง” — แอปจะไปอยู่ใน Start menu", en: "Click Install — it lands in your Start menu" },
      { th: "ไม่เห็นไอคอน? เมนู ⋯ → Apps → ติดตั้งไซต์นี้เป็นแอป", en: "No icon? Menu ⋯ → Apps → Install this site as an app" },
    ],
  },
  {
    id: "ios",
    th: "ไอโฟน / ไอแพด",
    en: "iPhone & iPad",
    browser: "Safari",
    icon: (
      <path d="M16 3.2c.1 1.2-.36 2.35-1.1 3.2-.76.9-1.98 1.6-3.16 1.5-.13-1.16.44-2.36 1.14-3.12.78-.86 2.1-1.5 3.12-1.58zM19.9 17c-.5 1.16-.74 1.68-1.4 2.7-.9 1.44-2.2 3.23-3.8 3.24-1.42.02-1.79-.93-3.72-.92-1.93.01-2.33.94-3.75.92-1.6-.01-2.82-1.62-3.73-3.05C.96 15.9.7 11.2 2.3 8.7c1.12-1.76 2.9-2.8 4.57-2.8 1.7 0 2.78 1 4.19 1 1.37 0 2.2-1 4.17-1 1.5 0 3.08.82 4.2 2.22-3.7 2.03-3.1 7.3.47 8.88z" />
    ),
    steps: [
      { th: "เปิดด้วย Safari เท่านั้น (Chrome บน iOS ติดตั้งไม่ได้)", en: "Open in Safari — Chrome on iOS cannot install it" },
      { th: "กดปุ่มแชร์ (สี่เหลี่ยมมีลูกศรขึ้น) ที่แถบล่าง", en: "Tap the Share button in the bottom bar" },
      { th: "เลื่อนลงหา “เพิ่มไปยังหน้าจอโฮม”", en: "Scroll down to “Add to Home Screen”" },
      { th: "กด “เพิ่ม” มุมขวาบน", en: "Tap “Add” in the top right" },
    ],
  },
  {
    id: "android",
    th: "แอนดรอยด์",
    en: "Android",
    browser: "Chrome",
    icon: (
      <path d="M17.6 10.1l1.84-3.19a.4.4 0 1 0-.7-.4l-1.86 3.23a11.5 11.5 0 0 0-9.76 0L5.25 6.52a.4.4 0 0 0-.7.4L6.4 10.1A10.8 10.8 0 0 0 1 18.6h22a10.8 10.8 0 0 0-5.4-8.5zM7 15.9a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z" />
    ),
    steps: [
      { th: "เปิดด้วย Chrome", en: "Open in Chrome" },
      { th: "กดเมนู ⋮ มุมขวาบน", en: "Tap the ⋮ menu in the top right" },
      { th: "เลือก “ติดตั้งแอป” หรือ “เพิ่มไปยังหน้าจอหลัก”", en: "Choose “Install app” or “Add to Home screen”" },
      { th: "กด “ติดตั้ง” แล้วไอคอนจะขึ้นบนหน้าจอ", en: "Tap Install — the icon appears on your home screen" },
    ],
  },
];

export default function InstallGuide() {
  const canPrompt = useSyncExternalStore(
    subscribePrompt,
    () => deferred !== null,
    () => false
  );
  const platform = useSyncExternalStore(noopSubscribe, detectPlatform, () => "windows" as Platform);
  const installed = useSyncExternalStore(subscribeStandalone, isStandalone, () => false);

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    deferred = null;
    emit();
  };

  return (
    <section id="install" className="mx-auto max-w-[1320px] px-4 py-20 sm:px-6">
      <div className="text-center">
        <p className="text-[12px] uppercase tracking-[0.14em] text-ink-3">ติดตั้งเป็นแอป · Install as an app</p>
        <h2 className="display mx-auto mt-2 max-w-2xl text-[2rem] text-ink sm:text-[2.75rem]">
          เปิดจากหน้าจอโฮมได้เลย
        </h2>
        <p className="headline mt-1 text-[1.05rem] text-ink-2 sm:text-[1.4rem]">
          Add it to your home screen
        </p>
        <p className="mx-auto mt-4 max-w-xl text-[14.5px] leading-relaxed text-ink-2">
          ติดตั้งแล้วเปิดได้เหมือนแอปจริง เต็มจอ ไม่มีแถบเบราว์เซอร์ และเปิดดูได้แม้เน็ตหลุด
          <span className="mt-1 block text-ink-3">
            Runs full screen like a real app, and keeps working when you go offline.
          </span>
        </p>

        {installed ? (
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-[13.5px] font-medium text-ink hairline">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-candy-500" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            ติดตั้งแล้ว · Already installed
          </p>
        ) : (
          canPrompt && (
            <button
              type="button"
              onClick={install}
              className="mt-6 rounded-full bg-candy-500 px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-candy-600"
            >
              ติดตั้งเลย · Install now
            </button>
          )
        )}
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {GUIDES.map((g) => {
          const mine = g.id === platform;
          return (
            <div
              key={g.id}
              className={`card relative rounded-[22px] p-5 transition ${
                mine ? "ring-2 ring-candy-500" : ""
              }`}
            >
              {mine && (
                <span className="absolute right-4 top-4 rounded-full bg-candy-500 px-2 py-[3px] text-[10px] font-semibold text-white">
                  เครื่องคุณ · You
                </span>
              )}

              <svg viewBox="0 0 24 24" className="h-7 w-7 fill-ink" aria-hidden>
                {g.icon}
              </svg>

              <h3 className="headline mt-3 text-[18px] text-ink">{g.th}</h3>
              <p className="text-[13px] text-ink-2">
                {g.en} <span className="text-ink-3">· {g.browser}</span>
              </p>

              <ol className="mt-4 space-y-3">
                {g.steps.map((s, i) => (
                  <li key={s.en} className="flex gap-3">
                    <span className="num mt-[1px] grid h-5 w-5 shrink-0 place-items-center rounded-full bg-surface-3 text-[11px] font-semibold text-ink-2">
                      {i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13.5px] leading-snug text-ink">{s.th}</span>
                      <span className="block text-[12px] leading-snug text-ink-3">{s.en}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
      </div>
    </section>
  );
}
