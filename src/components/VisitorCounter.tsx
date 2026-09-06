"use client";

import { useEffect, useState } from "react";

interface Views {
  enabled: boolean;
  total?: number;
  today?: number;
  week?: number;
}

const SESSION_KEY = "sp-visit-sent";
const fmt = (n: number) => n.toLocaleString("en-US");

export default function VisitorCounter() {
  const [views, setViews] = useState<Views | null>(null);

  useEffect(() => {
    let alive = true;

    // POST records the visit (deduplicated per day server-side) and returns the
    // totals; on a repeat view in the same tab just read them.
    let counted = false;
    try {
      counted = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      // private mode — count it, the server dedupes anyway
    }

    fetch("/api/views", { method: counted ? "GET" : "POST" })
      .then((r) => r.json())
      .then((data: Views) => {
        if (!alive) return;
        setViews(data);
        try {
          sessionStorage.setItem(SESSION_KEY, "1");
        } catch {
          // ignore
        }
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, []);

  if (!views?.enabled) return null;

  return (
    <dl className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[12.5px] text-ink-3">
      <div className="flex items-baseline gap-1.5">
        <dt>ผู้เข้าชมทั้งหมด · Total</dt>
        <dd className="num font-semibold text-ink">{fmt(views.total ?? 0)}</dd>
      </div>
      <div className="flex items-baseline gap-1.5">
        <dt>วันนี้ · Today</dt>
        <dd className="num font-semibold text-ink">{fmt(views.today ?? 0)}</dd>
      </div>
      <div className="flex items-baseline gap-1.5">
        <dt>7 วัน · 7 days</dt>
        <dd className="num font-semibold text-ink">{fmt(views.week ?? 0)}</dd>
      </div>
    </dl>
  );
}
