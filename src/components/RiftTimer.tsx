"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LIMITED_PETS, limitedImg } from "@/data/limited";
import { RARITY_BY_ID, money } from "@/data/steal-an-egg";

interface RiftState {
  enabled: boolean;
  configured: boolean;
  currentBanner?: number;
  nextBanner?: number;
  secondsToRotation?: number;
  periodSeconds: number;
}

const SOUND_KEY = "sp-rift-sound";
const RESYNC_MS = 10 * 60 * 1000;
/** heads-up before the banner actually changes */
const WARN_SECONDS = 60;

/* ── alert chime ─────────────────────────────────────────────────────────
   Generated rather than loaded, so there is no audio file to ship. The
   context is created on the toggle click, which is the gesture mobile
   browsers require before audio may play.                                */

let audio: AudioContext | null = null;

function ensureAudio() {
  if (!audio) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    audio = new Ctor();
  }
  void audio.resume();
  return audio;
}

function chime(notes: number[] = [880, 1108.73, 1318.51]) {
  const ctx = ensureAudio();
  if (!ctx) return;
  // a short rising figure — audible without being startling
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const at = ctx.currentTime + i * 0.16;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.22, at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.5);
    osc.connect(gain).connect(ctx.destination);
    osc.start(at);
    osc.stop(at + 0.55);
  });
}

/* ── alert preference ────────────────────────────────────────────────────
   localStorage is external state, so it is read through a store rather than
   copied into React state inside an effect.                              */

const soundListeners = new Set<() => void>();

const subscribeSound = (listener: () => void) => {
  soundListeners.add(listener);
  return () => {
    soundListeners.delete(listener);
  };
};

const soundEnabled = () => {
  try {
    return localStorage.getItem(SOUND_KEY) === "1";
  } catch {
    return false;
  }
};

function setSoundPreference(on: boolean) {
  try {
    localStorage.setItem(SOUND_KEY, on ? "1" : "0");
  } catch {
    // private mode — the choice just won't persist
  }
  soundListeners.forEach((l) => l());
}

const pad = (n: number) => String(n).padStart(2, "0");

