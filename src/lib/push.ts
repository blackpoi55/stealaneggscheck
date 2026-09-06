/**
 * Web Push — alerts that arrive with the site closed.
 *
 * The in-page Notification API (see notify.ts) only fires while the tab or PWA
 * is running. This registers the browser with its vendor's push service so the
 * server can reach it later; the `push` handler in public/sw.js shows it.
 *
 * On iOS this only works once the site is installed to the home screen
 * (iOS 16.4+). Android and desktop work from an ordinary tab.
 */

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

export const pushSupported = () =>
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  PUBLIC_KEY !== "";

/**
 * `navigator.serviceWorker.ready` never settles when nothing is registered —
 * on the dev server, where registration is skipped, awaiting it hangs forever
 * and the caller silently does nothing. Race it against a timeout.
 */
async function readyRegistration(timeoutMs = 5000) {
  if (!("serviceWorker" in navigator)) return null;
  const existing = await navigator.serviceWorker.getRegistration();
  if (existing) return existing;
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
  ]);
}

/** The applicationServerKey has to be raw bytes, not the base64url string. */
function decodeKey(base64url: string) {
  const padded = (base64url + "=".repeat((4 - (base64url.length % 4)) % 4))
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const raw = atob(padded);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

/** Returns true once the server has the subscription stored. */
export async function subscribeToPush(): Promise<boolean> {
  if (!pushSupported()) return false;
  try {
    const registration = await readyRegistration();
    if (!registration) return false;
    const existing = await registration.pushManager.getSubscription();
    const subscription =
      existing ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true, // required: every push must show a notification
        applicationServerKey: decodeKey(PUBLIC_KEY),
      }));

    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(subscription.toJSON()),
    });
    return res.ok;
  } catch {
    // permission withdrawn, no worker, or the vendor's service refused
    return false;
  }
}

export async function unsubscribeFromPush() {
  if (!pushSupported()) return;
  try {
    const registration = await readyRegistration();
    if (!registration) return;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;
    await fetch("/api/push/subscribe", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });
    await subscription.unsubscribe();
  } catch {
    // nothing to clean up
  }
}
