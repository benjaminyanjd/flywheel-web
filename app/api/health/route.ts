import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();
  let dbOk = false;

  try {
    const db = getDb();
    db.prepare("SELECT 1").get();
    dbOk = true;
  } catch {
    dbOk = false;
  }

  const status = dbOk ? "ok" : "degraded";
  return NextResponse.json(
    {
      status,
      db: dbOk ? "ok" : "error",
      uptime: process.uptime(),
      latencyMs: Date.now() - start,
      timestamp: new Date().toISOString(),
    },
    { status: dbOk ? 200 : 503 }
  );
}
