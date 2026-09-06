import { neon } from "@neondatabase/serverless";

/**
 * Neon connection, or `null` when DATABASE_URL is not set — the site is still
 * fully usable without a database, the visitor counter and comments just
 * report themselves as unavailable instead of crashing the page.
 */
export const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

export const dbReady = sql !== null;
