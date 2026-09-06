// Creates (or updates) the Neon schema. Safe to re-run.
//   DATABASE_URL=postgres://... npm run db:setup
import { neon } from "@neondatabase/serverless";
import { readFileSync, existsSync } from "node:fs";

// Minimal .env.local reader so the script works without extra dependencies.
if (!process.env.DATABASE_URL && existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Put your Neon connection string in .env.local first.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

const statements = [
  `create table if not exists visits (
     id bigserial primary key,
     day date not null default current_date,
     visitor_hash text not null,
     created_at timestamptz not null default now()
   )`,
  `create unique index if not exists visits_daily_unique on visits (day, visitor_hash)`,
  `create index if not exists visits_day_idx on visits (day)`,

  `create table if not exists comments (
     id bigserial primary key,
     name text not null,
     message text not null,
     ip text,
     ip_hash text not null,
     user_agent text,
     hidden boolean not null default false,
     created_at timestamptz not null default now()
   )`,
  `create index if not exists comments_created_idx on comments (created_at desc)`,
  `create index if not exists comments_ip_hash_idx on comments (ip_hash)`,

  // one row per recurring event; `meta` carries the rift-egg banner index
  `create table if not exists event_anchor (
     key text primary key,
     next_at timestamptz not null,
     period_seconds int not null,
     meta int,
     updated_at timestamptz not null default now()
   )`,
  `drop table if exists rift_anchor`,

  // one row per browser that opted into push
  `create table if not exists push_subs (
     endpoint text primary key,
     p256dh text not null,
     auth text not null,
     user_agent text,
     created_at timestamptz not null default now()
   )`,
  // guards against sending twice for the same opening when the cron overlaps
  `create table if not exists push_log (
     bucket bigint primary key,
     sent_at timestamptz not null default now(),
     recipients int not null default 0
   )`,

  `create table if not exists blocked_ips (
     ip_hash text primary key,
     ip text,
     reason text,
     created_at timestamptz not null default now()
   )`,
];

for (const statement of statements) {
  await sql.query(statement);
  console.log("✓", statement.split("\n")[0].trim());
}

const [{ visits }] = await sql`select count(*)::int as visits from visits`;
const [{ comments }] = await sql`select count(*)::int as comments from comments`;
console.log(`\nschema ready — ${visits} visits, ${comments} comments`);
