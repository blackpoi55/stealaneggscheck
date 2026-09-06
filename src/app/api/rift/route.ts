import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

/** The Rift banner rotates every three hours. */
export const PERIOD_SECONDS = 3 * 60 * 60;
const BANNERS = 3;

export interface RiftState {
  enabled: boolean;
  /** false until someone has told the site where in the cycle we are */
  configured: boolean;
  currentBanner?: number;
  nextBanner?: number;
  /** authoritative: computed from the server clock, never the visitor's */
  secondsToRotation?: number;
  periodSeconds: number;
  updatedAt?: string;
}

const wrap = (n: number) => ((n % BANNERS) + BANNERS) % BANNERS;

export async function riftState(): Promise<RiftState> {
  if (!sql) return { enabled: false, configured: false, periodSeconds: PERIOD_SECONDS };

  // Everything is worked out in Postgres so a single clock decides: the app
  // server and the database do not agree to the second, and mixing the two
  // would skew the countdown by however far apart they drift.
  //
  // `cycles` is how many whole periods have passed since the anchor (negative
  // while the anchor is still ahead), and the modulo is normalised because
  // Postgres keeps the sign of the dividend.
  const [row] = (await sql`
    select
      banner,
      updated_at,
      floor(extract(epoch from now() - rotates_at) / ${PERIOD_SECONDS})::int as cycles,
      (
        ${PERIOD_SECONDS} - mod(
          mod(extract(epoch from now() - rotates_at)::numeric, ${PERIOD_SECONDS}) + ${PERIOD_SECONDS},
          ${PERIOD_SECONDS}
        )
      )::int as seconds_to_rotation
    from rift_anchor
    where id = 1
  `) as { banner: number; updated_at: string; cycles: number; seconds_to_rotation: number }[];

  if (!row) return { enabled: true, configured: false, periodSeconds: PERIOD_SECONDS };

  const currentBanner = wrap(row.banner - 1 + row.cycles) + 1;

  return {
    enabled: true,
    configured: true,
    currentBanner,
    nextBanner: wrap(currentBanner) + 1,
    secondsToRotation: Math.max(0, Math.min(PERIOD_SECONDS, row.seconds_to_rotation)),
    periodSeconds: PERIOD_SECONDS,
    updatedAt: row.updated_at,
  };
}

export async function GET() {
  try {
    return NextResponse.json(await riftState());
  } catch (error) {
    console.error("rift:", error);
    return NextResponse.json({ enabled: false, configured: false, periodSeconds: PERIOD_SECONDS });
  }
}
