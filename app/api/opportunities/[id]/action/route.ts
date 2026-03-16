import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { logger } from "@/lib/logger";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rlKey = getRateLimitKey(req, userId);
    const rl = rateLimit(rlKey, { limit: 20, windowSec: 60, prefix: "opp_action" });
    if (!rl.success) {
      return NextResponse.json(
        { error: "請求過於頻繁，請稍後再試" },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }
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

    const rlKey = getRateLimitKey(req, userId);
    const rl = rateLimit(rlKey, { limit: 20, windowSec: 60, prefix: "opp_action" });
    if (!rl.success) {
      return NextResponse.json(
        { error: "請求過於頻繁，請稍後再試" },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
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

      // Record dislike keyword from opp_embed.title (first 10 chars as MVP)
      try {
        const opp = db.prepare("SELECT opp_embed FROM opportunity_actions WHERE id = ?").get(Number(id)) as { opp_embed: string | null } | undefined;
        if (opp?.opp_embed) {
          const embed = JSON.parse(opp.opp_embed);
          const keyword = (embed.title || "").slice(0, 10).trim();
          if (keyword) {
            // Get existing dislikes
            const settings = db.prepare("SELECT opp_dislike FROM user_settings WHERE user_id = ?").get(userId) as { opp_dislike: string | null } | undefined;
            const existing = settings?.opp_dislike ? settings.opp_dislike.split(",").map(s => s.trim()).filter(Boolean) : [];
            // Append deduped, max 20
            if (!existing.includes(keyword)) {
              existing.push(keyword);
              if (existing.length > 20) existing.splice(0, existing.length - 20);
            }
            // Upsert user_settings
            db.prepare(`INSERT INTO user_settings (user_id, opp_dislike) VALUES (?, ?)
              ON CONFLICT(user_id) DO UPDATE SET opp_dislike = excluded.opp_dislike`
            ).run(userId, existing.join(","));
          }
        }
      } catch (dislikeErr) {
        logger.error("opportunities/action/POST", "Failed to record opp_dislike", { error: dislikeErr instanceof Error ? dislikeErr.message : String(dislikeErr) });
      }
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
