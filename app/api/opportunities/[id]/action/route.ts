import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { action, cancel_reason } = await req.json();

    const validActions = ["todo", "bias", "action", "done", "cancel"];
    if (!action || !validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(", ")}` },
        { status: 400 }
      );
    }

    const db = getDb();

    // Verify opportunity exists
    const existing = db.prepare("SELECT id FROM opportunity_actions WHERE id = ?").get(id);
    if (!existing) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }

    if (action === "cancel") {
      db.prepare(
        `UPDATE opportunity_actions
         SET action = ?, cancel_reason = ?, acted_at = datetime('now')
         WHERE id = ?`
      ).run(action, cancel_reason || null, id);
    } else {
      db.prepare(
        `UPDATE opportunity_actions
         SET action = ?, acted_at = datetime('now')
         WHERE id = ?`
      ).run(action, id);
    }

    const updated = db.prepare("SELECT * FROM opportunity_actions WHERE id = ?").get(id);

    return NextResponse.json({ opportunity: updated });
  } catch (err) {
    console.error("Failed to update opportunity action:", err);
    return NextResponse.json({ error: "Failed to update opportunity" }, { status: 500 });
  }
}
