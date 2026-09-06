import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

interface Subscription {
  endpoint?: unknown;
  keys?: { p256dh?: unknown; auth?: unknown };
}

/** Stores a browser's push subscription so the server can reach it later. */
export async function POST(request: Request) {
  if (!sql) return NextResponse.json({ error: "no database" }, { status: 503 });

  const body = (await request.json().catch(() => ({}))) as Subscription;
  const endpoint = typeof body.endpoint === "string" ? body.endpoint : "";
  const p256dh = typeof body.keys?.p256dh === "string" ? body.keys.p256dh : "";
  const auth = typeof body.keys?.auth === "string" ? body.keys.auth : "";

  // The endpoint is a URL at the browser vendor's push service.
  if (!endpoint.startsWith("https://") || !p256dh || !auth) {
    return NextResponse.json({ error: "bad subscription" }, { status: 400 });
  }

  try {
    await sql`
      insert into push_subs (endpoint, p256dh, auth, user_agent)
      values (${endpoint}, ${p256dh}, ${auth}, ${(request.headers.get("user-agent") ?? "").slice(0, 300)})
      on conflict (endpoint) do update set p256dh = excluded.p256dh, auth = excluded.auth
    `;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("push subscribe:", error);
    return NextResponse.json({ error: "could not save" }, { status: 500 });
  }
}

/** Called when someone switches alerts off. */
export async function DELETE(request: Request) {
  if (!sql) return NextResponse.json({ error: "no database" }, { status: 503 });

  const body = (await request.json().catch(() => ({}))) as { endpoint?: unknown };
  if (typeof body.endpoint !== "string") {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  await sql`delete from push_subs where endpoint = ${body.endpoint}`;
  return NextResponse.json({ ok: true });
}
