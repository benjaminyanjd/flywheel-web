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
        </Link>
        <div className="flex items-center gap-6">
          {!hideLogin && (
            <Link href="/sign-in" className="text-sm transition-colors hover:text-[var(--text-primary)]" style={{ color: "var(--text-secondary)" }}>
              {t("landing_login")}
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
