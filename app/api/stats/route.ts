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

    const todayCount = db
      .prepare(
        `SELECT COUNT(*) as count FROM signals
         WHERE date(created_at) = date('now')`
      )
      .get() as { count: number };

    const categoryCountRows = db
      .prepare(
        `SELECT category, COUNT(*) as count FROM signals
         WHERE date(created_at) = date('now')
         GROUP BY category`
      )
      .all() as { category: string; count: number }[];

    const categoryCounts: Record<string, number> = {};
    for (const row of categoryCountRows) {
      categoryCounts[row.category] = row.count;
    }

    const sourceRows = db
      .prepare(
        `SELECT source, COUNT(*) as count FROM signals
         GROUP BY source
         ORDER BY count DESC`
      )
      .all() as { source: string; count: number }[];

    const signalsBySource: Record<string, number> = {};
    for (const row of sourceRows) {
      signalsBySource[row.source] = row.count;
    }

    const totalSignals = db
      .prepare("SELECT COUNT(*) as count FROM signals")
      .get() as { count: number };

    const totalOpportunities = db
      .prepare("SELECT COUNT(*) as count FROM opportunity_actions WHERE (user_id = 'system' OR user_id = ?)")
      .get(userId) as { count: number };

    const statusRows = db
      .prepare(
        `SELECT action, COUNT(*) as count FROM opportunity_actions
         WHERE (user_id = 'system' OR user_id = ?)
         GROUP BY action`
      )
      .all(userId) as { action: string; count: number }[];

    const opportunityStatusCounts: Record<string, number> = {};
    for (const row of statusRows) {
      opportunityStatusCounts[row.action] = row.count;
    }

    const conversationCount = db
      .prepare("SELECT COUNT(*) as count FROM conversations")
      .get() as { count: number };

    const cost = parseFloat((conversationCount.count * 0.05).toFixed(2));

    const botStatus = checkBotStatus();

    return NextResponse.json({
      todaySignals: todayCount.count,
      categoryCounts,
      totalSignals: totalSignals.count,
      totalOpportunities: totalOpportunities.count,
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
