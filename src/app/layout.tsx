import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Thai } from "next/font/google";
import ServiceWorker from "@/components/ServiceWorker";
import { EGGS } from "@/data/steal-an-egg";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoThai = Noto_Sans_Thai({
  subsets: ["thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-thai",
  display: "swap",
});

const TITLE = "ไข่ไหนอยู่ไบโอมไหน · Steal an Egg Biome Guide | SweetParadise";
const DESCRIPTION = `รวมไข่ทั้ง ${EGGS.length} ใบใน Steal an Egg แยกตามไบโอม พร้อมรูปไข่จริง เพ็ตจริง ระดับความหายาก รายได้ต่อวินาที และความเร็วที่ต้องใช้ — All ${EGGS.length} Steal an Egg eggs sorted by biome, with real art, rarity, income and speed requirements. สร้างโดยแมพ SweetParadise.`;

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  alternates: { canonical: "/" },
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "SweetParadise",
  appleWebApp: { capable: true, title: "SweetParadise", statusBarStyle: "default" },
  // Declared explicitly: as soon as `icons` is set, Next stops emitting the
  // link tag for the src/app icon file convention.
  icons: {
    icon: [
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    locale: "th_TH",
    images: [{ url: "/icons/icon-512.png", width: 512, height: 512 }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f4f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0c10" },
  ],
};

/**
 * Replays an explicit theme choice before first paint. Without it the page
 * still renders correctly — globals.css follows the OS by default — this only
 * covers someone who overrode their system setting.
 */
const THEME_BOOTSTRAP = `try{var s=localStorage.getItem("sp-theme");if(s==="dark"||s==="light")document.documentElement.classList.add(s)}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${inter.variable} ${notoThai.variable}`} suppressHydrationWarning>
      <head>
        <script id="theme-bootstrap" dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body>
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
