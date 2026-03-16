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
        <p className="text-green-600 text-lg font-medium">{t("waitlist_success")}</p>
        <div className="rounded-xl p-4 text-left max-w-sm mx-auto border" style={{ backgroundColor: "color-mix(in srgb, var(--signal) 5%, transparent)", borderColor: "color-mix(in srgb, var(--signal) 20%, transparent)" }}>
          <p className="font-semibold text-sm mb-2" style={{ color: "var(--text-primary)" }}>{t("waitlist_step_title")}</p>
          <ol className="text-sm space-y-1.5 list-decimal list-inside" style={{ color: "var(--text-secondary)" }}>
            <li>{t("waitlist_step1_pre")}<span className="font-mono" style={{ color: "var(--signal)" }}>@flywheelsea_bot</span></li>
            <li>{t("waitlist_step2_pre")}<span className="font-mono" style={{ color: "var(--signal)" }}>/start</span></li>
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
        className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none border input-focus-ring" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-primary)" }}
      />
      <input
        type="email"
        aria-label={t("waitlist_email_label")}
        placeholder={t("waitlist_email_placeholder")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none border input-focus-ring" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-primary)" }}
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full disabled:opacity-50 font-bold px-8 py-4 rounded-xl transition-colors text-base font-mono" style={{ backgroundColor: "var(--signal)", color: "var(--bg)" }}
      >
        {status === "loading" ? t("waitlist_btn_loading") : t("waitlist_btn")}
      </button>
      {status === "error" && (
        <p className="text-red-500 text-sm text-center">{t("waitlist_error")}</p>
      )}
      <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>{t("waitlist_note")}</p>
    </form>
  )
}