function formatLeft(total: number) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export default function RiftTimer() {
  const [state, setState] = useState<RiftState | null>(null);
  const [left, setLeft] = useState(0);
  const sound = useSyncExternalStore(subscribeSound, soundEnabled, () => false);

  // The countdown runs off a monotonic clock seeded by the server's own
  // "seconds remaining", so a wrong clock on the visitor's device changes
  // nothing.
  const seed = useRef<{ seconds: number; at: number } | null>(null);
  const warned = useRef(false);
  const fired = useRef(false);

  const sync = useCallback(async () => {
    try {
      const data: RiftState = await (await fetch("/api/rift", { cache: "no-store" })).json();
      setState(data);
      if (data.configured && typeof data.secondsToRotation === "number") {
        seed.current = { seconds: data.secondsToRotation, at: performance.now() };
        setLeft(data.secondsToRotation);
        fired.current = false;
        // don't replay the heads-up for a window we already passed
        warned.current = data.secondsToRotation <= WARN_SECONDS;
      }
    } catch {
      // keep whatever we last knew
    }
  }, []);

  useEffect(() => {
    // Fetching the schedule is the "subscribe to an external system" case the
    // rule is meant to allow — the setState runs when the request resolves,
    // not during render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void sync();
    const resync = setInterval(() => void sync(), RESYNC_MS);
    return () => clearInterval(resync);
  }, [sync]);

  useEffect(() => {
    const tick = setInterval(() => {
      const s = seed.current;
      if (!s) return;
      const elapsed = (performance.now() - s.at) / 1000;
      const remaining = Math.max(0, Math.round(s.seconds - elapsed));
      setLeft(remaining);

      if (remaining <= WARN_SECONDS && remaining > 0 && !warned.current) {
        warned.current = true;
        if (soundEnabled()) chime();
      }

      if (remaining === 0 && !fired.current) {
        fired.current = true;
        if (soundEnabled()) chime([1318.51, 1046.5]);
        // let the rotation land server-side before asking for the new set
        setTimeout(() => void sync(), 2000);
      }
    }, 250);
    return () => clearInterval(tick);
  }, [sync]);

  const toggleSound = () => {
    const next = !sound;
    setSoundPreference(next);
    if (next) chime(); // also unlocks audio for the later, ungestured play
  };

  if (!state?.enabled) return null;

  const current = state.currentBanner ?? 0;
  const next = state.nextBanner ?? 0;
  const currentPets = LIMITED_PETS.filter((p) => p.banner === current);
  const nextPets = LIMITED_PETS.filter((p) => p.banner === next);
  const best = currentPets.reduce<(typeof currentPets)[number] | null>(
    (a, b) => (!a || b.income > a.income ? b : a),
    null
  );

  return (
    <div className="card relative overflow-hidden rounded-[22px]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 120% at 12% 0%, rgba(139,92,246,.25), transparent 70%), radial-gradient(60% 120% at 88% 100%, rgba(56,189,248,.18), transparent 70%)",
        }}
      />

      <div className="relative flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-grape-500/12 px-2.5 py-1 text-[11px] font-semibold text-grape-500">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-grape-500 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-grape-500" />
              </span>
              เวลาเซิร์ฟเวอร์ · Server time
            </span>
            <button
              type="button"
              onClick={toggleSound}
              aria-pressed={sound}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                sound ? "bg-mint-600 text-white" : "bg-surface-3 text-ink-2 hover:text-ink"
              }`}
            >
              {sound ? "🔔 เตือนก่อน 1 นาที · Alert on" : "🔕 ไม่เตือน · Alert off"}
            </button>
          </div>

          {state.configured ? (
            <>
              <p className="mt-3 text-[12px] uppercase tracking-[0.14em] text-ink-3">
                Rift เปลี่ยนชุดในอีก · Rift rotates in
              </p>
              <p
                className={`num display mt-0.5 text-[3.2rem] leading-none transition-colors sm:text-[4rem] ${
                  left > 0 && left <= WARN_SECONDS ? "animate-pulse text-candy-500" : "text-ink"
                }`}
              >
                {formatLeft(left)}
              </p>
              {left > 0 && left <= WARN_SECONDS && (
                <p className="mt-1 text-[13px] font-semibold text-candy-500">
                  ใกล้เปลี่ยนชุดแล้ว · Rotating in under a minute
                </p>
              )}
              <p className="mt-2 text-[13.5px] text-ink-2">
                ตอนนี้เป็น <b className="text-ink">ชุดที่ {current}</b> · ชุดถัดไปคือ{" "}
                <b className="text-ink">ชุดที่ {next}</b>
                {best && (
                  <>
                    {" "}
                    — ตัวแรงสุดตอนนี้{" "}
                    <b className="text-ink">
                      {best.th} {money(best.income)}/s
                    </b>
                  </>
                )}
              </p>
            </>
          ) : (
            <>
              <p className="headline mt-3 text-[19px] text-ink">ยังไม่ได้ตั้งเวลา Rift</p>
              <p className="mt-1 max-w-md text-[13px] leading-relaxed text-ink-2">
                แอดมินตั้งค่าครั้งเดียวที่ <code className="rounded bg-surface-3 px-1">/admin</code> โดยดูจากใน
                เกมว่าเหลืออีกกี่นาทีและตอนนี้เป็นชุดไหน จากนั้นเว็บคำนวณต่อเองตลอด
                <span className="mt-1 block text-ink-3">
                  An admin sets it once from the in-game countdown; the server keeps the schedule from there.
                </span>
              </p>
            </>
          )}
        </div>

        {state.configured && (
          <div className="flex shrink-0 flex-col gap-3 lg:items-end">
            <PetRow label="ชุดนี้ · Now" pets={currentPets} />
            <PetRow label="ชุดหน้า · Next" pets={nextPets} dim />
          </div>
        )}
      </div>
    </div>
  );
}

function PetRow({
  label,
  pets,
  dim,
}: {
  label: string;
  pets: typeof LIMITED_PETS;
  dim?: boolean;
}) {
  return (
    <div className={dim ? "opacity-55" : ""}>
      <p className="mb-1.5 text-[10.5px] uppercase tracking-[0.1em] text-ink-3 lg:text-right">{label}</p>
      <div className="flex gap-1.5">
        {pets.map((p) => (
          <span
            key={p.id}
            title={`${p.th} · ${p.en} — ${money(p.income)}/s`}
            className="grid h-14 w-14 place-items-center overflow-hidden rounded-xl"
            style={{ background: `color-mix(in oklab, ${RARITY_BY_ID[p.rarity].color} 14%, var(--panel-solid))` }}
          >
            <Image
              src={limitedImg(p.id)}
              alt={`${p.th} / ${p.en}`}
              width={112}
              height={112}
              sizes="112px"
              className="h-full w-full object-contain"
            />
          </span>
        ))}
      </div>
    </div>
  );
}
