"use client"

import { useState, FormEvent } from "react"
import { useT } from "@/lib/i18n"
import { track } from "@/lib/analytics"

export default function WaitlistForm() {
  const { t } = useT()
  const [telegram, setTelegram] = useState("")
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle")
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<{ telegram?: string; email?: string }>({})

  function validate(): boolean {
    const newErrors: { telegram?: string; email?: string } = {}
    if (!telegram.trim()) {
      newErrors.telegram = "請填寫 Telegram 用戶名"
    }
    if (!email.trim()) {
      newErrors.email = "請填寫電子郵件"
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        newErrors.email = "請輸入有效的電子郵件地址"
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setStatus("loading")
    track("waitlist_form_submit", { has_telegram: !!telegram, has_email: !!email })
    try {
      // Get current language from localStorage for tracking
      const lang = typeof window !== 'undefined' ? localStorage.getItem("flywheel-lang") || "zh" : "zh"
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegram: telegram.trim(), email: email.trim() || undefined, lang }),
      })
      if (res.ok) {
        track("waitlist_form_success")
        setSubmitted(true)
      } else {
        track("waitlist_form_error", { error: "api_error" })
        setStatus("error")
      }
    } catch {
      track("waitlist_form_error", { error: "network_error" })
      setStatus("error")
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-6 space-y-3">
        <p className="text-lg font-medium" style={{ color: "var(--signal)" }}>
          ✅ 申請已收到！
        </p>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          請前往 Telegram 找{" "}
          <a href="https://t.me/SniffingClock_bot" target="_blank" rel="noopener noreferrer" className="font-medium underline" style={{ color: "var(--signal)" }}>
            @SniffingClock_bot
          </a>
          {" "}發送 <code className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: "var(--bg-card)" }}>/start</code> 即可領取邀請碼
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3 max-w-md mx-auto">
      <div className="flex flex-col gap-1">
        <input
          type="text"
          aria-label={t("waitlist_tg_label")}
          placeholder={t("waitlist_tg_placeholder")}
          value={telegram}
          onChange={(e) => {
            setTelegram(e.target.value)
            if (errors.telegram) setErrors(prev => ({ ...prev, telegram: undefined }))
          }}
          className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none border input-focus-ring"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: errors.telegram ? "#ef4444" : "var(--border)",
            color: "var(--text-primary)",
          }}
        />
        {errors.telegram && (
          <p className="text-red-500 text-xs px-1">{errors.telegram}</p>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <input
          type="email"
          aria-label={t("waitlist_email_label")}
          placeholder={t("waitlist_email_placeholder")}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (errors.email) setErrors(prev => ({ ...prev, email: undefined }))
          }}
          className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none border input-focus-ring"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: errors.email ? "#ef4444" : "var(--border)",
            color: "var(--text-primary)",
          }}
        />
        {errors.email && (
          <p className="text-red-500 text-xs px-1">{errors.email}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full disabled:opacity-50 font-bold px-8 py-4 rounded-xl transition-colors text-base font-mono"
        style={{ backgroundColor: "var(--signal)", color: "var(--bg)" }}
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
