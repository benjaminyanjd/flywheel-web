import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({}, { status: 401 });
  const db = getDb();
  db.prepare("UPDATE user_settings SET last_active_at = datetime('now') WHERE user_id = ?").run(userId);
  return NextResponse.json({ ok: true });
}
