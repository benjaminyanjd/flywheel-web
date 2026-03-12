import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getDb } from "@/lib/db"

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "***REMOVED***"

interface OppRow {
  id: number
  opp_title: string
  opp_embed: string
  created_at: string
}

interface OppEmbed {
  confidence?: number
  why_now?: string
  [key: string]: unknown
}

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const db = getDb()

  // Get user's telegram_chat_id
  const settings = db.prepare(
    "SELECT telegram_chat_id FROM user_settings WHERE user_id = ?"
  ).get(userId) as { telegram_chat_id: string | null } | undefined

  if (!settings?.telegram_chat_id) return NextResponse.json({ ok: false, reason: "no_telegram" })

  // Get recent 7-day system opportunities (all, then sort by confidence in JS since confidence is in JSON)
  const rows = db.prepare(`
    SELECT id, opp_title, opp_embed, created_at
    FROM opportunity_actions
    WHERE user_id = 'system'
      AND action NOT IN ('bias', 'todo', 'done', 'cancel', 'cancelled')
      AND created_at >= datetime('now', '-7 days')
    ORDER BY created_at DESC
    LIMIT 50
  `).all() as OppRow[]

  if (rows.length === 0) return NextResponse.json({ ok: false, reason: "no_opportunities" })

  // Parse embed JSON, confidence is 0-10 range (e.g. 5 → 50%), sort desc, take top 3
  const opps = rows
    .map((row) => {
      let embed: OppEmbed = {}
      try { embed = JSON.parse(row.opp_embed) } catch {}
      const pct = Math.round((embed.confidence ?? 0) * 10)
      return { ...row, embed, pct }
    })
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 3)

  // Format message (plain text, no parse_mode to avoid escaping issues)
  const lines = [
    "👋 歡迎加入 Flywheel！",
    "",
    "這是根據今日信號為你篩選的入門機會：",
    "",
  ]

  opps.forEach((opp, i) => {
    const badge = opp.pct >= 70 ? "🟢 高置信" : opp.pct >= 50 ? "🟡 中置信" : "⚪ 低置信"
    lines.push(`${i + 1}. ${opp.opp_title}`)
    lines.push(`${badge} ${opp.pct}%`)
    const whyNow = opp.embed.why_now || ""
    if (whyNow) lines.push(`⏰ ${whyNow.slice(0, 100)}`)
    lines.push("")
  })

  lines.push("👉 查看詳情並製定行動計劃：https://flywheelsea.club/opportunities")
  lines.push("")
  lines.push("每天早上 8 點你還會收到最新的市場情報推送 🚀")

  const text = lines.join("\n")

  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: settings.telegram_chat_id,
        text,
        disable_web_page_preview: true,
      }),
    })
    const data = await res.json()
    if (!data.ok) console.error("[WelcomeDigest] Telegram error:", data)
    return NextResponse.json({ ok: data.ok })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[WelcomeDigest] fetch error:", msg)
    return NextResponse.json({ ok: false })
  }
}
