import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();

    const todos = db
      .prepare(
        `SELECT * FROM opportunity_actions
         WHERE action = 'todo'
         ORDER BY created_at DESC`
      )
      .all();

    return NextResponse.json({ todos });
  } catch (err) {
    console.error("Failed to fetch todo list:", err);
    return NextResponse.json({ error: "Failed to fetch todo list" }, { status: 500 });
  }
}
