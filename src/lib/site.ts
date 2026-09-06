/**
 * Absolute base URL, used for canonical links, the sitemap and OG tags.
 * Set NEXT_PUBLIC_SITE_URL in production; Vercel's own env var is the fallback.
 */
const fromEnv =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const SITE_URL = new URL(fromEnv);

export const absolute = (path: string) => new URL(path, SITE_URL).toString();
