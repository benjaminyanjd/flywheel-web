import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();

    const opportunities = db
      .prepare(
        `SELECT * FROM opportunity_actions
         WHERE created_at >= datetime('now', '-7 days')
         ORDER BY created_at DESC`
      )
      .all();

    return NextResponse.json({ opportunities });
  } catch (err) {
    console.error("Failed to fetch opportunities:", err);
    return NextResponse.json({ error: "Failed to fetch opportunities" }, { status: 500 });
  }
}
