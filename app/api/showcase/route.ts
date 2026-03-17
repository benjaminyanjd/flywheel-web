import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare(`
      SELECT id, opp_title, opp_title_en, opp_embed, opp_embed_en, created_at
      FROM opportunity_actions
      WHERE opp_embed IS NOT NULL
        AND user_id = 'system'
      ORDER BY id DESC
      LIMIT 6
    `).all() as {
      id: number;
      opp_title: string | null;
      opp_title_en: string | null;
      opp_embed: string | null;
      opp_embed_en: string | null;
      created_at: string;
    }[];

    const opps = rows
      .map(r => {
        let embed: Record<string, unknown> = {};
        let embedEn: Record<string, unknown> = {};
        try { embed = JSON.parse(r.opp_embed || "{}"); } catch { /* ignore */ }
        try { embedEn = JSON.parse(r.opp_embed_en || "{}"); } catch { /* ignore */ }
        const conf = (embed.confidence as number) ?? 0;
        return {
          id: r.id,
          title_zh: r.opp_title || "",
          title_en: r.opp_title_en || (embedEn.title as string) || "",
          why_now_zh: (embed.why_now as string) || "",
          why_now_en: (embedEn.why_now as string) || "",
          action_zh: ((embed.actions as string[]) || [])[0] || "",
          action_en: ((embedEn.actions as string[]) || [])[0] || "",
          confidence: conf,
          created_at: r.created_at,
        };
      })
      // pick top 6 by confidence
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 6);

    return NextResponse.json({ opps });
  } catch (err) {
    console.error("[showcase]", err);
    return NextResponse.json({ opps: [] });
  }
}
