"use client"

import { useState, FormEvent } from "react"

export default function WaitlistForm() {
  const [telegram, setTelegram] = useState("")
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!telegram.trim()) return
    setStatus("loading")
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegram: telegram.trim(), email: email.trim() || undefined }),
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
      <div className="text-center py-4">
        <p className="text-emerald-400 text-lg font-medium">✅ 已收到！我們會在 24 小時內聯繫你</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md mx-auto">
      <input
        type="text"
        required
        placeholder="@你的 Telegram 用戶名"
        value={telegram}
        onChange={(e) => setTelegram(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 text-sm"
      />
      <input
        type="email"
        placeholder="電子郵件（選填）"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 text-sm"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-slate-900 font-bold px-8 py-4 rounded-xl transition-colors text-base shadow-lg shadow-amber-500/20"
      >
        {status === "loading" ? "提交中…" : "申請免費試用 7 天 →"}
      </button>
      {status === "error" && (
        <p className="text-red-400 text-sm text-center">提交失敗，請稍後再試</p>
      )}
      <p className="text-xs text-slate-600 text-center">免費試用 7 天，無需信用卡</p>
    </form>
  )
}
