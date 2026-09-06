import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Which pieces of configuration the running deployment actually has.
 *
 * Reports presence only, never a value, so it is safe to leave open — and it
 * turns "why is this 503" into one glance during setup, where the alternative
 * is reading a response body a cron dashboard may not even save.
 */
export async function GET() {
  const present = (name: string) => Boolean(process.env[name]);

  const env = {
    DATABASE_URL: present("DATABASE_URL"),
    IP_SALT: present("IP_SALT"),
    ADMIN_TOKEN: present("ADMIN_TOKEN"),
    NEXT_PUBLIC_SITE_URL: present("NEXT_PUBLIC_SITE_URL"),
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: present("NEXT_PUBLIC_VAPID_PUBLIC_KEY"),
    VAPID_PRIVATE_KEY: present("VAPID_PRIVATE_KEY"),
    VAPID_SUBJECT: present("VAPID_SUBJECT"),
    CRON_SECRET: present("CRON_SECRET"),
  };

  let database: "ok" | "unreachable" | "not configured" = "not configured";
  if (sql) {
    try {
      await sql`select 1`;
      database = "ok";
    } catch {
      database = "unreachable";
    }
  }

  const features = {
    visitorCounter: env.DATABASE_URL && database === "ok",
    comments: env.DATABASE_URL && database === "ok",
    moderation: env.ADMIN_TOKEN,
    // the public key is inlined at build time, so it must be set before the
    // build that ships — adding it afterwards needs a redeploy
    webPush: env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY && env.CRON_SECRET,
  };

  return NextResponse.json({ env, database, features });
}
