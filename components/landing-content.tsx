"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import WaitlistForm from "@/components/waitlist-form"
import { FlywheelLogo } from "@/components/flywheel-logo"
import { useT } from "@/lib/i18n"
import { LangToggle } from "@/components/lang-toggle"
import { ThemeToggle } from "@/components/theme-toggle"
import { ProfileGearIcon, BrainNeuralIcon, ClipboardCheckIcon } from "@/components/solution-icons"
import { InfoGapIcon, CognitionGapIcon, ActionGapIcon } from "@/components/problem-icons"

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
      <div style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows 200ms ease" }}>
        <div style={{ overflow: "hidden", minHeight: 0 }}>
          <p className="px-4 pb-4 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{a}</p>
        </div>
      </div>
    </div>
  )
}

// Animated counter on scroll into view
function AnimatedStat({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [displayed, setDisplayed] = useState("0")
  const [triggered, setTriggered] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !triggered) { setTriggered(true) } },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [triggered])

  useEffect(() => {
    if (!triggered) return
    const numMatch = value.match(/^(\d+)/)
    if (!numMatch) { setDisplayed(value); return }
    const target = parseInt(numMatch[1])
    const suffix = value.slice(numMatch[1].length)
    let start = 0
    const duration = 1200
    const step = 16
    const increment = target / (duration / step)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) { setDisplayed(target + suffix); clearInterval(timer) }
      else setDisplayed(Math.floor(start) + suffix)
    }, step)
    return () => clearInterval(timer)
  }, [triggered, value])

  return (
    <div ref={ref} className="rounded-2xl p-6 text-center" style={{ backgroundColor: "var(--bg-panel)", border: "1px solid var(--border-subtle)" }}>
      <p className="text-3xl font-bold font-mono mb-1 transition-all duration-300" style={{ color: "var(--signal)" }}>{triggered ? displayed : "0"}</p>
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{label}</p>
    </div>
  )
}

// Static fallback cards for preview section
type PreviewOpp = {
  badge: string
  badgeColor: string
  title: string
  why: string
  action: string
}

function usePreviewOpps(t: (key: import("@/lib/i18n").TKey) => string, lang: string): PreviewOpp[] {
  const [apiOpps, setApiOpps] = useState<PreviewOpp[]>([])

  const fallback: PreviewOpp[] = [
    { badge: t("landing_high_conf"), badgeColor: "var(--signal)", title: t("landing_preview_opp1_title"), why: t("landing_preview_opp1_why"), action: t("landing_preview_opp1_action") },
    { badge: t("landing_high_conf"), badgeColor: "var(--signal)", title: t("landing_preview_opp2_title"), why: t("landing_preview_opp2_why"), action: t("landing_preview_opp2_action") },
    { badge: t("landing_high_conf"), badgeColor: "var(--signal)", title: t("landing_preview_opp3_title"), why: t("landing_preview_opp3_why"), action: t("landing_preview_opp3_action") },
    { badge: t("landing_high_conf"), badgeColor: "var(--signal)", title: t("landing_preview_opp4_title"), why: t("landing_preview_opp4_why"), action: t("landing_preview_opp4_action") },
    { badge: t("landing_high_conf"), badgeColor: "var(--signal)", title: t("landing_preview_opp5_title"), why: t("landing_preview_opp5_why"), action: t("landing_preview_opp5_action") },
    { badge: t("landing_high_conf"), badgeColor: "var(--signal)", title: t("landing_preview_opp6_title"), why: t("landing_preview_opp6_why"), action: t("landing_preview_opp6_action") },
  ]

  useEffect(() => {
    fetch("/api/preview-opps")
      .then(r => r.json())
      .then(data => {
        if (data.opps && data.opps.length >= 6) {
          setApiOpps(data.opps.slice(0, 6).map((o: { title_zh: string; title_en: string; why_zh: string; why_en: string; action_zh: string; action_en: string; confidence: number }) => ({
            badge: t("landing_high_conf"),
            badgeColor: "var(--signal)",
            title: lang === "zh" ? o.title_zh : o.title_en,
            why: lang === "zh" ? o.why_zh : o.why_en,
            action: lang === "zh" ? o.action_zh : o.action_en,
          })))
        }
      })
      .catch(() => { /* use fallback */ })
  }, [lang]) // eslint-disable-line react-hooks/exhaustive-deps

  return apiOpps.length >= 6 ? apiOpps : fallback
}

