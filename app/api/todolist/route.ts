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

    const todos = db
      .prepare(
        `SELECT * FROM opportunity_actions
         WHERE action = 'todo' AND (user_id = 'system' OR user_id = ?)
         ORDER BY created_at DESC`
      )
      .all(userId);

    return NextResponse.json({ todos });
  } catch (err) {
    console.error("Failed to fetch todo list:", err);
    return NextResponse.json({ error: "Failed to fetch todo list" }, { status: 500 });
  }
}
