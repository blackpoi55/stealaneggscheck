/**
 * Desktop / mobile notifications for the event timers.
 *
 * Shown through the service worker registration when one exists, which is what
 * makes them appear from an installed PWA; a plain `new Notification()` is the
 * fallback for a normal tab (and for dev, where no worker is registered).
 *
 * These fire while the page is running — foreground or a backgrounded tab.
 * Alerting a fully closed app would need Web Push plus a server sending them
 * on a schedule, which is a different piece of work.
 */

export const notificationsSupported = () =>
  typeof window !== "undefined" && "Notification" in window;

export const notificationPermission = (): NotificationPermission | "unsupported" =>
  notificationsSupported() ? Notification.permission : "unsupported";

/** Must be called from a click — browsers reject an unprompted request. */
export async function requestNotifications(): Promise<boolean> {
  if (!notificationsSupported()) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  try {
    return (await Notification.requestPermission()) === "granted";
  } catch {
    return false;
  }
}

export async function notify(title: string, body: string, tag = "sp-event") {
  if (!notificationsSupported() || Notification.permission !== "granted") return;

  const options: NotificationOptions = {
    body,
    tag, // a repeat replaces the previous one instead of stacking
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-32.png",
    lang: "th",
  };

  try {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        // the only path that works from an installed PWA
        await registration.showNotification(title, options);
        return;
      }
    }
    new Notification(title, options);
  } catch {
    // notification blocked or unavailable — the on-page countdown still shows
  }
}
