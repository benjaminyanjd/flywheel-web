import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
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

    const total = db.prepare(`SELECT COUNT(*) as count FROM signals ${where}`).get(...params) as { count: number };

    const signals = db
      .prepare(`SELECT * FROM signals ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
      .all(...params, limit, offset);

    return NextResponse.json({
      signals,
      total: total.count,
      page,
      limit,
    });
  } catch (err) {
    console.error("Failed to fetch signals:", err);
    return NextResponse.json({ error: "Failed to fetch signals" }, { status: 500 });
  }
}
