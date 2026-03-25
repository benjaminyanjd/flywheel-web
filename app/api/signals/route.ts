import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const source = searchParams.get("source") || "all";
    const category = searchParams.get("category") || "all";
    const offset = (page - 1) * limit;

    const db = getDb();

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    // 时间窗口：默认 72h，可通过 ?hours=N 覆盖（最大 168h=7天）
    const hoursParam = Math.min(168, Math.max(1, parseInt(searchParams.get("hours") || "72", 10)));
    const cutoff = new Date(Date.now() - hoursParam * 60 * 60 * 1000).toISOString();
    conditions.push("created_at >= ?");
    params.push(cutoff);

    if (source !== "all") {
      conditions.push("source = ?");
      params.push(source);
    }
    if (category !== "all") {
      conditions.push("category = ?");
      params.push(category);
    }

    const where = `WHERE ${conditions.join(" AND ")}`;

    const heatWhereCount = `${where} AND heat_score > 0`;
    const total = db.prepare(`SELECT COUNT(*) as count FROM signals ${heatWhereCount}`).get(...params) as { count: number };

    // 混合排序：时效性优先（48h内）+ heat_score 加权
    // 最近 48h 内的信号 heat_score × 1.5 加权，超过 48h 的按原始分
    const heatWhere = `${where} AND heat_score > 0`;
    const signals = db
      .prepare(`
        SELECT *,
          CASE WHEN created_at >= datetime('now', '-48 hours')
               THEN heat_score * 1.5
               ELSE heat_score
          END AS effective_score
        FROM signals ${heatWhere}
        ORDER BY effective_score DESC, created_at DESC
        LIMIT ? OFFSET ?
      `)
      .all(...params, limit, offset);

    return NextResponse.json({
      signals,
      total: total.count,
      page,
      limit,
    }, {
      headers: {
        // Signals list: cache 15s client-side, allow stale for 60s
        "Cache-Control": "private, max-age=15, stale-while-revalidate=60",
      },
    });
  } catch (err) {
    logger.error("signals/GET", "Failed to fetch signals", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to fetch signals" }, { status: 500 });
  }
}
