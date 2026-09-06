/**
 * "Eggs I already own" — a set of egg ids kept in localStorage.
 *
 * Exposed as an external store so components can read it with
 * useSyncExternalStore: no state to hydrate, no flash of an empty checklist,
 * and other tabs stay in sync through the `storage` event.
 */

const KEY = "sp-collected";
const EMPTY: ReadonlySet<string> = new Set();

let cache: ReadonlySet<string> | null = null;
const listeners = new Set<() => void>();

function load(): ReadonlySet<string> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    return new Set(parsed.filter((v): v is string => typeof v === "string"));
  } catch {
    return EMPTY;
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function onStorage(e: StorageEvent) {
  if (e.key !== KEY) return;
  cache = null;
  emit();
}

function commit(next: ReadonlySet<string>) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify([...next]));
  } catch {
    // private mode — the checklist just won't survive a reload
  }
  emit();
}

export function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

/** Stable between renders until something actually changes. */
export function getSnapshot(): ReadonlySet<string> {
  return (cache ??= load());
}

export function getServerSnapshot(): ReadonlySet<string> {
  return EMPTY;
}

export function toggle(id: string) {
  const next = new Set(getSnapshot());
  if (!next.delete(id)) next.add(id);
  commit(next);
}

export function replaceAll(ids: Iterable<string>) {
  commit(new Set(ids));
}

export function clearAll() {
  commit(EMPTY);
}
