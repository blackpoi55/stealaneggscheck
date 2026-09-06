"use client";

export default function Switch({
  checked,
  onChange,
  label,
  hint,
  title,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  hint?: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      title={title}
      className="flex items-center gap-2.5 rounded-xl px-1 py-1 text-left transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-candy-500"
    >
      <span
        aria-hidden
        className={`relative h-[22px] w-[38px] shrink-0 rounded-full transition-colors duration-200 ${
          checked ? "bg-mint-600" : "bg-surface-3"
        }`}
      >
        <span
          className={`absolute top-[3px] h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200 ${
            checked ? "left-[19px]" : "left-[3px]"
          }`}
        />
      </span>
      <span className="min-w-0">
        <span className="block text-[12.5px] font-medium leading-tight text-ink">{label}</span>
        {hint && <span className="block text-[10.5px] leading-tight text-ink-3">{hint}</span>}
      </span>
    </button>
  );
}
