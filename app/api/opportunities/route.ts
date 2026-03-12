import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();

    const opportunities = db
      .prepare(
        `SELECT * FROM opportunity_actions
         WHERE (user_id = 'system' OR user_id = ?)
           AND action NOT IN ('bias','todo','done','cancel')
           AND created_at >= datetime('now', '-7 days')
         ORDER BY created_at DESC`
      )
      .all(userId);

    return NextResponse.json({ opportunities });
  } catch (err) {
    console.error("Failed to fetch opportunities:", err);
    return NextResponse.json({ error: "Failed to fetch opportunities" }, { status: 500 });
  }
}
