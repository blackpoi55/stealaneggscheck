/**
 * Visitor identification for counting and abuse control.
 *
 * The raw IP is kept server-side only (admin view + blocklist); everything the
 * app matches on uses a salted SHA-256 so the stored identifier is useless on
 * its own. Set IP_SALT in production — changing it resets every existing hash.
 */

const SALT = process.env.IP_SALT ?? "sweetparadise-dev-salt";

/** Works in both the Node and Edge runtimes (Web Crypto). */
export async function hashIp(ip: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${SALT}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("cf-connecting-ip") ?? headers.get("x-real-ip") ?? "0.0.0.0";
}
