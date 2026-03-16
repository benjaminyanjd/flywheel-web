import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { logger } from "@/lib/logger";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rlKey = getRateLimitKey(req, userId);
    const rl = rateLimit(rlKey, { limit: 30, windowSec: 60, prefix: "todos" });
    if (!rl.success) {
      return NextResponse.json(
        { error: "請求過於頻繁，請稍後再試" },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }

    const db = getDb();

    const todos = db
      .prepare(
        `SELECT * FROM opportunity_actions
         WHERE action = 'todo' AND (user_id = 'system' OR user_id = ?)
         ORDER BY created_at DESC`
      )
      .all(userId);

    return NextResponse.json({ todos });
  } catch (err) {
    logger.error("todolist/GET", "Failed to fetch todo list", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to fetch todo list" }, { status: 500 });
  }
}
