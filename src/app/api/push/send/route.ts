import { NextResponse } from "next/server";
import webpush from "web-push";
import { sql } from "@/lib/db";
import { eventsState } from "../../events/route";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Send when the portal is this close. The upper bound keeps a too-early
 * trigger from firing two minutes out; there is no lower bound so a cron that
 * runs late still delivers something rather than skipping the cycle.
 */
const WINDOW_MIN = 0;
const WINDOW_MAX = 100;

const configured = () =>
  Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);

interface Row {
  endpoint: string;
  p256dh: string;
  auth: string;
}

/**
 * Called by an external cron. It decides for itself whether this is the right
 * moment, so the schedule lives here rather than in the cron's configuration,
 * and a double call cannot send twice — which means the cron can be as coarse
 * as `29,59 * * * *` or as fine as every minute.
 *
 * `?force=1` sends immediately regardless of the clock, for testing.
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET is not set" }, { status: 503 });
  if (request.headers.get("x-cron-secret") !== secret) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }
  if (!sql) return NextResponse.json({ error: "no database" }, { status: 503 });
  if (!configured()) return NextResponse.json({ error: "VAPID keys are not set" }, { status: 503 });

  const force = new URL(request.url).searchParams.get("force") === "1";
  const { boss } = await eventsState();
  const seconds = boss.secondsToNext ?? -1;

  if (!force && (seconds < WINDOW_MIN || seconds > WINDOW_MAX)) {
    return NextResponse.json({ skipped: "outside the window", secondsToNext: seconds });
  }

  // One send per opening: the bucket is the opening's own timestamp, which
  // stays the same however often the cron fires during the window.
  const [claim] = await sql`
    insert into push_log (bucket)
    values ((floor((extract(epoch from now()) + ${seconds}) / 10) * 10)::bigint)
    on conflict (bucket) do nothing
    returning bucket
  `;
  if (!claim && !force) {
    return NextResponse.json({ skipped: "already sent for this opening" });
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:admin@example.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  const subs = (await sql`select endpoint, p256dh, auth from push_subs`) as Row[];
  const payload = JSON.stringify({
    title: "อีก 1 นาที ประตูบอสจะเปิด",
    body: "เตรียมตัวตี Abyss Overlord · Boss rift opens in 1 minute",
    url: "/#boss",
  });

  let sent = 0;
  const gone: string[] = [];

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
        sent++;
      } catch (error) {
        // 404/410 mean the browser dropped the subscription for good
        const status = (error as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) gone.push(sub.endpoint);
        else console.error("push send:", status, error);
      }
    })
  );

  if (gone.length) await sql`delete from push_subs where endpoint = any(${gone})`;
  if (claim) await sql`update push_log set recipients = ${sent} where bucket = ${claim.bucket}`;

  return NextResponse.json({ sent, pruned: gone.length, secondsToNext: seconds });
}

/** A plain GET so you can eyeball the state without sending anything. */
export async function GET(request: Request) {
  if (request.headers.get("x-cron-secret") !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }
  if (!sql) return NextResponse.json({ error: "no database" }, { status: 503 });

  const [{ count }] = (await sql`select count(*)::int as count from push_subs`) as { count: number }[];
  const { boss } = await eventsState();
  return NextResponse.json({
    configured: configured(),
    subscribers: count,
    secondsToNext: boss.secondsToNext,
    window: [WINDOW_MIN, WINDOW_MAX],
  });
}
