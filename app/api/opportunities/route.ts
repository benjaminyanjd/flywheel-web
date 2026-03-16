import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();

    const opportunities = db
      .prepare(
        `SELECT oa.*,
           (SELECT COUNT(*) FROM opportunity_actions oa2
            WHERE oa2.opp_title = oa.opp_title
              AND oa2.action IN ('action', 'todo', 'done')
           ) as action_count
         FROM opportunity_actions oa
         WHERE (oa.user_id = 'system' OR oa.user_id = ?)
           AND oa.action NOT IN ('bias','todo','done','cancel')
           AND oa.created_at >= datetime('now', '-7 days')
         ORDER BY oa.created_at DESC`
      )
      .all(userId);

    return NextResponse.json({ opportunities });
  } catch (err) {
    logger.error("opportunities/GET", "Failed to fetch opportunities", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to fetch opportunities" }, { status: 500 });
  }
}
