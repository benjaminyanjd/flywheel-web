"use client"

import Link from "next/link"
import WaitlistForm from "@/components/waitlist-form"
import { FlywheelLogo } from "@/components/flywheel-logo"
import { useT } from "@/lib/i18n"
import { LangToggle } from "@/components/lang-toggle"

interface LandingContentProps {
  userCount: number
  waitlistCount: number
  quotaTotal: number
}

export default function LandingContent({ userCount, waitlistCount, quotaTotal }: LandingContentProps) {
  const { t } = useT()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">

      {/* ── Header ── */}
      <header className="border-b border-slate-800/60 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FlywheelLogo size={22} className="text-amber-400 animate-[spin_8s_linear_infinite]" />
            <span className="font-bold text-slate-100">Flywheel</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/sign-in" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
              {t("landing_login")}
            </Link>
            <LangToggle />
            <a href="#waitlist-form"
              className="text-sm bg-amber-500 hover:bg-amber-400 text-black px-4 py-1.5 rounded-lg transition-colors font-medium">
              {t("landing_cta")}
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-8 text-center">
        {/* slot count badge */}
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 text-xs text-amber-400 mb-10">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block"/>
          {t("landing_beta")} · {t("landing_quota")} {quotaTotal} {t("landing_quota_unit")} · {t("landing_applied")} {waitlistCount} {t("landing_applied_unit")}
        </div>

        {/* pain point */}
        <p className="text-slate-500 text-lg mb-3">{t("landing_pain")}</p>

        {/* core promise */}
        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 font-[family-name:var(--font-display)]">
          <span className="bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
            {t("landing_h1a")}
          </span>
          <br/>
          <span className="bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
            {t("landing_h1b")}
          </span>
        </h1>

        <p className="text-xl text-slate-400 mb-3 max-w-2xl mx-auto leading-relaxed">
          {t("landing_desc_pre")}<br/>
          <strong className="text-slate-200">{t("landing_desc_bold")}</strong>{t("landing_desc_post")}
        </p>
        <p className="text-sm text-slate-600 mb-10">
          {t("landing_note")}
        </p>

        <div id="waitlist-form">
          <WaitlistForm />
        </div>
      </section>

      {/* social proof */}
      <p className="text-center text-sm text-slate-500 pb-6">
        {t("landing_social").startsWith(" ") ? `${userCount}${t("landing_social")}` : `${userCount} ${t("landing_social")}`}
      </p>

      {/* three steps */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-center mb-10 text-slate-200">
          {t("landing_steps_title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              step: t("landing_step1"),
              stepColor: "text-blue-400",
              borderColor: "border-l-blue-500",
              title: t("landing_step1_title"),
              desc: t("landing_step1_desc"),
            },
            {
              step: t("landing_step2"),
              stepColor: "text-purple-400",
              borderColor: "border-l-purple-500",
              title: t("landing_step2_title"),
              desc: t("landing_step2_desc"),
            },
            {
              step: t("landing_step3"),
              stepColor: "text-amber-400",
              borderColor: "border-l-amber-500",
              title: t("landing_step3_title"),
              desc: t("landing_step3_desc"),
            },
          ].map((item) => (
            <div
              key={item.step}
              className={`bg-slate-900/50 border border-slate-800 border-l-4 ${item.borderColor} rounded-2xl p-6 text-center`}
            >
              <p className={`text-xs font-mono uppercase tracking-wider mb-2 ${item.stepColor}`}>
                {item.step}
              </p>
              <p className="text-lg font-semibold text-slate-200 mb-2">{item.title}</p>
              <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Signal source tags ── */}
      <div className="max-w-3xl mx-auto px-6 py-6 flex flex-wrap justify-center gap-2">
        {[
          { label: "R Reddit", cls: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
          { label: "Y Hacker News", cls: "bg-red-500/10 text-red-400 border-red-500/20" },
          { label: `✕ ${t("landing_kol")}`, cls: "bg-slate-400/10 text-slate-400 border-slate-500/20" },
          { label: `◉ ${t("landing_rss")}`, cls: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
          { label: "⬡ GitHub Trending", cls: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
        ].map(s => (
          <span key={s.label} className={`text-xs px-3 py-1 rounded-full border font-medium ${s.cls}`}>
            {s.label}
          </span>
        ))}
        <span className="text-xs text-slate-600 self-center ml-1">{t("landing_scan_freq")}</span>
      </div>

      {/* ── Product preview card ── */}
      <section className="max-w-2xl mx-auto px-6 py-8">
        <p className="text-xs text-slate-600 text-center mb-4 uppercase tracking-widest">{t("landing_preview_label")}</p>
        <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-6 shadow-2xl shadow-slate-950/60">
          {/* Telegram style header */}
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-800">
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-xs font-bold text-black">
              <FlywheelLogo size={16} className="text-black" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">Flywheel Daily</p>
              <p className="text-xs text-slate-500">{t("landing_preview_time")}</p>
            </div>
          </div>
          {/* message content */}
          <p className="text-xs text-slate-500 mb-3">{t("landing_preview_summary")}</p>
          <div className="space-y-3">
            {[
              {
                badge: t("landing_high_conf"),
                badgeCls: "bg-rose-500/20 text-rose-400 border border-rose-500/30",
                title: t("landing_preview_opp1_title"),
                why: t("landing_preview_opp1_why"),
                action: t("landing_preview_opp1_action"),
              },
              {
                badge: t("landing_mid_conf"),
                badgeCls: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
                title: t("landing_preview_opp2_title"),
                why: t("landing_preview_opp2_why"),
                action: t("landing_preview_opp2_action"),
              },
            ].map((item, i) => (
              <div key={i} className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-sm font-medium text-slate-100 leading-snug">{item.title}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${item.badgeCls}`}>{item.badge}</span>
                </div>
                <p className="text-xs text-slate-500 mb-1.5">{t("landing_why_now")}{item.why}</p>
                <p className="text-xs text-amber-400">&rarr; {item.action}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-600 mt-4 text-right">{t("landing_view_all")}</p>
        </div>
      </section>

      {/* ── Before / After ── */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-10 text-slate-200">{t("landing_ba_title")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Before */}
          <div className="bg-rose-950/20 border border-slate-800 border-l-4 border-l-rose-500/50 rounded-2xl p-6">
            <p className="text-xs font-mono text-slate-600 mb-4 uppercase tracking-wider">{t("landing_without")}</p>
            <div className="space-y-3">
              {[
                t("landing_before_1"),
                t("landing_before_2"),
                t("landing_before_3"),
                t("landing_before_4"),
                t("landing_before_5"),
              ].map(item => (
                <div key={item} className="flex items-start gap-2">
                  <span className="text-rose-500 mt-0.5 shrink-0">&times;</span>
                  <span className="text-sm text-slate-500">{item}</span>
                </div>
              ))}
            </div>
          </div>
          {/* After */}
          <div className="bg-emerald-950/20 border border-slate-800 border-l-4 border-l-emerald-500/50 rounded-2xl p-6 shadow-lg shadow-emerald-500/5">
            <p className="text-xs font-mono text-emerald-400 mb-4 uppercase tracking-wider">{t("landing_with")}</p>
            <div className="space-y-3">
              {[
                t("landing_after_1"),
                t("landing_after_2"),
                t("landing_after_3"),
                t("landing_after_4"),
                t("landing_after_5"),
              ].map(item => (
                <div key={item} className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                  <span className="text-sm text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-2xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center text-slate-100 mb-10">{t("landing_faq_title")}</h2>
        <div className="space-y-4">
          {[
            { q: t("landing_faq1_q"), a: t("landing_faq1_a") },
            { q: t("landing_faq2_q"), a: t("landing_faq2_a") },
            { q: t("landing_faq3_q"), a: t("landing_faq3_a") },
            { q: t("landing_faq4_q"), a: t("landing_faq4_a") },
            { q: t("landing_faq5_q"), a: t("landing_faq5_a") },
          ].map((item, i) => (
            <details key={i} className="border border-slate-700/60 rounded-lg group">
              <summary className="flex justify-between items-center p-4 cursor-pointer text-slate-200 font-medium hover:text-white select-none list-none">
                {item.q}
                <span className="text-slate-500 group-open:rotate-180 transition-transform">&darr;</span>
              </summary>
              <p className="px-4 pb-4 text-slate-400 text-sm leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="text-slate-600 text-sm mb-3">{t("landing_bottom_note")}</p>
        <h2 className="text-3xl font-bold mb-4 text-slate-100">{t("landing_bottom_title")}</h2>
        <p className="text-slate-400 mb-8 whitespace-pre-line">
          {t("landing_bottom_desc")}
        </p>
        <div id="waitlist-form-bottom">
          <WaitlistForm />
        </div>
        <p className="text-xs text-slate-600 mt-4">{t("landing_bottom_price")}</p>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800/60 py-8 text-center text-xs text-slate-700">
        &copy; 2026 Flywheel &middot;{" "}
        <a href="https://t.me/BJMYan" className="hover:text-slate-500 transition-colors">{t("landing_footer_contact")}</a>
        {" · "}
        <Link href="/privacy" className="hover:text-slate-500 transition-colors">{t("landing_footer_privacy")}</Link>
        {" · "}
        <Link href="/sign-in" className="hover:text-slate-500 transition-colors">{t("landing_login")}</Link>
      </footer>

    </div>
  )
}
