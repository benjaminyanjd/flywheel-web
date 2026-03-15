import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const db = getDb();
    db.prepare(
      "UPDATE opportunity_actions SET action = NULL, acted_at = NULL WHERE id = ? AND user_id = ?"
    ).run(Number(id), userId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("opportunities/action/DELETE", "Failed to undo opportunity action", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to undo" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { action, cancel_reason, advisor_notes } = await req.json();

    const validActions = ["todo", "bias", "action", "done", "cancel"];
    if (!action || !validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(", ")}` },
        { status: 400 }
      );
    }

    const db = getDb();

    // Verify opportunity exists and belongs to this user (or is system-created)
    const existing = db.prepare(
      "SELECT id FROM opportunity_actions WHERE id = ? AND (user_id = ? OR user_id = 'system')"
    ).get(Number(id), userId);
    if (!existing) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }

    if (action === "cancel") {
      db.prepare(
        `UPDATE opportunity_actions
         SET action = ?, cancel_reason = ?, user_id = ?, acted_at = datetime('now')
         WHERE id = ?`
      ).run(action, cancel_reason || null, userId, id);
    } else if (advisor_notes) {
      db.prepare(
        `UPDATE opportunity_actions
         SET action = ?, advisor_notes = ?, user_id = ?, acted_at = datetime('now')
         WHERE id = ?`
      ).run(action, advisor_notes, userId, id);
    } else {
      db.prepare(
        `UPDATE opportunity_actions
         SET action = ?, user_id = ?, acted_at = datetime('now')
         WHERE id = ?`
      ).run(action, userId, id);
    }

    const updated = db.prepare("SELECT * FROM opportunity_actions WHERE id = ?").get(id);

    return NextResponse.json({ opportunity: updated });
  } catch (err) {
    logger.error("opportunities/action/POST", "Failed to update opportunity action", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to update opportunity" }, { status: 500 });
  }
}
