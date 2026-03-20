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

    if (source !== "all") {
      conditions.push("source = ?");
      params.push(source);
    }
    if (category !== "all") {
      conditions.push("category = ?");
      params.push(category);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const heatWhereCount = conditions.length > 0
      ? `${where} AND heat_score > 0`
      : `WHERE heat_score > 0`;
    const total = db.prepare(`SELECT COUNT(*) as count FROM signals ${heatWhereCount}`).get(...params) as { count: number };

    // Filter out zero-score noise (kol_call junk), sort by heat then recency
    const heatWhere = conditions.length > 0
      ? `${where} AND heat_score > 0`
      : `WHERE heat_score > 0`;

    const signals = db
      .prepare(`SELECT * FROM signals ${heatWhere} ORDER BY heat_score DESC, created_at DESC LIMIT ? OFFSET ?`)
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
