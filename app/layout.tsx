import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Serif_TC } from "next/font/google";
import { ClerkLocalizedProvider } from "@/components/clerk-localized-provider";
import { ThemeProvider } from "next-themes";
import { PostHogProvider } from "@/components/posthog-provider";
import { runMigrations } from "@/lib/db";
import { logger } from "@/lib/logger";
import { Footer } from "@/components/footer";
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
    default: "嗅鐘 — 跳過認知負擔，直接行動",
    template: "%s | 嗅鐘",
  },
  description: "AI 個人化過濾全網信號，直接告訴你為什麼是現在、第一步怎麼做。280+ 信號源即時掃描，機會窗口開著就推。7 天免費試用。",
  authors: [{ name: "嗅鐘" }],
  metadataBase: new URL("https://sniffingclock.club"),
  alternates: {
    canonical: "https://sniffingclock.club",
    languages: {
      "zh-TW": "https://sniffingclock.club",
      "en": "https://sniffingclock.club",
    },
  },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: "https://sniffingclock.club",
    siteName: "嗅鐘",
    title: "嗅鐘 — 跳過認知負擔，直接行動",
    description: "AI 個人化過濾全網信號，直接告訴你為什麼是現在、第一步怎麼做。280+ 信號源即時掃描，機會窗口開著就推。7 天免費試用。",
    images: [
      {
        url: "/og-image",
        width: 1200,
        height: 630,
        alt: "嗅鐘 — 跳過認知負擔，直接行動",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "嗅鐘 — 跳過認知負擔，直接行動",
    description: "AI 個人化過濾全網信號，直接告訴你為什麼是現在、第一步怎麼做。280+ 信號源即時掃描，機會窗口開著就推。7 天免費試用。",
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
    <ClerkLocalizedProvider>
      <html lang="zh-TW" className={`${notoSerifTC.variable}`} suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
          style={{ backgroundColor: "var(--bg)", color: "var(--text-primary)" }}
        >
          <PostHogProvider>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
              <div className="flex flex-col min-h-screen">
                <div className="flex-1 flex flex-col">{children}</div>
                <Footer />
              </div>
            </ThemeProvider>
          </PostHogProvider>
        </body>
      </html>
    </ClerkLocalizedProvider>
  );
}
