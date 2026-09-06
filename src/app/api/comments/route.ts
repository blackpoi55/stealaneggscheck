import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { clientIp, hashIp } from "@/lib/ip";

export const dynamic = "force-dynamic";

const NAME_MAX = 40;
const MESSAGE_MAX = 800;
/** comments allowed from one address per hour */
const RATE_LIMIT = 5;

const off = () => NextResponse.json({ enabled: false, comments: [] });

/** Drops control characters (newlines survive) and collapses blank runs. */
const clean = (value: unknown, max: number) => {
  if (typeof value !== "string") return "";
  let out = "";
  for (const ch of value) {
    const code = ch.codePointAt(0)!;
    if (code === 0x7f || (code < 0x20 && ch !== "\n")) continue;
    out += ch;
  }
  return out.replace(/\n{3,}/g, "\n\n").trim().slice(0, max);
};

export async function GET() {
  if (!sql) return off();
  try {
    const rows = await sql`
      select id, name, message, created_at
      from comments
      where hidden = false
      order by created_at desc
      limit 100
    `;
    return NextResponse.json({ enabled: true, comments: rows });
  } catch (error) {
    console.error("comments GET:", error);
    return off();
  }
}

export async function POST(request: Request) {
  if (!sql) {
    return NextResponse.json(
      { error: "ยังไม่ได้เชื่อมฐานข้อมูล · Database is not configured" },
      { status: 503 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง · Bad request" }, { status: 400 });
  }

  // Hidden field that only bots fill in — accept quietly, store nothing.
  if (clean(body.website, 100)) return NextResponse.json({ ok: true });

  const name = clean(body.name, NAME_MAX) || "ไม่ระบุชื่อ";
  const message = clean(body.message, MESSAGE_MAX);

  if (message.length < 2) {
    return NextResponse.json(
      { error: "พิมพ์ข้อความอย่างน้อย 2 ตัวอักษร · Message is too short" },
      { status: 400 }
    );
  }

  const ip = clientIp(request.headers);
  const ipHash = await hashIp(ip);
  const userAgent = (request.headers.get("user-agent") ?? "").slice(0, 300);

  try {
    const [blocked] = await sql`select 1 from blocked_ips where ip_hash = ${ipHash} limit 1`;
    if (blocked) {
      return NextResponse.json(
        { error: "คุณถูกระงับการแสดงความคิดเห็น · You are blocked from commenting" },
        { status: 403 }
      );
    }

    const [{ recent }] = await sql`
      select count(*)::int as recent
      from comments
      where ip_hash = ${ipHash} and created_at > now() - interval '1 hour'
    `;
    if (recent >= RATE_LIMIT) {
      return NextResponse.json(
        { error: "ส่งบ่อยเกินไป ลองใหม่ในอีก 1 ชั่วโมง · Too many comments, try again later" },
        { status: 429 }
      );
    }

    const [row] = await sql`
      insert into comments (name, message, ip, ip_hash, user_agent)
      values (${name}, ${message}, ${ip}, ${ipHash}, ${userAgent})
      returning id, name, message, created_at
    `;
    return NextResponse.json({ ok: true, comment: row }, { status: 201 });
  } catch (error) {
    console.error("comments POST:", error);
    return NextResponse.json({ error: "บันทึกไม่สำเร็จ · Could not save" }, { status: 500 });
  }
}
