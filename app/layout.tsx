import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Serif_TC } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { runMigrations } from "@/lib/db";
import { logger } from "@/lib/logger";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSerifTC = Noto_Serif_TC({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Flywheel — 你的 AI 市場情報助理",
    template: "%s | Flywheel",
  },
  description: "每天早上 8 點，把全球信號提煉成你今天可以行動的 3–5 件事，直達 Telegram。不是新聞摘要，是帶「為什麼是現在」和「第一步怎麼做」的行動清單。",
  keywords: ["市場情報", "AI 助理", "機會雷達", "信號掃描", "Telegram 推送", "創業", "投資機會"],
  authors: [{ name: "Flywheel" }],
  metadataBase: new URL("https://flywheelsea.club"),
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: "https://flywheelsea.club",
    siteName: "Flywheel",
    title: "Flywheel — 你的 AI 市場情報助理",
    description: "每天早 8 點，把全球信號提煉成可執行行動清單，直達 Telegram。",
    images: [
      {
        url: "/og-image",
        width: 1200,
        height: 630,
        alt: "Flywheel — AI 市場情報助理",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Flywheel — 你的 AI 市場情報助理",
    description: "每天早 8 點，把全球信號提煉成可執行行動清單，直達 Telegram。",
    images: ["/og-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

// Run migrations once on server startup
if (typeof window === "undefined") {
  try { runMigrations(); } catch(e) { logger.error("layout", "DB migration failed", { error: e instanceof Error ? e.message : String(e) }); }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="zh-TW" className={`dark ${notoSerifTC.variable}`}>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-900 text-slate-100 min-h-screen`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
