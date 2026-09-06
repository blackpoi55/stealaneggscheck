"use client";

import { useEffect, useState } from "react";

interface Comment {
  id: number | string;
  name: string;
  message: string;
  created_at: string;
}

const NAME_MAX = 40;
const MESSAGE_MAX = 800;

function timeAgo(iso: string) {
  const secs = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return "เมื่อครู่ · just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} นาทีที่แล้ว · ${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว · ${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days} วันที่แล้ว · ${days}d ago`;
}

export default function Comments() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/comments")
      .then((r) => r.json())
      .then((data: { enabled: boolean; comments?: Comment[] }) => {
        if (!alive) return;
        setEnabled(data.enabled);
        setComments(data.comments ?? []);
      })
      .catch(() => alive && setEnabled(false));
    return () => {
      alive = false;
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending || message.trim().length < 2) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, message, website }),
      });
      const data = (await res.json()) as { comment?: Comment; error?: string };
      if (!res.ok) {
        setError(data.error ?? "ส่งไม่สำเร็จ · Could not send");
        return;
      }
      if (data.comment) setComments((prev) => [data.comment!, ...prev]);
      setMessage("");
      setSent(true);
    } catch {
      setError("เชื่อมต่อไม่ได้ · Network error");
    } finally {
      setSending(false);
    }
  };

  if (enabled === false) return null;

  return (
    <section id="feedback" className="border-t rule">
      <div className="mx-auto max-w-[820px] px-4 py-20 sm:px-6">
      <div className="text-center">
        <p className="text-[12px] uppercase tracking-[0.14em] text-ink-3">
          ความคิดเห็น · Feedback
        </p>
        <h2 className="display mx-auto mt-2 text-[2rem] text-ink sm:text-[2.6rem]">
          อยากให้เพิ่มอะไรบอกได้เลย
        </h2>
        <p className="headline mt-1 text-[1.05rem] text-ink-2 sm:text-[1.3rem]">
          Tell us what to add next
        </p>
      </div>

      <form onSubmit={submit} className="card mt-8 rounded-[22px] p-4 sm:p-5">
        <label className="block">
          <span className="text-[12px] text-ink-3">ชื่อ · Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={NAME_MAX}
            placeholder="ใส่ชื่อในเกมก็ได้ · your Roblox name is fine"
            className="mt-1 w-full rounded-xl bg-surface-2 px-3.5 py-2.5 text-[14px] text-ink outline-none transition placeholder:text-ink-3 focus:ring-2 focus:ring-candy-500"
          />
        </label>

        <label className="mt-3 block">
          <span className="flex items-baseline justify-between text-[12px] text-ink-3">
            <span>ข้อความ / ข้อเสนอแนะ · Message</span>
            <span className="num">
              {message.length}/{MESSAGE_MAX}
            </span>
          </span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={MESSAGE_MAX}
            rows={4}
            required
            placeholder="อยากให้เพิ่มอะไร หรือเจอข้อมูลผิดตรงไหน บอกได้เลย · Spotted wrong data, or want a feature?"
            className="mt-1 w-full resize-y rounded-xl bg-surface-2 px-3.5 py-2.5 text-[14px] leading-relaxed text-ink outline-none transition placeholder:text-ink-3 focus:ring-2 focus:ring-candy-500"
          />
        </label>

        {/* honeypot — hidden from people, irresistible to bots */}
        <input
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="hidden"
        />

        {error && (
          <p className="mt-3 rounded-xl bg-candy-500/10 px-3.5 py-2.5 text-[13px] text-candy-600">{error}</p>
        )}
        {sent && !error && (
          <p className="mt-3 rounded-xl bg-mint-600/12 px-3.5 py-2.5 text-[13px] text-mint-600">
            ส่งแล้ว ขอบคุณมาก! · Sent, thank you!
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-sm text-[11px] leading-relaxed text-ink-3">
            ระบบบันทึกหมายเลข IP ไว้เพื่อป้องกันการก่อกวน ไม่แสดงต่อสาธารณะ ·
            Your IP is recorded for abuse prevention and is never shown publicly.
          </p>
          <button
            type="submit"
            disabled={sending || message.trim().length < 2}
            className="rounded-full bg-candy-500 px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-candy-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {sending ? "กำลังส่ง…" : "ส่งความคิดเห็น · Send"}
          </button>
        </div>
      </form>

      {comments.length > 0 && (
        <ul className="mt-6 space-y-2.5">
          {comments.map((c) => (
            <li key={c.id} className="card rounded-[18px] p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="headline text-[14.5px] text-ink">{c.name}</span>
                <span className="text-[11.5px] text-ink-3">{timeAgo(c.created_at)}</span>
              </div>
              <p className="mt-1.5 whitespace-pre-wrap break-words text-[13.5px] leading-relaxed text-ink-2">
                {c.message}
              </p>
            </li>
          ))}
        </ul>
      )}

      {enabled && comments.length === 0 && (
        <p className="mt-6 text-center text-[13px] text-ink-3">
          ยังไม่มีความคิดเห็น มาเป็นคนแรกกันเถอะ · No comments yet — be the first.
        </p>
      )}
      </div>
    </section>
  );
}
