"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "sp-theme";

/**
 * The <html> class is the source of truth: `dark` / `light` when the visitor
 * has chosen, otherwise neither and the OS setting decides (see globals.css).
 * layout.tsx replays the stored choice before first paint.
 */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

  // with no explicit choice the OS drives the theme, so watch that too
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onChange);

  // another tab may have changed the saved preference
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    apply(e.newValue === "dark" ? "dark" : e.newValue === "light" ? "light" : null);
  };
  window.addEventListener("storage", onStorage);

  return () => {
    observer.disconnect();
    media.removeEventListener("change", onChange);
    window.removeEventListener("storage", onStorage);
  };
}

const noopSubscribe = () => () => {};

/** Whatever the visitor actually sees right now. */
function getSnapshot() {
  const root = document.documentElement;
  if (root.classList.contains("dark")) return true;
  if (root.classList.contains("light")) return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function apply(theme: "dark" | "light" | null) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
}

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, () => false);
  // the server cannot know the theme, so the icon stays blank until hydration
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const toggle = () => {
    const next = isDark ? "light" : "dark";
    apply(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // private mode — the choice just won't survive a reload
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "สลับเป็นโหมดสว่าง / Switch to light mode" : "สลับเป็นโหมดมืด / Switch to dark mode"}
      title={isDark ? "โหมดสว่าง · Light" : "โหมดมืด · Dark"}
      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-2 transition hover:bg-surface-3 hover:text-ink ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth="1.8">
        {!mounted ? null : isDark ? (
          <path
            d="M20.5 14.4A8.5 8.5 0 1 1 9.6 3.5a7 7 0 0 0 10.9 10.9Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <>
            <circle cx="12" cy="12" r="4.2" />
            <path
              d="M12 2.6v2M12 19.4v2M2.6 12h2M19.4 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4"
              strokeLinecap="round"
            />
          </>
        )}
      </svg>
    </button>
  );
}
