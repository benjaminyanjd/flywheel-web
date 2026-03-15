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
    <div className="min-h-screen bg-white text-gray-900">

      {/* ── Header ── */}
      <header className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FlywheelLogo size={22} className="text-black animate-[spin_8s_linear_infinite]" />
            <span className="font-bold text-gray-900">Flywheel</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/sign-in" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              {t("landing_login")}
            </Link>
            <LangToggle />
            <a href="#waitlist-form"
              className="text-sm bg-black hover:bg-gray-800 text-white px-4 py-1.5 rounded-lg transition-colors font-medium">
              {t("landing_cta")}
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-8 text-center">
        {/* slot count badge */}
        <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 text-xs text-gray-600 mb-10">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block"/>
          {t("landing_beta")} · {t("landing_quota")} {quotaTotal} {t("landing_quota_unit")} · {t("landing_applied")} {waitlistCount} {t("landing_applied_unit")}
        </div>

        {/* pain point */}
        <p className="text-gray-400 text-lg mb-3">{t("landing_pain")}</p>

        {/* core promise */}
        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 font-[family-name:var(--font-display)]">
          <span className="text-gray-900">
            {t("landing_h1a")}
          </span>
          <br/>
          <span className="text-gray-900">
            {t("landing_h1b")}
          </span>
        </h1>

        <p className="text-xl text-gray-500 mb-3 max-w-2xl mx-auto leading-relaxed">
          {t("landing_desc_pre")}<br/>
          <strong className="text-gray-700">{t("landing_desc_bold")}</strong>{t("landing_desc_post")}
        </p>
        <p className="text-sm text-gray-400 mb-10">
          {t("landing_note")}
        </p>

        <div id="waitlist-form">
          <WaitlistForm />
        </div>
      </section>

      {/* social proof */}
      <p className="text-center text-sm text-gray-400 pb-6">
        {t("landing_social").startsWith(" ") ? `${userCount}${t("landing_social")}` : `${userCount} ${t("landing_social")}`}
      </p>

      {/* three steps */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-center mb-10 text-gray-900">
          {t("landing_steps_title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              step: t("landing_step1"),
              stepColor: "text-blue-500",
              borderColor: "border-l-blue-500",
              title: t("landing_step1_title"),
              desc: t("landing_step1_desc"),
            },
            {
              step: t("landing_step2"),
              stepColor: "text-purple-500",
              borderColor: "border-l-purple-500",
              title: t("landing_step2_title"),
              desc: t("landing_step2_desc"),
            },
            {
              step: t("landing_step3"),
              stepColor: "text-black",
              borderColor: "border-l-black",
              title: t("landing_step3_title"),
              desc: t("landing_step3_desc"),
            },
          ].map((item) => (
            <div
              key={item.step}
              className={`bg-white border border-gray-100 border-l-4 ${item.borderColor} rounded-2xl p-6 text-center`}
            >
              <p className={`text-xs font-mono uppercase tracking-wider mb-2 ${item.stepColor}`}>
                {item.step}
              </p>
              <p className="text-lg font-semibold text-gray-900 mb-2">{item.title}</p>
              <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Signal source tags ── */}
      <div className="max-w-3xl mx-auto px-6 py-6 flex flex-wrap justify-center gap-2">
        {[
          { label: "R Reddit", cls: "bg-orange-50 text-orange-600 border-orange-200" },
          { label: "Y Hacker News", cls: "bg-red-50 text-red-600 border-red-200" },
          { label: `✕ ${t("landing_kol")}`, cls: "bg-gray-50 text-gray-500 border-gray-200" },
          { label: `◉ ${t("landing_rss")}`, cls: "bg-blue-50 text-blue-600 border-blue-200" },
          { label: "⬡ GitHub Trending", cls: "bg-purple-50 text-purple-600 border-purple-200" },
        ].map(s => (
          <span key={s.label} className={`text-xs px-3 py-1 rounded-full border font-medium ${s.cls}`}>
            {s.label}
          </span>
        ))}
        <span className="text-xs text-gray-400 self-center ml-1">{t("landing_scan_freq")}</span>
      </div>

      {/* ── Product preview card ── */}
      <section className="max-w-2xl mx-auto px-6 py-8">
        <p className="text-xs text-gray-400 text-center mb-4 uppercase tracking-widest">{t("landing_preview_label")}</p>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          {/* Telegram style header */}
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-xs font-bold text-white">
              <FlywheelLogo size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Flywheel Daily</p>
              <p className="text-xs text-gray-400">{t("landing_preview_time")}</p>
            </div>
          </div>
          {/* message content */}
          <p className="text-xs text-gray-400 mb-3">{t("landing_preview_summary")}</p>
          <div className="space-y-3">
            {[
              {
                badge: t("landing_high_conf"),
                badgeCls: "bg-green-50 text-green-600 border border-green-200",
                title: t("landing_preview_opp1_title"),
                why: t("landing_preview_opp1_why"),
                action: t("landing_preview_opp1_action"),
              },
              {
                badge: t("landing_mid_conf"),
                badgeCls: "bg-yellow-50 text-yellow-600 border border-yellow-200",
                title: t("landing_preview_opp2_title"),
                why: t("landing_preview_opp2_why"),
                action: t("landing_preview_opp2_action"),
              },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-sm font-medium text-gray-900 leading-snug">{item.title}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${item.badgeCls}`}>{item.badge}</span>
                </div>
                <p className="text-xs text-gray-400 mb-1.5">{t("landing_why_now")}{item.why}</p>
                <p className="text-xs text-gray-700">&rarr; {item.action}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4 text-right">{t("landing_view_all")}</p>
        </div>
      </section>

      {/* ── Before / After ── */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-10 text-gray-900">{t("landing_ba_title")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Before */}
          <div className="bg-red-50/30 border border-gray-100 border-l-4 border-l-red-300 rounded-2xl p-6">
            <p className="text-xs font-mono text-gray-400 mb-4 uppercase tracking-wider">{t("landing_without")}</p>
            <div className="space-y-3">
              {[
                t("landing_before_1"),
                t("landing_before_2"),
                t("landing_before_3"),
                t("landing_before_4"),
                t("landing_before_5"),
              ].map(item => (
                <div key={item} className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5 shrink-0">&times;</span>
                  <span className="text-sm text-gray-500">{item}</span>
                </div>
              ))}
            </div>
          </div>
          {/* After */}
          <div className="bg-green-50/30 border border-gray-100 border-l-4 border-l-green-400 rounded-2xl p-6">
            <p className="text-xs font-mono text-green-600 mb-4 uppercase tracking-wider">{t("landing_with")}</p>
            <div className="space-y-3">
              {[
                t("landing_after_1"),
                t("landing_after_2"),
                t("landing_after_3"),
                t("landing_after_4"),
                t("landing_after_5"),
              ].map(item => (
                <div key={item} className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                  <span className="text-sm text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-2xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">{t("landing_faq_title")}</h2>
        <div className="space-y-4">
          {[
            { q: t("landing_faq1_q"), a: t("landing_faq1_a") },
            { q: t("landing_faq2_q"), a: t("landing_faq2_a") },
            { q: t("landing_faq3_q"), a: t("landing_faq3_a") },
            { q: t("landing_faq4_q"), a: t("landing_faq4_a") },
            { q: t("landing_faq5_q"), a: t("landing_faq5_a") },
          ].map((item, i) => (
            <details key={i} className="border border-gray-200 rounded-xl group">
              <summary className="flex justify-between items-center p-4 cursor-pointer text-gray-700 font-medium hover:text-gray-900 select-none list-none">
                {item.q}
                <span className="text-gray-400 group-open:rotate-180 transition-transform">&darr;</span>
              </summary>
              <p className="px-4 pb-4 text-gray-500 text-sm leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="text-gray-400 text-sm mb-3">{t("landing_bottom_note")}</p>
        <h2 className="text-3xl font-bold mb-4 text-gray-900">{t("landing_bottom_title")}</h2>
        <p className="text-gray-500 mb-8 whitespace-pre-line">
          {t("landing_bottom_desc")}
        </p>
        <div id="waitlist-form-bottom">
          <WaitlistForm />
        </div>
        <p className="text-xs text-gray-400 mt-4">{t("landing_bottom_price")}</p>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-8 text-center text-xs text-gray-400">
        &copy; 2026 Flywheel &middot;{" "}
        <a href="https://t.me/BJMYan" className="hover:text-gray-600 transition-colors">{t("landing_footer_contact")}</a>
        {" · "}
        <Link href="/privacy" className="hover:text-gray-600 transition-colors">{t("landing_footer_privacy")}</Link>
        {" · "}
        <Link href="/sign-in" className="hover:text-gray-600 transition-colors">{t("landing_login")}</Link>
      </footer>

    </div>
  )
}
