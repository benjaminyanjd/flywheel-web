import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { logger } from "@/lib/logger";

// IP-based rate limit: max 10 invite attempts per hour to prevent brute-force
const inviteAttempts = new Map<string, { count: number; resetAt: number }>();
function checkInviteRateLimit(ip: string): boolean {
  const now = Date.now();
  const hourMs = 60 * 60 * 1000;
  const entry = inviteAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    inviteAttempts.set(ip, { count: 1, resetAt: now + hourMs });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkInviteRateLimit(ip)) {
    logger.warn("invite/validate", "Rate limit exceeded", { ip });
    return NextResponse.json({ error: "請求過於頻繁，請稍後再試" }, { status: 429 });
  }

  const { code } = await req.json();
  if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

  const db = getDb();

  // Use transaction to prevent race condition on invite code usage
  const useInvite = db.transaction((inviteCode: string, uid: string) => {
    const invite = db.prepare("SELECT * FROM invite_codes WHERE code = ? AND is_used = 0").get(inviteCode) as { code: string } | undefined;
    if (!invite) return null;
    const now = new Date().toISOString();
    db.prepare("UPDATE invite_codes SET used_by = ?, used_at = ?, is_used = 1 WHERE code = ?").run(uid, now, invite.code);
    const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    db.prepare(`
      INSERT INTO user_subscriptions (user_id, plan, trial_end) VALUES (?, 'trial', ?)
      ON CONFLICT(user_id) DO UPDATE SET plan = 'trial', trial_end = ?
    `).run(uid, trialEnd, trialEnd);
    return trialEnd;
  });

  const trialEnd = useInvite(code.trim().toUpperCase(), userId);
  if (!trialEnd) {
    logger.warn("invite/validate", "Invalid or used invite code", { userId });
    return NextResponse.json({ error: "邀請碼無效或已被使用" }, { status: 400 });
  }
  logger.info("invite/validate", "Invite code used successfully", { userId });
  return NextResponse.json({ success: true, trialEnd });
}
