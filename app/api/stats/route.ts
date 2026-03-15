import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { execSync } from "child_process";
import { logger } from "@/lib/logger";

function checkBotStatus(): "online" | "offline" {
  try {
    const output = execSync("pm2 jlist", { timeout: 5000 }).toString();
    const list = JSON.parse(output);
    const bot = list.find(
      (p: { name: string; pm2_env?: { status?: string } }) =>
        p.name === "flywheel-bot"
    );
    return bot?.pm2_env?.status === "online" ? "online" : "offline";
  } catch {
    return "offline";
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();

    // Query A: signals — one grouped query replaces 4 individual queries
    const signalRows = db
      .prepare(
        `SELECT COUNT(*) AS total,
                SUM(CASE WHEN date(created_at) = date('now') THEN 1 ELSE 0 END) AS today,
                COALESCE(source, 'unknown') AS source,
                COALESCE(category, 'unknown') AS category
         FROM signals
         GROUP BY source, category`
      )
      .all() as { total: number; today: number; source: string; category: string }[];

    let totalSignals = 0;
    let todayCount = 0;
    const categoryCounts: Record<string, number> = {};
    const signalsBySource: Record<string, number> = {};

    for (const row of signalRows) {
      totalSignals += row.total;
      todayCount += row.today;
      if (row.today > 0) {
        categoryCounts[row.category] = (categoryCounts[row.category] ?? 0) + row.today;
      }
      signalsBySource[row.source] = (signalsBySource[row.source] ?? 0) + row.total;
    }

    // Query B: opportunity_actions — one grouped query replaces 2 individual queries
    const oppRows = db
      .prepare(
        `SELECT action, COUNT(*) as count FROM opportunity_actions GROUP BY action`
      )
      .all() as { action: string; count: number }[];

    let totalOpportunities = 0;
    const opportunityStatusCounts: Record<string, number> = {};
    for (const row of oppRows) {
      totalOpportunities += row.count;
      opportunityStatusCounts[row.action] = row.count;
    }

    // Query C: conversations count (unchanged)
    const conversationCount = db
      .prepare("SELECT COUNT(*) as count FROM conversations")
      .get() as { count: number };

    const cost = parseFloat((conversationCount.count * 0.05).toFixed(2));

    const botStatus = checkBotStatus();

    return NextResponse.json({
      todaySignals: todayCount,
      categoryCounts,
      totalSignals,
      totalOpportunities,
      cost,
      signalsBySource,
      opportunityStatusCounts,
      botStatus,
    }, {
      headers: {
        // Stats can be slightly stale — cache 30s, allow stale for 2m while revalidating
        "Cache-Control": "private, max-age=30, stale-while-revalidate=120",
      },
    });
  } catch (err) {
    logger.error("stats/GET", "Failed to fetch stats", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
