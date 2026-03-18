import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const rlKey = getRateLimitKey(req, userId);
    const rl = rateLimit(rlKey, { limit: 20, windowSec: 60, prefix: "opp_outcome" });
    if (!rl.success) {
      return NextResponse.json({ error: "請求過於頻繁，請稍後再試" }, { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } });
    }

    const { id, outcome_amount, outcome_note } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const db = getDb();

    // Verify the opportunity belongs to this user or is a system opportunity that the user acted on
    const opp = db.prepare(
      "SELECT id, user_id FROM opportunity_actions WHERE id = ?"
    ).get(id) as { id: number; user_id: string } | undefined;

    if (!opp) return NextResponse.json({ error: "Not found" }, { status: 404 });

    db.prepare(
      "UPDATE opportunity_actions SET outcome_amount = ?, outcome_note = ?, outcome_at = datetime('now') WHERE id = ?"
    ).run(
      outcome_amount != null ? Number(outcome_amount) : null,
      outcome_note || null,
      id
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to save outcome" }, { status: 500 });
  }
}
