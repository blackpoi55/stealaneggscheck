import { NextResponse, type NextRequest } from "next/server";
import { neon } from "@neondatabase/serverless";
import { clientIp, hashIp } from "@/lib/ip";

/**
 * Keeps blocked addresses out of the site itself, not just the comment form.
 *
 * The list is cached in memory for a minute so a normal page view costs no
 * database round trip, and any database trouble fails open — a broken
 * connection must never lock real players out.
 */
const TTL_MS = 60_000;
let cache: { at: number; hashes: Set<string> } | null = null;

async function blockedHashes(): Promise<Set<string>> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.hashes;
  const url = process.env.DATABASE_URL;
  if (!url) return new Set();

  const sql = neon(url);
  const rows = (await sql`select ip_hash from blocked_ips`) as { ip_hash: string }[];
  cache = { at: Date.now(), hashes: new Set(rows.map((r) => r.ip_hash)) };
  return cache.hashes;
}

export async function middleware(request: NextRequest) {
  if (!process.env.DATABASE_URL) return NextResponse.next();

  try {
    const hashes = await blockedHashes();
    if (hashes.size === 0) return NextResponse.next();

    const hash = await hashIp(clientIp(request.headers));
    if (!hashes.has(hash)) return NextResponse.next();

    return new NextResponse(
      `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
       <title>ถูกระงับการเข้าถึง · Access blocked</title>
       <style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0d0c10;color:#f6f4f8;
       font-family:system-ui,sans-serif;text-align:center;padding:2rem;line-height:1.6}</style>
       <div><h1 style="font-size:1.5rem;margin:0 0 .5rem">ถูกระงับการเข้าถึง</h1>
       <p style="color:#a09aa8;margin:0">Access to this site has been blocked.</p></div>`,
      { status: 403, headers: { "content-type": "text/html; charset=utf-8" } }
    );
  } catch {
    // database unreachable — let everyone through rather than locking the site
    return NextResponse.next();
  }
}

export const config = {
  // page views only: skip static assets, the API and Next's internals
  matcher: ["/((?!api|_next/static|_next/image|icons|img|sw.js|favicon.ico|manifest.webmanifest).*)"],
};
