import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await req.json();
  if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

  const db = getDb();
  const invite = db.prepare("SELECT * FROM invite_codes WHERE code = ? AND is_used = 0").get(code.trim().toUpperCase()) as any;

  if (!invite) {
    return NextResponse.json({ error: "邀請碼無效或已被使用" }, { status: 400 });
  }

  // Mark invite as used
  const now = new Date().toISOString();
  db.prepare("UPDATE invite_codes SET used_by = ?, used_at = ?, is_used = 1 WHERE code = ?").run(userId, now, invite.code);

  // Create/update subscription (7-day trial)
  const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  db.prepare(`
    INSERT INTO user_subscriptions (user_id, plan, trial_end) VALUES (?, 'trial', ?)
    ON CONFLICT(user_id) DO UPDATE SET plan = 'trial', trial_end = ?
  `).run(userId, trialEnd, trialEnd);

  return NextResponse.json({ success: true, trialEnd });
}
