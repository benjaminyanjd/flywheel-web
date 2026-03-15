import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all";

    const db = getDb();

    let opportunities;
    if (status !== "all") {
      opportunities = db
        .prepare(
          `SELECT * FROM opportunity_actions
           WHERE action = ? AND (user_id = 'system' OR user_id = ?)
           ORDER BY created_at DESC`
        )
        .all(status, userId);
    } else {
      opportunities = db
        .prepare(
          `SELECT * FROM opportunity_actions
           WHERE (user_id = 'system' OR user_id = ?)
           ORDER BY created_at DESC`
        )
        .all(userId);
    }

    const statsRows = db
      .prepare(
        `SELECT action, COUNT(*) as count
         FROM opportunity_actions
         WHERE (user_id = 'system' OR user_id = ?)
         GROUP BY action`
      )
      .all(userId) as { action: string; count: number }[];

    const stats: Record<string, number> = {};
    for (const row of statsRows) {
      stats[row.action] = row.count;
    }

    return NextResponse.json({ items: opportunities, stats });
  } catch (err) {
    logger.error("archive/GET", "Failed to fetch archive", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to fetch archive" }, { status: 500 });
  }
}
