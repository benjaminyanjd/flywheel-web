import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all";

    const db = getDb();

    let opportunities;
    if (status !== "all") {
      opportunities = db
        .prepare(
          `SELECT * FROM opportunity_actions
           WHERE action = ?
           ORDER BY created_at DESC`
        )
        .all(status);
    } else {
      opportunities = db
        .prepare(
          `SELECT * FROM opportunity_actions
           ORDER BY created_at DESC`
        )
        .all();
    }

    const statsRows = db
      .prepare(
        `SELECT action, COUNT(*) as count
         FROM opportunity_actions
         GROUP BY action`
      )
      .all() as { action: string; count: number }[];

    const stats: Record<string, number> = {};
    for (const row of statsRows) {
      stats[row.action] = row.count;
    }

    return NextResponse.json({ items: opportunities, stats });
  } catch (err) {
    console.error("Failed to fetch archive:", err);
    return NextResponse.json({ error: "Failed to fetch archive" }, { status: 500 });
  }
}
