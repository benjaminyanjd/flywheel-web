"use client"

import { useState, FormEvent } from "react"
import { useT } from "@/lib/i18n"

export default function WaitlistForm() {
  const { t } = useT()
  const [telegram, setTelegram] = useState("")
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!telegram.trim()) return
    setStatus("loading")
    try {
      // Get current language from localStorage for tracking
      const lang = typeof window !== 'undefined' ? localStorage.getItem("flywheel-lang") || "zh" : "zh"
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegram: telegram.trim(), email: email.trim() || undefined, lang }),
      })
      if (res.ok) {
        setStatus("success")
      } else {
        setStatus("error")
      }
    } catch {
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div className="text-center py-4 space-y-3">
        <p className="text-emerald-400 text-lg font-medium">{t("waitlist_success")}</p>
        <div className="bg-slate-800 border border-amber-500/30 rounded-xl p-4 text-left max-w-sm mx-auto">
          <p className="text-amber-400 font-semibold text-sm mb-2">{t("waitlist_step_title")}</p>
          <ol className="text-slate-300 text-sm space-y-1.5 list-decimal list-inside">
            <li>{t("waitlist_step1_pre")}<span className="text-amber-300 font-mono">@flywheelsea_bot</span></li>
            <li>{t("waitlist_step2_pre")}<span className="text-amber-300 font-mono">/start</span></li>
            <li>{t("waitlist_step3")}</li>
          </ol>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md mx-auto">
      <input
        type="text"
        required
        aria-label={t("waitlist_tg_label")}
        placeholder={t("waitlist_tg_placeholder")}
        value={telegram}
        onChange={(e) => setTelegram(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 text-sm"
      />
      <input
        type="email"
        aria-label={t("waitlist_email_label")}
        placeholder={t("waitlist_email_placeholder")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 text-sm"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-slate-900 font-bold px-8 py-4 rounded-xl transition-colors text-base shadow-lg shadow-amber-500/20"
      >
        {status === "loading" ? t("waitlist_btn_loading") : t("waitlist_btn")}
      </button>
      {status === "error" && (
        <p className="text-red-400 text-sm text-center">{t("waitlist_error")}</p>
      )}
      <p className="text-xs text-slate-600 text-center">{t("waitlist_note")}</p>
    </form>
  )
}
