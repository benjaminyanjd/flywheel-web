"use client"

import { useState } from "react"
import Link from "next/link"
import WaitlistForm from "@/components/waitlist-form"
import { FlywheelLogo } from "@/components/flywheel-logo"
import { useT } from "@/lib/i18n"
import { LangToggle } from "@/components/lang-toggle"

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl" style={{ border: "1px solid var(--border)" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center p-4 cursor-pointer font-medium hover:text-[var(--text-primary)] select-none transition-colors text-left"
        style={{ color: "var(--text-secondary)" }}
      >
        {q}
        <span className="ml-2 shrink-0 transition-transform duration-200" style={{ color: "var(--text-muted)", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>↓</span>
      </button>
      <div
        style={{
          display: "grid",
          gridTemplateRows: open ? "1fr" : "0fr",
          transition: "grid-template-rows 200ms ease",
        }}
      >
        <div style={{ overflow: "hidden", minHeight: 0 }}>
          <p className="px-4 pb-4 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{a}</p>
        </div>
      </div>
    </div>
  )
}

interface LandingContentProps {
  userCount: number
  waitlistCount: number
  quotaTotal: number
}

export default function LandingContent({ userCount, waitlistCount, quotaTotal }: LandingContentProps) {
  const { t } = useT()

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)", color: "var(--text-primary)" }}>
      {/* Scanline overlay */}
      <div className="pointer-events-none fixed inset-0 z-[9999]" style={{
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)"
      }} />

      {/* ── Header ── */}
      <header className="border-b px-6 py-4" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FlywheelLogo size={22} style={{ color: "var(--signal)" }} />
            <span className="font-bold" style={{ color: "var(--text-primary)" }}>嗅鐘</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/sign-in" className="text-sm transition-colors hover:text-[var(--text-primary)]" style={{ color: "var(--text-secondary)" }}>
              {t("landing_login")}
            </Link>
            <LangToggle />
            <a href="#waitlist-form"
              className="text-sm px-4 py-1.5 rounded-lg transition-colors font-medium font-mono"
              style={{ backgroundColor: "var(--signal)", color: "var(--bg)" }}>
              {t("landing_cta")}
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-8 text-center">
        {/* slot count badge */}
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs mb-10 border font-mono animate-fade-in-up"
          style={{ borderColor: "var(--signal)", color: "var(--signal)", backgroundColor: "color-mix(in srgb, var(--signal) 5%, transparent)", animationDelay: "0ms", animationFillMode: "both" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ backgroundColor: "var(--signal)" }}/>
          {t("landing_beta")} · {t("landing_quota")} {quotaTotal} {t("landing_quota_unit")} · {t("landing_applied")} {waitlistCount} {t("landing_applied_unit")}
        </div>

        {/* pain point */}
        <p className="text-lg mb-3 animate-fade-in-up" style={{ color: "var(--text-muted)", animationDelay: "100ms", animationFillMode: "both" }}>{t("landing_pain")}</p>

        {/* core promise */}
        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 font-[family-name:var(--font-display)] tracking-tight animate-fade-in-up"
          style={{ color: "var(--text-primary)", animationDelay: "200ms", animationFillMode: "both" }}>
          {t("landing_h1a")}
          <br/>
          {t("landing_h1b")}
        </h1>

        <p className="text-xl mb-3 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ color: "var(--text-secondary)", animationDelay: "200ms", animationFillMode: "both" }}>
          {t("landing_desc_pre")}<br/>
          <strong style={{ color: "var(--text-primary)" }}>{t("landing_desc_bold")}</strong>{t("landing_desc_post")}
        </p>
        <p className="text-sm mb-10 animate-fade-in-up" style={{ color: "var(--text-muted)", animationDelay: "200ms", animationFillMode: "both" }}>
          {t("landing_note")}
        </p>

        <div id="waitlist-form" className="animate-fade-in-up" style={{ animationDelay: "300ms", animationFillMode: "both" }}>
          <WaitlistForm />
        </div>
      </section>

      {/* social proof */}
      <p className="text-center text-sm pb-6" style={{ color: "var(--text-muted)" }}>
        {t("landing_social").startsWith(" ") ? `${userCount}${t("landing_social")}` : `${userCount} ${t("landing_social")}`}
      </p>

      {/* three steps */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-center mb-10" style={{ color: "var(--text-primary)" }}>
          {t("landing_steps_title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              step: t("landing_step1"),
              stepColor: "#3b82f6",
              borderColor: "#3b82f6",
              title: t("landing_step1_title"),
              desc: t("landing_step1_desc"),
            },
            {
              step: t("landing_step2"),
              stepColor: "#a855f7",
              borderColor: "#a855f7",
              title: t("landing_step2_title"),
              desc: t("landing_step2_desc"),
            },
            {
              step: t("landing_step3"),
              stepColor: "var(--signal)",
              borderColor: "var(--signal)",
              title: t("landing_step3_title"),
              desc: t("landing_step3_desc"),
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-2xl p-6 text-center border-l-4"
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderLeftWidth: "4px",
                borderLeftColor: item.borderColor,
              }}
            >
              <p className="text-xs font-mono uppercase tracking-wider mb-2" style={{ color: item.stepColor }}>
                {item.step}
              </p>
              <p className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>{item.title}</p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Signal source tags ── */}
      <div className="max-w-3xl mx-auto px-6 py-6 flex flex-wrap justify-center gap-2">
        {[
          { label: "R Reddit", color: "#fb923c" },
          { label: "Y Hacker News", color: "#ef4444" },
          { label: `✕ ${t("landing_kol")}`, color: "var(--text-secondary)" },
          { label: `◉ ${t("landing_rss")}`, color: "#3b82f6" },
          { label: "⬡ GitHub Trending", color: "#a855f7" },
        ].map(s => (
          <span key={s.label} className="text-xs px-3 py-1 rounded-full border font-medium font-mono"
            style={{ color: s.color, borderColor: `color-mix(in srgb, ${s.color} 25%, transparent)`, backgroundColor: `color-mix(in srgb, ${s.color} 6%, transparent)` }}>
            {s.label}
          </span>
        ))}
        <span className="text-xs self-center ml-1" style={{ color: "var(--text-muted)" }}>{t("landing_scan_freq")}</span>
      </div>

      {/* ── Product preview card ── */}
      <section className="max-w-2xl mx-auto px-6 py-8">
        <p className="text-xs text-center mb-4 uppercase tracking-widest font-mono" style={{ color: "var(--text-muted)" }}>{t("landing_preview_label")}</p>
        <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
          {/* Telegram style header */}
          <div className="flex items-center gap-2 mb-4 pb-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: "var(--signal)" }}>
              <FlywheelLogo size={16} style={{ color: "var(--bg)" }} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>嗅鐘日報</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t("landing_preview_time")}</p>
            </div>
          </div>
          {/* message content */}
          <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>{t("landing_preview_summary")}</p>
          <div className="space-y-3">
            {[
              {
                badge: t("landing_high_conf"),
                badgeColor: "var(--signal)",
                title: t("landing_preview_opp1_title"),
                why: t("landing_preview_opp1_why"),
                action: t("landing_preview_opp1_action"),
              },
              {
                badge: t("landing_mid_conf"),
                badgeColor: "var(--signal-amber)",
                title: t("landing_preview_opp2_title"),
                why: t("landing_preview_opp2_why"),
                action: t("landing_preview_opp2_action"),
              },
            ].map((item, i) => (
              <div key={i} className="rounded-xl p-3 border" style={{ backgroundColor: "var(--bg-panel)", borderColor: "var(--border-subtle)" }}>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-sm font-medium leading-snug" style={{ color: "var(--text-primary)" }}>{item.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 font-mono"
                    style={{ color: item.badgeColor, backgroundColor: `color-mix(in srgb, ${item.badgeColor} 8%, transparent)` }}>{item.badge}</span>
                </div>
                <p className="text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>{t("landing_why_now")}{item.why}</p>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>&rarr; {item.action}</p>
              </div>
            ))}
          </div>
          <p className="text-xs mt-4 text-right" style={{ color: "var(--text-muted)" }}>{t("landing_view_all")}</p>
        </div>
      </section>

      {/* ── Before / After ── */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-10" style={{ color: "var(--text-primary)" }}>{t("landing_ba_title")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Before */}
          <div className="rounded-2xl p-6 border-l-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderLeftWidth: "4px", borderLeftColor: "#ff3b5c" }}>
            <p className="text-xs font-mono mb-4 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{t("landing_without")}</p>
            <div className="space-y-3">
              {[t("landing_before_1"), t("landing_before_2"), t("landing_before_3"), t("landing_before_4"), t("landing_before_5")].map(item => (
                <div key={item} className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0" style={{ color: "#ff3b5c" }}>&times;</span>
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
          {/* After */}
          <div className="rounded-2xl p-6 border-l-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderLeftWidth: "4px", borderLeftColor: "var(--signal)" }}>
            <p className="text-xs font-mono mb-4 uppercase tracking-wider" style={{ color: "var(--signal)" }}>{t("landing_with")}</p>
            <div className="space-y-3">
              {[t("landing_after_1"), t("landing_after_2"), t("landing_after_3"), t("landing_after_4"), t("landing_after_5")].map(item => (
                <div key={item} className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0" style={{ color: "var(--signal)" }}>✓</span>
                  <span className="text-sm" style={{ color: "var(--text-primary)" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { value: "8:00 AM", label: "每日推送" },
            { value: "3-5", label: "可執行機會" },
            { value: "100%", label: "信號覆蓋" },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-6" style={{ backgroundColor: "var(--bg-panel)", border: "1px solid var(--border-subtle)" }}>
              <p className="text-3xl font-bold font-mono mb-1" style={{ color: "var(--signal)" }}>{s.value}</p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-2xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-10" style={{ color: "var(--text-primary)" }}>{t("landing_faq_title")}</h2>
        <div className="space-y-4">
          {[
            { q: t("landing_faq1_q"), a: t("landing_faq1_a") },
            { q: t("landing_faq2_q"), a: t("landing_faq2_a") },
            { q: t("landing_faq3_q"), a: t("landing_faq3_a") },
            { q: t("landing_faq4_q"), a: t("landing_faq4_a") },
            { q: t("landing_faq5_q"), a: t("landing_faq5_a") },
          ].map((item, i) => (
            <FAQItem key={i} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>{t("landing_bottom_note")}</p>
        <h2 className="text-3xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>{t("landing_bottom_title")}</h2>
        <p className="mb-8 whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>
          {t("landing_bottom_desc")}
        </p>
        <div id="waitlist-form-bottom">
          <WaitlistForm />
        </div>
        <p className="text-xs mt-4" style={{ color: "var(--text-muted)" }}>{t("landing_bottom_price")}</p>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 text-center text-xs" style={{ borderTop: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}>
        &copy; 2026 嗅鐘 Sniffing Clock &middot;{" "}
        <a href="https://t.me/BJMYan" className="transition-colors hover:text-[var(--text-primary)]">{t("landing_footer_contact")}</a>
        {" · "}
        <Link href="/privacy" className="transition-colors hover:text-[var(--text-primary)]">{t("landing_footer_privacy")}</Link>
        {" · "}
        <Link href="/sign-in" className="transition-colors hover:text-[var(--text-primary)]">{t("landing_login")}</Link>
      </footer>
    </div>
  )
}
