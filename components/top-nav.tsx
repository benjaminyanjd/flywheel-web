"use client"

import Link from "next/link"
import { FlywheelLogo } from "@/components/flywheel-logo"
import { LangToggle } from "@/components/lang-toggle"
import { ThemeToggle } from "@/components/theme-toggle"
import { useT } from "@/lib/i18n"

interface TopNavProps {
  /** 右側 CTA 按鈕行為，不傳則導向落地頁 */
  ctaHref?: string
  ctaOnClick?: () => void
  /** 不顯示 CTA */
  hideCta?: boolean
  /** 不顯示登入連結 */
  hideLogin?: boolean
}

export function TopNav({ ctaHref = "/", ctaOnClick, hideCta, hideLogin }: TopNavProps) {
  const { t, lang } = useT()

  return (
    <header className="border-b px-6 py-4 w-full" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg)" }}>
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <FlywheelLogo size={33} style={{ color: "var(--signal)" }} />
          <span className="font-bold" style={{ color: "var(--text-primary)" }}>
            {lang === "en" ? "Sniffing Clock" : "嗅鐘"}
          </span>
          <span className="text-xs font-bold hidden sm:inline" style={{ color: "var(--text-primary)" }}>
            {lang === "en" ? "Skip the cognitive burden, take direct action." : "跳過認知負擔，直接行動"}
          </span>
        </Link>
        <div className="flex items-center gap-1">
          {!hideLogin && (
            <Link
              href="/sign-in"
              className="p-2 hover:bg-[var(--bg-card)] rounded-lg transition-colors"
              title={lang === "en" ? "Sign in" : "登入"}
              style={{ color: "var(--text-secondary)" }}
            >
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
            </Link>
          )}
          <LangToggle />
          <ThemeToggle />
          {!hideCta && (
            ctaOnClick ? (
              <button
                onClick={ctaOnClick}
                className="text-sm px-4 py-1.5 rounded-lg transition-all duration-200 font-medium font-mono cursor-pointer hover:opacity-90 active:scale-95"
                style={{ backgroundColor: "var(--signal)", color: "var(--bg)" }}>
                {t("landing_cta")}
              </button>
            ) : (
              <Link
                href={ctaHref}
                className="text-sm px-4 py-1.5 rounded-lg transition-all duration-200 font-medium font-mono cursor-pointer hover:opacity-90 active:scale-95"
                style={{ backgroundColor: "var(--signal)", color: "var(--bg)" }}>
                {t("landing_cta")}
              </Link>
            )
          )}
        </div>
      </div>
    </header>
  )
}
