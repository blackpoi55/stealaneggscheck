import type { Egg } from "@/data/steal-an-egg";

/**
 * Angels & Demons shows one side per night, so the side decides whether an
 * egg can spawn at all tonight — worth a label wherever the egg appears.
 */
export default function SideBadge({ side, className = "" }: { side: Egg["side"]; className?: string }) {
  if (!side) return null;
  const angel = side === "angel";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-[3px] text-[10px] font-semibold ${
        angel ? "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300" : "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300"
      } ${className}`}
    >
      <span aria-hidden>{angel ? "☀️" : "🔥"}</span>
      {angel ? "นางฟ้า · Angel" : "ปีศาจ · Demon"}
    </span>
  );
}
