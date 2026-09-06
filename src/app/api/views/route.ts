import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { clientIp, hashIp } from "@/lib/ip";

export const dynamic = "force-dynamic";

async function stats() {
  if (!sql) return null;
  const [row] = await sql`
    select
      count(*)::int                                                   as total,
      count(*) filter (where day = current_date)::int                 as today,
      count(distinct visitor_hash) filter (where day >= current_date - 6)::int as week
    from visits
  `;
  return row as { total: number; today: number; week: number };
}

export async function GET() {
  const data = await stats();
  if (!data) return NextResponse.json({ enabled: false }, { status: 200 });
  return NextResponse.json({ enabled: true, ...data });
}

/** Records one visit per visitor per day, then returns the running totals. */
export async function POST(request: Request) {
  if (!sql) return NextResponse.json({ enabled: false }, { status: 200 });

  try {
    const visitor = await hashIp(
      `${clientIp(request.headers)}|${request.headers.get("user-agent") ?? ""}`
    );
    await sql`
      insert into visits (visitor_hash) values (${visitor})
      on conflict (day, visitor_hash) do nothing
    `;
    const data = await stats();
    return NextResponse.json({ enabled: true, ...data });
  } catch (error) {
    console.error("views:", error);
    return NextResponse.json({ enabled: false }, { status: 200 });
  }
}
