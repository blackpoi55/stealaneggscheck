"use client";

import { useCallback, useState } from "react";

interface AdminComment {
  id: number | string;
  name: string;
  message: string;
  ip: string | null;
  ip_hash: string;
  hidden: boolean;
  created_at: string;
}

interface Block {
  ip_hash: string;
  ip: string | null;
  reason: string | null;
  created_at: string;
}

interface AdminData {
  comments: AdminComment[];
  blocks: Block[];
  views: { total: number; today: number };
  rift: { configured: boolean; currentBanner?: number; secondsToRotation?: number };
}

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [minutesLeft, setMinutesLeft] = useState("");
  const [currentBanner, setCurrentBanner] = useState("1");

  const load = useCallback(
    async (t: string) => {
      setBusy(true);
      setError(null);
      try {
        const res = await fetch("/api/admin", { headers: { "x-admin-token": t } });
        const body = await res.json();
        if (!res.ok) {
          setError(body.error ?? "เข้าไม่ได้");
          setData(null);
          return;
        }
        setData(body as AdminData);
      } catch {
        setError("เชื่อมต่อไม่ได้ · Network error");
      } finally {
        setBusy(false);
      }
    },
    []
  );

  const act = async (payload: Record<string, unknown>) => {
    setBusy(true);
    await fetch("/api/admin", {
      method: "POST",
      headers: { "content-type": "application/json", "x-admin-token": token },
      body: JSON.stringify(payload),
    });
    await load(token);
  };

  return (
    <main className="mx-auto max-w-[900px] px-4 py-10 sm:px-6">
      <h1 className="display text-[1.8rem] text-ink">แผงควบคุม · Moderation</h1>
      <p className="mt-1 text-[13px] text-ink-3">
        ใส่ ADMIN_TOKEN เพื่อดูความคิดเห็นทั้งหมด ซ่อน/ลบ และบล็อก IP
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void load(token);
        }}
        className="mt-4 flex gap-2"
      >
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="ADMIN_TOKEN"
          className="flex-1 rounded-xl bg-surface-2 px-3.5 py-2.5 text-[14px] text-ink outline-none focus:ring-2 focus:ring-candy-500"
        />
        <button
          type="submit"
          disabled={busy || !token}
          className="rounded-xl bg-candy-500 px-5 text-[14px] font-semibold text-white transition hover:bg-candy-600 disabled:opacity-40"
        >
          เข้าสู่ระบบ
        </button>
      </form>

      {error && <p className="mt-3 text-[13px] text-candy-600">{error}</p>}

      {data && (
        <>
          <p className="num mt-6 text-[14px] text-ink-2">
            ผู้เข้าชมทั้งหมด <b className="text-ink">{data.views.total.toLocaleString()}</b> · วันนี้{" "}
            <b className="text-ink">{data.views.today.toLocaleString()}</b>
          </p>

          <section className="card mt-6 rounded-2xl p-4">
            <h2 className="headline text-[17px] text-ink">ตัวจับเวลา Rift</h2>
            <p className="mt-1 text-[12.5px] text-ink-3">
              {data.rift.configured
                ? `ตอนนี้ชุดที่ ${data.rift.currentBanner} · เปลี่ยนในอีก ${Math.floor((data.rift.secondsToRotation ?? 0) / 60)} นาที`
                : "ยังไม่ได้ตั้ง — เปิดเกมดูว่าเหลืออีกกี่นาทีและตอนนี้เป็นชุดไหน"}
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void act({
                  action: "rift",
                  minutesLeft: Number(minutesLeft),
                  currentBanner: Number(currentBanner),
                });
              }}
              className="mt-3 flex flex-wrap items-end gap-2"
            >
              <label className="text-[12px] text-ink-3">
                เหลืออีก (นาที)
                <input
                  type="number"
                  min={0}
                  max={180}
                  required
                  value={minutesLeft}
                  onChange={(e) => setMinutesLeft(e.target.value)}
                  className="mt-1 block w-28 rounded-xl bg-surface-2 px-3 py-2 text-[14px] text-ink outline-none focus:ring-2 focus:ring-candy-500"
                />
              </label>
              <label className="text-[12px] text-ink-3">
                ตอนนี้ชุดที่
                <select
                  value={currentBanner}
                  onChange={(e) => setCurrentBanner(e.target.value)}
                  className="mt-1 block w-24 rounded-xl bg-surface-2 px-3 py-2 text-[14px] text-ink outline-none focus:ring-2 focus:ring-candy-500"
                >
                  <option value="1">ชุด 1</option>
                  <option value="2">ชุด 2</option>
                  <option value="3">ชุด 3</option>
                </select>
              </label>
              <button
                type="submit"
                disabled={busy}
                className="rounded-xl bg-candy-500 px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-candy-600 disabled:opacity-40"
              >
                บันทึก
              </button>
            </form>
          </section>

          <h2 className="headline mt-8 text-[17px] text-ink">
            ความคิดเห็น <span className="num text-ink-3">({data.comments.length})</span>
          </h2>
          <ul className="mt-3 space-y-2">
            {data.comments.map((c) => (
              <li key={c.id} className={`card rounded-2xl p-4 ${c.hidden ? "opacity-50" : ""}`}>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="headline text-[14.5px] text-ink">{c.name}</span>
                  <span className="num text-[11.5px] text-ink-3">{c.ip ?? "—"}</span>
                  <span className="text-[11.5px] text-ink-3">
                    {new Date(c.created_at).toLocaleString("th-TH")}
                  </span>
                  {c.hidden && <span className="text-[11.5px] text-candy-600">ซ่อนอยู่</span>}
                </div>
                <p className="mt-1.5 whitespace-pre-wrap break-words text-[13.5px] text-ink-2">
                  {c.message}
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void act({ action: c.hidden ? "show" : "hide", id: c.id })}
                    className="rounded-full bg-surface-3 px-3 py-1.5 text-[12px] font-medium text-ink transition hover:bg-surface-2"
                  >
                    {c.hidden ? "แสดง" : "ซ่อน"}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      confirm("บล็อก IP นี้? ความคิดเห็นเดิมจะถูกซ่อนทั้งหมด") &&
                      void act({ action: "block", ipHash: c.ip_hash, ip: c.ip, reason: "spam" })
                    }
                    className="rounded-full bg-surface-3 px-3 py-1.5 text-[12px] font-medium text-candy-600 transition hover:bg-surface-2"
                  >
                    บล็อก IP
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => confirm("ลบถาวร?") && void act({ action: "delete", id: c.id })}
                    className="rounded-full px-3 py-1.5 text-[12px] font-medium text-ink-3 transition hover:text-candy-600"
                  >
                    ลบ
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <h2 className="headline mt-8 text-[17px] text-ink">
            IP ที่ถูกบล็อก <span className="num text-ink-3">({data.blocks.length})</span>
          </h2>
          <ul className="mt-3 space-y-2">
            {data.blocks.map((b) => (
              <li key={b.ip_hash} className="card flex items-center gap-3 rounded-2xl p-3">
                <span className="num flex-1 truncate text-[13px] text-ink">{b.ip ?? b.ip_hash}</span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void act({ action: "unblock", ipHash: b.ip_hash })}
                  className="rounded-full bg-surface-3 px-3 py-1.5 text-[12px] font-medium text-ink transition hover:bg-surface-2"
                >
                  ปลดบล็อก
                </button>
              </li>
            ))}
            {data.blocks.length === 0 && <li className="text-[13px] text-ink-3">ยังไม่มี</li>}
          </ul>
        </>
      )}
    </main>
  );
}
