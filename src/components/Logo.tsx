import Image from "next/image";

/**
 * The SweetParadise map artwork. The file is WebP data behind a .png name —
 * next/image sniffs the real format, so it optimises fine either way.
 */
export default function Logo({ className = "h-6 w-6", px = 96 }: { className?: string; px?: number }) {
  return (
    <Image
      src="/img/logo.png"
      alt="SweetParadise"
      width={px}
      height={px}
      sizes={`${px}px`}
      className={`shrink-0 object-cover ${className}`}
      priority
    />
  );
}
