import { NextResponse } from "next/server"
import Database from "better-sqlite3"
import path from "path"

export async function GET() {
  const start = Date.now()
  let dbStatus = "ok"
  
  try {
    const dbPath = process.env.FLYWHEEL_DB_PATH || path.join(process.cwd(), "flywheel.db")
    const db = new Database(dbPath, { readonly: true })
    db.prepare("SELECT 1").get()
    db.close()
  } catch (e) {
    dbStatus = "error"
  }
  
  return NextResponse.json({
    status: "ok",
    db: dbStatus,
    uptime: process.uptime(),
    ts: Date.now(),
    latency: Date.now() - start,
  })
}
