/* SweetParadise egg guide — offline support.
   Bump CACHE when the caching rules change; old caches are dropped on activate. */
const CACHE = "sp-eggs-v3";
const OFFLINE_URL = "/";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.add(new Request(OFFLINE_URL, { cache: "reload" })))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/** Artwork, built chunks and fonts never change under a given URL. */
const isImmutable = (url) =>
  url.pathname.startsWith("/img/") ||
  url.pathname.startsWith("/icons/") ||
  url.pathname.startsWith("/_next/static/") ||
  url.pathname.startsWith("/_next/image");

// A push arrives even with the site closed; the browser wakes this worker
// just long enough to show something, which it requires us to do.
self.addEventListener("push", (event) => {
  let payload = {
    title: "ประตูบอสใกล้เปิดแล้ว",
    body: "Boss rift opens in 1 minute",
    url: "/#boss",
  };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    // not JSON — keep the defaults
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      tag: "sp-boss",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-32.png",
      lang: "th",
      data: { url: payload.url },
    })
  );
});

// Tapping a timer notification should bring the site forward rather than
// opening a second copy of it.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) return client.focus();
      }
      return self.clients.openWindow(event.notification.data?.url ?? "/#boss");
    })
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Pages: fresh when online, last-known copy when not.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(OFFLINE_URL, copy));
          return res;
        })
        .catch(() => caches.match(OFFLINE_URL).then((r) => r ?? Response.error()))
    );
    return;
  }

  if (!isImmutable(url)) return;

  // Assets: serve from cache, refill in the background.
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const hit = await cache.match(request);
      const network = fetch(request)
        .then((res) => {
          if (res.ok) cache.put(request, res.clone());
          return res;
        })
        .catch(() => hit);
      return hit ?? network;
    })
  );
});
