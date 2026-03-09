import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();

    const todayCount = db
      .prepare(
        `SELECT COUNT(*) as count FROM signals
         WHERE date(created_at) = date('now')`
      )
      .get() as { count: number };

    const sourceCounts = db
      .prepare(
        `SELECT source, COUNT(*) as count FROM signals
         GROUP BY source
         ORDER BY count DESC`
      )
      .all() as { source: string; count: number }[];

    const totalSignals = db
      .prepare("SELECT COUNT(*) as count FROM signals")
      .get() as { count: number };

    const totalOpportunities = db
      .prepare("SELECT COUNT(*) as count FROM opportunity_actions")
      .get() as { count: number };

    const statusCounts = db
      .prepare(
        `SELECT action, COUNT(*) as count FROM opportunity_actions
         GROUP BY action`
      )
      .all() as { action: string; count: number }[];

    const conversationCount = db
      .prepare("SELECT COUNT(*) as count FROM conversations")
      .get() as { count: number };

    const cost = parseFloat((conversationCount.count * 0.05).toFixed(2));

    return NextResponse.json({
      todayCount: todayCount.count,
      sourceCounts,
      totalSignals: totalSignals.count,
      totalOpportunities: totalOpportunities.count,
      statusCounts,
      cost,
    });
  } catch (err) {
    console.error("Failed to fetch stats:", err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
