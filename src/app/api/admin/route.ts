import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { BOSS_PERIOD, RIFT_EGG_PERIOD, eventsState } from "../events/route";

export const dynamic = "force-dynamic";

/**
 * Moderation endpoint. Authorised with the ADMIN_TOKEN env var sent as
 * `x-admin-token`; without that variable set the whole route is disabled so a
 * missing config can never mean "open to everyone".
 */
function authorise(request: Request) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return "ยังไม่ได้ตั้งค่า ADMIN_TOKEN · ADMIN_TOKEN is not set";
  if (request.headers.get("x-admin-token") !== expected) return "รหัสไม่ถูกต้อง · Wrong token";
  return null;
}

export async function GET(request: Request) {
  const denied = authorise(request);
  if (denied) return NextResponse.json({ error: denied }, { status: 401 });
  if (!sql) return NextResponse.json({ error: "ไม่มีฐานข้อมูล · No database" }, { status: 503 });

  const [comments, blocks, [views], events] = await Promise.all([
    sql`select id, name, message, ip, ip_hash, hidden, created_at
        from comments order by created_at desc limit 200`,
    sql`select ip_hash, ip, reason, created_at from blocked_ips order by created_at desc limit 200`,
    sql`select count(*)::int as total,
               count(*) filter (where day = current_date)::int as today
        from visits`,
    eventsState(),
  ]);

  return NextResponse.json({ comments, blocks, views, events });
}

/** Body: { action: "hide" | "show" | "delete", id } or { action: "block" | "unblock", ipHash, ip?, reason? } */
export async function POST(request: Request) {
  const denied = authorise(request);
  if (denied) return NextResponse.json({ error: denied }, { status: 401 });
  if (!sql) return NextResponse.json({ error: "ไม่มีฐานข้อมูล · No database" }, { status: 503 });

  const body = (await request.json().catch(() => ({}))) as {
    action?: string;
    id?: number | string;
    ipHash?: string;
    ip?: string;
    reason?: string;
    minutesLeft?: number;
    secondsLeft?: number;
    currentBanner?: number;
  };

  // bigserial ids arrive from the driver as strings
  const id = Number(body.id);
  const hasId = Number.isSafeInteger(id) && id > 0;

  switch (body.action) {
    case "hide":
    case "show": {
      if (!hasId) break;
      await sql`update comments set hidden = ${body.action === "hide"} where id = ${id}`;
      return NextResponse.json({ ok: true });
    }
    case "delete": {
      if (!hasId) break;
      await sql`delete from comments where id = ${id}`;
      return NextResponse.json({ ok: true });
    }
    case "block": {
      if (!body.ipHash) break;
      await sql`
        insert into blocked_ips (ip_hash, ip, reason)
        values (${body.ipHash}, ${body.ip ?? null}, ${body.reason ?? null})
        on conflict (ip_hash) do update set reason = excluded.reason
      `;
      // hide everything that address already posted
      await sql`update comments set hidden = true where ip_hash = ${body.ipHash}`;
      return NextResponse.json({ ok: true });
    }
    case "boss": {
      const seconds = Number(body.minutesLeft ?? 0) * 60 + Number(body.secondsLeft ?? 0);
      if (!Number.isFinite(seconds) || seconds < 0 || seconds > BOSS_PERIOD) break;
      await sql`
        insert into event_anchor (key, next_at, period_seconds, meta, updated_at)
        values ('boss', now() + make_interval(secs => ${seconds}), ${BOSS_PERIOD}, null, now())
        on conflict (key) do update
          set next_at = excluded.next_at, period_seconds = excluded.period_seconds, updated_at = now()
      `;
      return NextResponse.json({ ok: true });
    }
    case "rift": {
      const minutes = Number(body.minutesLeft);
      const banner = Number(body.currentBanner);
      if (!Number.isFinite(minutes) || minutes < 0 || minutes > 180) break;
      if (![1, 2, 3].includes(banner)) break;
      // next_at is the coming rotation; meta records the set that starts then
      const next = (banner % 3) + 1;
      await sql`
        insert into event_anchor (key, next_at, period_seconds, meta, updated_at)
        values ('rift-eggs', now() + make_interval(mins => ${minutes}), ${RIFT_EGG_PERIOD}, ${next}, now())
        on conflict (key) do update
          set next_at = excluded.next_at,
              period_seconds = excluded.period_seconds,
              meta = excluded.meta,
              updated_at = now()
      `;
      return NextResponse.json({ ok: true });
    }
    case "unblock": {
      if (!body.ipHash) break;
      await sql`delete from blocked_ips where ip_hash = ${body.ipHash}`;
      return NextResponse.json({ ok: true });
    }
  }

  return NextResponse.json({ error: "คำสั่งไม่ถูกต้อง · Unknown action" }, { status: 400 });
}
