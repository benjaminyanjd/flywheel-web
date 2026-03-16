import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Serif_TC } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
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
    default: "嗅鐘 — 你的 AI 市場情報助理",
    template: "%s | 嗅鐘",
  },
  description: "每天從 280+ 信號源掃描 500+ 條信號，AI 過濾匹配後，每日早 8 點推送 3-5 個定向可執行機會到你的 Telegram。",
  keywords: ["市場情報", "AI 助理", "機會雷達", "信號掃描", "Telegram 推送", "創業", "投資機會"],
  authors: [{ name: "嗅鐘" }],
  metadataBase: new URL("https://flywheelsea.club"),
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: "https://flywheelsea.club",
    siteName: "嗅鐘",
    title: "嗅鐘 — 你的 AI 市場情報助理",
    description: "每天從 280+ 信號源掃描 500+ 條信號，AI 過濾匹配後，每日早 8 點推送 3-5 個定向可執行機會到你的 Telegram。",
    images: [
      {
        url: "/og-image",
        width: 1200,
        height: 630,
        alt: "嗅鐘 — AI 市場情報助理",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "嗅鐘 — 你的 AI 市場情報助理",
    description: "每天從 280+ 信號源掃描 500+ 條信號，AI 過濾匹配後，每日早 8 點推送 3-5 個定向可執行機會到你的 Telegram。",
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
      <html lang="zh-TW" className={`${notoSerifTC.variable}`} suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
          style={{ backgroundColor: "var(--bg)", color: "var(--text-primary)" }}
        >
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
