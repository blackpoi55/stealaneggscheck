"use client";

import { useSyncExternalStore } from "react";

const ROOT_CLASS = "dark";
const STORAGE_KEY = "sp-theme";

/** The <html> class is the source of truth — layout.tsx sets it before paint. */
function subscribe(onChange: () => void) {
  const obs = new MutationObserver(onChange);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => obs.disconnect();
}

const getSnapshot = () => document.documentElement.classList.contains(ROOT_CLASS);

export default function ThemeToggle({ className = "" }: { className?: string }) {
  // `false` on the server: the icon is hidden until hydration either way.
  const isDark = useSyncExternalStore(subscribe, getSnapshot, () => false);
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  const toggle = () => {
    const next = !isDark;
    document.documentElement.classList.toggle(ROOT_CLASS, next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // private mode — the choice just won't persist
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
