import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getDb } from "@/lib/db"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json([])
  const db = getDb()
  const rows = db.prepare("SELECT signal_id FROM signal_bookmarks WHERE user_id = ?").all(userId) as { signal_id: number }[]
  return NextResponse.json(rows.map(r => r.signal_id))
}
