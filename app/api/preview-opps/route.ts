import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Public endpoint — no auth required (landing page preview)
// Returns latest 2 high-score opportunities for display
export async function GET() {
  try {
    const db = getDb();

    const rows = db
      .prepare(
        `SELECT opp_title, opp_title_en, opp_embed, opp_embed_en, opp_window, created_at
         FROM opportunity_actions
         WHERE opp_title IS NOT NULL
           AND opp_embed IS NOT NULL
           AND created_at >= datetime('now', '-7 days')
         ORDER BY created_at DESC
         LIMIT 2`
      )
      .all() as Array<{
        opp_title: string;
        opp_title_en: string | null;
        opp_embed: string;
        opp_embed_en: string | null;
        opp_window: string | null;
        created_at: string;
      }>;

    const opps = rows.map((row) => {
      let embed: Record<string, unknown> = {};
      let embed_en: Record<string, unknown> = {};
      try { embed = JSON.parse(row.opp_embed); } catch { /* ignore */ }
      try { if (row.opp_embed_en) embed_en = JSON.parse(row.opp_embed_en); } catch { /* ignore */ }

      return {
        title_zh: row.opp_title,
        title_en: row.opp_title_en || (embed_en.title as string) || row.opp_title,
        why_zh: embed.why_now as string || "",
        why_en: embed_en.why_now as string || embed.why_now as string || "",
        action_zh: Array.isArray(embed.actions) ? (embed.actions[0] as string) : "",
        action_en: Array.isArray(embed_en.actions) ? (embed_en.actions[0] as string) : (Array.isArray(embed.actions) ? (embed.actions[0] as string) : ""),
        confidence: (embed.confidence as number) || 7,
        window: row.opp_window,
        created_at: row.created_at,
      };
    });

    return NextResponse.json({ opps }, {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
      },
    });
  } catch {
    return NextResponse.json({ opps: [] }, { status: 200 });
  }
}
