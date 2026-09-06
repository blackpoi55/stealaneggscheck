import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

/** The boss portal opens on the half hour; the Rift-egg banner turns over every three. */
export const BOSS_PERIOD = 30 * 60;
export const RIFT_EGG_PERIOD = 3 * 60 * 60;
const BANNERS = 3;

export interface EventTimer {
  configured: boolean;
  /** where the countdown came from — `clock` is the unverified fallback */
  source?: "anchor" | "clock";
  secondsToNext?: number;
  periodSeconds: number;
  /** rift eggs only */
  currentBanner?: number;
  nextBanner?: number;
}

export interface EventsState {
  enabled: boolean;
  boss: EventTimer;
  riftEggs: EventTimer;
}

const wrap = (n: number) => ((n % BANNERS) + BANNERS) % BANNERS;

export async function eventsState(): Promise<EventsState> {
  const off = {
    enabled: false,
    boss: { configured: false, periodSeconds: BOSS_PERIOD },
    riftEggs: { configured: false, periodSeconds: RIFT_EGG_PERIOD },
  };
  if (!sql) return off;

  // Worked out in Postgres so a single clock decides — the app server and the
  // database do not agree to the second, and mixing them skews the countdown.
  //
  // `cycles` counts whole periods since the anchor (negative while the anchor
  // is still ahead); the modulo is normalised because Postgres keeps the sign
  // of the dividend.
  // With no anchor set, fall back to the wall clock: half-hour events in these
  // games usually land on :00 and :30, and Thailand is a whole-hour offset so
  // the UTC boundary is the local one too. Flagged as an assumption in the UI.
  const [[clock], rows] = (await Promise.all([
    sql`select (${BOSS_PERIOD} - mod(extract(epoch from now())::numeric, ${BOSS_PERIOD}))::int as seconds`,
    sql`
    select
      key,
      period_seconds,
      meta,
      floor(extract(epoch from now() - next_at) / period_seconds)::int as cycles,
      (
        period_seconds - mod(
          mod(extract(epoch from now() - next_at)::numeric, period_seconds) + period_seconds,
          period_seconds
        )
      )::int as seconds_to_next
    from event_anchor
  `,
  ])) as [{ seconds: number }[], { key: string; period_seconds: number; meta: number | null; cycles: number; seconds_to_next: number }[]];

  const read = (key: string, fallbackPeriod: number): EventTimer => {
    const row = rows.find((r) => r.key === key);
    if (!row) {
      // only the boss has a sensible clock default; the egg rotation's phase
      // cannot be guessed
      return key === "boss"
        ? { configured: true, source: "clock", secondsToNext: clock.seconds, periodSeconds: fallbackPeriod }
        : { configured: false, periodSeconds: fallbackPeriod };
    }

    const timer: EventTimer = {
      configured: true,
      source: "anchor",
      periodSeconds: row.period_seconds,
      secondsToNext: Math.max(0, Math.min(row.period_seconds, row.seconds_to_next)),
    };

    if (row.meta !== null) {
      timer.currentBanner = wrap(row.meta - 1 + row.cycles) + 1;
      timer.nextBanner = wrap(timer.currentBanner) + 1;
    }
    return timer;
  };

  return {
    enabled: true,
    boss: read("boss", BOSS_PERIOD),
    riftEggs: read("rift-eggs", RIFT_EGG_PERIOD),
  };
}

export async function GET() {
  try {
    return NextResponse.json(await eventsState());
  } catch (error) {
    console.error("events:", error);
    return NextResponse.json({
      enabled: false,
      boss: { configured: false, periodSeconds: BOSS_PERIOD },
      riftEggs: { configured: false, periodSeconds: RIFT_EGG_PERIOD },
    });
  }
}
