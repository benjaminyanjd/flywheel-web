import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getDb } from "@/lib/db"
import { logger } from "@/lib/logger"

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const db = getDb()
  try {
    db.prepare("INSERT OR IGNORE INTO signal_bookmarks (signal_id, user_id) VALUES (?, ?)").run(Number(id), userId)
    return NextResponse.json({ ok: true })
  } catch (err) {
    logger.error("signals/bookmark/POST", "Failed to add bookmark", { error: err instanceof Error ? err.message : String(err), signalId: id, userId })
    return NextResponse.json({ error: "Failed to bookmark" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const db = getDb()
  try {
    db.prepare("DELETE FROM signal_bookmarks WHERE signal_id = ? AND user_id = ?").run(Number(id), userId)
    return NextResponse.json({ ok: true })
  } catch (err) {
    logger.error("signals/bookmark/DELETE", "Failed to remove bookmark", { error: err instanceof Error ? err.message : String(err), signalId: id, userId })
    return NextResponse.json({ error: "Failed to remove bookmark" }, { status: 500 })
  }
}
