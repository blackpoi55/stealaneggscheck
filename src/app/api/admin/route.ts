import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

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

  const [comments, blocks, [views]] = await Promise.all([
    sql`select id, name, message, ip, ip_hash, hidden, created_at
        from comments order by created_at desc limit 200`,
    sql`select ip_hash, ip, reason, created_at from blocked_ips order by created_at desc limit 200`,
    sql`select count(*)::int as total,
               count(*) filter (where day = current_date)::int as today
        from visits`,
  ]);

  return NextResponse.json({ comments, blocks, views });
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
    case "unblock": {
      if (!body.ipHash) break;
      await sql`delete from blocked_ips where ip_hash = ${body.ipHash}`;
      return NextResponse.json({ ok: true });
    }
  }

  return NextResponse.json({ error: "คำสั่งไม่ถูกต้อง · Unknown action" }, { status: 400 });
}
