import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { logger } from "@/lib/logger";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rlKey = getRateLimitKey(req, userId);
  const rl = rateLimit(rlKey, { limit: 20, windowSec: 60, prefix: "opp_outcome_v2" });
  if (!rl.success) {
    return NextResponse.json({ error: "請求過於頻繁，請稍後再試" }, { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } });
  }

  const { id } = await params;
  try {
    const { amount, note } = await req.json();
    const db = getDb();

    db.prepare(`
      UPDATE opportunity_actions
      SET outcome_amount = ?, outcome_note = ?, outcome_at = CURRENT_TIMESTAMP
      WHERE id = ? AND (user_id = ? OR user_id = 'system')
    `).run(amount ?? null, note ?? null, id, userId);

    logger.info("opportunities/outcome/POST", "Outcome recorded", { userId, oppId: id });
    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("opportunities/outcome/POST", "Failed to record outcome", { error: err instanceof Error ? err.message : String(err), userId, oppId: id });
    return NextResponse.json({ error: "Failed to record outcome" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const db = getDb();
  const row = db.prepare(
    "SELECT outcome_amount, outcome_note, outcome_at FROM opportunity_actions WHERE id = ?"
  ).get(id) as Record<string, unknown> | undefined;

  return NextResponse.json(row ?? {});
}