function PreviewCards({ lang, t, scrollToForm }: { lang: string; t: (key: import("@/lib/i18n").TKey) => string; scrollToForm: () => void }) {
  const allCards = usePreviewOpps(t, lang)
  const [page, setPage] = useState(0)
  const [opacity, setOpacity] = useState(1)

  useEffect(() => {
    const timer = setInterval(() => {
      setOpacity(0)
      setTimeout(() => {
        setPage(p => (p + 1) % 2)
        setOpacity(1)
      }, 400)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const visibleCards = allCards.slice(page * 3, page * 3 + 3)

  return (
    <section className="max-w-2xl mx-auto px-6 py-10">
      <p className="text-xs text-center mb-4 uppercase tracking-widest font-mono" style={{ color: "var(--text-muted)" }}>{t("landing_preview_label")}</p>
      <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3 mb-4 pb-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <div className="w-11 h-11 flex items-center justify-center shrink-0">
            <FlywheelLogo size={32} style={{ color: "var(--signal)" }} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{lang === "en" ? "Sniffing Clock" : "嗅鐘日報"}</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ backgroundColor: "var(--signal)" }}/>
              <p className="text-xs" style={{ color: "var(--signal)" }}>{t("landing_preview_time")}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t("landing_preview_summary")}</p>
          <div className="flex gap-1">
            {[0, 1].map(i => (
              <span key={i} className="w-1.5 h-1.5 rounded-full transition-all duration-300" style={{ backgroundColor: page === i ? "var(--signal)" : "var(--border)" }} />
            ))}
          </div>
        </div>
        <div className="space-y-3" style={{ opacity, transition: "opacity 400ms ease-in-out" }}>
          {visibleCards.map((item, i) => (
            <div key={`${page}-${i}`} className="rounded-xl p-3 border" style={{ backgroundColor: "var(--bg-panel)", borderColor: "var(--border-subtle)" }}>
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
        {/* CTA — bigger, more prominent */}
        <div className="mt-5">
          <button
            onClick={scrollToForm}
            className="w-full group relative overflow-hidden font-medium py-3 px-4 rounded-xl transition-all duration-200 text-sm cursor-pointer hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: "color-mix(in srgb, var(--signal) 15%, transparent)", color: "var(--signal)", border: "1px solid color-mix(in srgb, var(--signal) 40%, transparent)" }}
          >
            <span className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_sweep_2.5s_ease-in-out_infinite]"
              style={{ background: "linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--signal) 25%, transparent) 50%, transparent 100%)" }} />
            <span className="relative font-semibold">
              {lang === "zh" ? "👉 申請邀請碼，解鎖完整推送" : "👉 Get invite code, unlock full access"}
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}

interface LandingContentProps {
  userCount: number
  waitlistCount: number
  quotaTotal: number
}

export default function LandingContent({ userCount, waitlistCount, quotaTotal }: LandingContentProps) {
  const { t, lang } = useT()
  const [formHighlight, setFormHighlight] = useState(false)
  const [showBackTop, setShowBackTop] = useState(false)

  function scrollToForm() {
    setFormHighlight(true)
    setTimeout(() => setFormHighlight(false), 3000)
    document.getElementById("waitlist-form")?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 600)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)", color: "var(--text-primary)" }}>
      {/* Scanline overlay */}
      <div className="pointer-events-none fixed inset-0 z-[9999]" style={{
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)"
      }} />

      {/* ── Scroll to top ── */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg"
        style={{
          backgroundColor: "var(--signal)",
          color: "var(--bg)",
          opacity: showBackTop ? 1 : 0,
          pointerEvents: showBackTop ? "auto" : "none",
          transform: showBackTop ? "translateY(0)" : "translateY(12px)",
        }}
        aria-label="Back to top"
      >
        ↑
      </button>

      {/* ── Header ── */}
      <header className="border-b px-6 py-4" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FlywheelLogo size={33} style={{ color: "var(--signal)" }} />
            <span className="font-bold" style={{ color: "var(--text-primary)" }}>{lang === "en" ? "Sniffing Clock" : "嗅鐘"}</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/sign-in" className="text-sm transition-colors hover:text-[var(--text-primary)]" style={{ color: "var(--text-secondary)" }}>
              {t("landing_login")}
            </Link>
            <LangToggle />
            <ThemeToggle />
            <button
              onClick={scrollToForm}
              className="text-sm px-4 py-1.5 rounded-lg transition-all duration-200 font-medium font-mono cursor-pointer hover:opacity-90 active:scale-95"
              style={{ backgroundColor: "var(--signal)", color: "var(--bg)" }}>
              {t("landing_cta")}
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
        {/* badge */}
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs mb-10 border font-mono animate-fade-in-up"
          style={{ borderColor: "var(--signal)", color: "var(--signal)", backgroundColor: "color-mix(in srgb, var(--signal) 5%, transparent)", animationDelay: "0ms", animationFillMode: "both" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ backgroundColor: "var(--signal)" }}/>
          {t("landing_beta")} · {t("landing_quota")} {quotaTotal} {t("landing_quota_unit")} · {t("landing_applied")} {waitlistCount} {t("landing_applied_unit")}
        </div>

        {/* pain point */}
        <p className="text-base mb-4 animate-fade-in-up" style={{ color: "var(--text-muted)", animationDelay: "100ms", animationFillMode: "both" }}>
          {t("landing_pain")}
        </p>

        {/* H1 — fixed line break */}
        <h1
          className="font-bold leading-tight mb-6 font-[family-name:var(--font-display)] tracking-tight animate-fade-in-up"
          style={{ color: "var(--text-primary)", animationDelay: "200ms", animationFillMode: "both", fontSize: "clamp(2.5rem, 7vw, 4rem)" }}
        >
          {lang === "zh" ? (
            <><span>看到了，</span><br/><span style={{ color: "var(--signal)" }}>不等於知道怎麼做</span></>
          ) : (
            <><span>You saw it.</span><br/><span style={{ color: "var(--signal)" }}>But did you act?</span></>
          )}
        </h1>

        <p className="text-lg mb-3 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ color: "var(--text-secondary)", animationDelay: "250ms", animationFillMode: "both" }}>
          {t("landing_desc_pre")}<br/>
          <strong style={{ color: "var(--text-primary)" }}>{t("landing_desc_bold")}</strong>{t("landing_desc_post")}
        </p>
        <p className="text-sm mb-12 animate-fade-in-up" style={{ color: "var(--text-muted)", animationDelay: "280ms", animationFillMode: "both" }}>
          {t("landing_note")}
        </p>

        {/* Hero CTA — anchor button only, no form here */}
        <div className="animate-fade-in-up" style={{ animationDelay: "350ms", animationFillMode: "both" }}>
          <button
            onClick={scrollToForm}
            className="inline-flex items-center gap-2 text-base font-bold px-8 py-4 rounded-xl transition-all duration-200 font-mono cursor-pointer hover:opacity-90 active:scale-95 shadow-lg"
            style={{ backgroundColor: "var(--signal)", color: "var(--bg)" }}
          >
            {lang === "zh" ? "申請免費試用 →" : "Get Free Trial →"}
          </button>
          <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
            {lang === "zh" ? "7 天免費 · 隨時取消 · 邀請制" : "7-day free · Cancel anytime · Invite only"}
          </p>

        </div>
      </section>

      {/* ── Social proof ── */}
      <div className="text-center pb-6">
        <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
          <span className="font-bold text-base font-mono" style={{ color: "var(--text-primary)" }}>{userCount}</span>
          {" "}{t("landing_social")}
        </p>
      </div>

      {/* ── Problem Diagnosis: Three Gaps ── */}
      <section className="max-w-4xl mx-auto px-6 pt-6 pb-10">
        <h2 className="text-2xl font-bold text-center mb-3" style={{ color: "var(--text-primary)" }}>
          {t("landing_problem_title")}
        </h2>
        <p className="text-center text-sm mb-12 font-mono" style={{ color: "var(--signal)" }}>
          — {t("landing_problem_sub")} —
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              label: t("landing_problem_info"),
              desc: t("landing_problem_info_desc"),
              solved: false,
              icon: <InfoGapIcon />,
            },
            {
              label: t("landing_problem_cognition"),
              desc: t("landing_problem_cognition_desc"),
              solved: true,
              icon: <CognitionGapIcon />,
            },
            {
              label: t("landing_problem_action"),
              desc: t("landing_problem_action_desc"),
              solved: true,
              icon: <ActionGapIcon />,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl p-8 text-center relative"
              style={{
                backgroundColor: item.solved ? "color-mix(in srgb, var(--signal) 6%, var(--bg-card))" : "var(--bg-card)",
                border: `1px solid ${item.solved ? "color-mix(in srgb, var(--signal) 30%, transparent)" : "var(--border-subtle)"}`,
              }}
            >
              {item.solved && (
                <span className="absolute top-3 right-3 text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1"
                  style={{ color: "var(--signal)", backgroundColor: "color-mix(in srgb, var(--signal) 12%, transparent)" }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 6l3 3 5-5" />
                  </svg>
                  {t("landing_problem_solved")}
                </span>
              )}
              <div className="flex justify-center mb-5" style={{ color: item.solved ? "var(--signal)" : "var(--text-muted)" }}>{item.icon}</div>
              <p className="text-base font-bold mb-2" style={{ color: item.solved ? "var(--text-primary)" : "var(--text-muted)" }}>
                {item.label}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Solution: How Sniffing Clock solves it ── */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-3" style={{ color: "var(--text-primary)" }}>
          {t("landing_gap_title")}
        </h2>
        <p className="text-center text-sm mb-12 font-mono" style={{ color: "var(--signal)" }}>
          — {t("landing_gap_solution")} —
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              label: t("landing_gap_info"),
              desc: t("landing_gap_info_desc"),
              color: "var(--signal)",
              isSolved: true,
              icon: <ProfileGearIcon />,
            },
            {
              label: t("landing_gap_cognition"),
              desc: t("landing_gap_cognition_desc"),
              color: "var(--signal)",
              isSolved: true,
              icon: <BrainNeuralIcon />,
            },
            {
              label: t("landing_gap_action"),
              desc: t("landing_gap_action_desc"),
              color: "var(--signal)",
              isSolved: true,
              icon: <ClipboardCheckIcon />,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl p-8 text-center relative"
              style={{
                backgroundColor: item.isSolved ? "color-mix(in srgb, var(--signal) 6%, var(--bg-card))" : "var(--bg-card)",
                border: `1px solid ${item.isSolved ? "color-mix(in srgb, var(--signal) 30%, transparent)" : "var(--border-subtle)"}`,
              }}
            >
              {/* no badge needed — all three are solutions */}
              <div className="flex justify-center mb-5" style={{ color: item.color }}>{item.icon}</div>
              <p className="text-base font-bold mb-2" style={{ color: item.isSolved ? "var(--text-primary)" : "var(--text-muted)" }}>
                {item.label}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Signal source tags ── */}
      <div className="max-w-3xl mx-auto px-6 py-4 flex flex-wrap justify-center gap-2">
        {[
          { label: "R Reddit", color: "#fb923c" },
          { label: "Y Hacker News", color: "#ef4444" },
          { label: `✕ ${t("landing_kol")}`, color: "var(--text-secondary)" },
          { label: "⬡ BlockBeats", color: "#3b82f6" },
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
      <PreviewCards lang={lang} t={t} scrollToForm={scrollToForm} />

      {/* ── Waitlist Form Section ── */}
      <section className="max-w-xl mx-auto px-6 py-12 text-center">
        <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>{t("landing_bottom_note")}</p>
        <h3 className="text-3xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>{t("landing_bottom_title")}</h3>
        <p className="mb-8 whitespace-pre-line leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {t("landing_bottom_desc")}
        </p>
        <div
          id="waitlist-form"
          className="rounded-2xl transition-all duration-500"
          style={{
            scrollMarginTop: "80px",
            padding: formHighlight ? "20px" : "4px",
            border: formHighlight ? "2px solid var(--signal)" : "2px solid transparent",
            backgroundColor: formHighlight ? "color-mix(in srgb, var(--signal) 5%, transparent)" : "transparent",
            boxShadow: formHighlight ? "0 0 0 4px color-mix(in srgb, var(--signal) 15%, transparent)" : "none",
          }}
        >
          {formHighlight && (
            <p className="text-xs font-medium text-center mb-3 animate-pulse" style={{ color: "var(--signal)" }}>
              👇 {lang === "zh" ? "在這裡輸入信息，獲取專屬邀請碼" : "Enter your info here to get an invite code"}
            </p>
          )}
          <WaitlistForm />
        </div>
      </section>

      {/* ── Before / After ── */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-center mb-10" style={{ color: "var(--text-primary)" }}>{t("landing_ba_title")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl p-7" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderLeft: "4px solid #ff3b5c" }}>
            <p className="text-xs font-mono mb-5 uppercase tracking-wider" style={{ color: "#ff3b5c" }}>{t("landing_without")}</p>
            <div className="space-y-4">
              {[t("landing_before_1"), t("landing_before_2"), t("landing_before_3"), t("landing_before_4"), t("landing_before_5")].map(item => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0 text-base leading-none" style={{ color: "#ff3b5c" }}>&times;</span>
                  <span className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl p-7" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderLeft: "4px solid var(--signal)" }}>
            <p className="text-xs font-mono mb-5 uppercase tracking-wider" style={{ color: "var(--signal)" }}>{t("landing_with")}</p>
            <div className="space-y-4">
              {[t("landing_after_1"), t("landing_after_2"), t("landing_after_3"), t("landing_after_4"), t("landing_after_5")].map(item => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0 text-base leading-none" style={{ color: "var(--signal)" }}>✓</span>
                  <span className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats — scroll-triggered counter ── */}
      <section className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid grid-cols-3 gap-4 text-center">
          <AnimatedStat value="1000+" label={lang === "zh" ? "每日信號" : "Daily Signals"} />
          <AnimatedStat value="100%" label={lang === "zh" ? "個人化過濾" : "Personalized"} />
          <AnimatedStat value="1min" label={lang === "zh" ? "最快送達" : "Fastest Push"} />
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-2xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-10" style={{ color: "var(--text-primary)" }}>{t("landing_faq_title")}</h2>
        <div className="space-y-4">
          {[
            { q: t("landing_faq0_q"), a: t("landing_faq0_a") },
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
        <p className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: "var(--signal)" }}>
          {lang === "zh" ? "限量名額開放中" : "Limited spots available"}
        </p>
        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          {lang === "zh" ? "填寫申請，24小時內收到邀請碼" : "Apply now, receive invite code within 24h"}
        </h2>
        <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
          {lang === "zh" ? "7 天免費試用 · 不自動扣費 · 隨時取消" : "7-day free trial · No auto-charge · Cancel anytime"}
        </p>
        <div id="waitlist-form-bottom">
          <WaitlistForm />
        </div>
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
