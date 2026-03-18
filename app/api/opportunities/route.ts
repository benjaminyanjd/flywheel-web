import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { logger } from "@/lib/logger";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 30 req/min per user
    const rlKey = getRateLimitKey(req, userId);
    const rl = rateLimit(rlKey, { limit: 30, windowSec: 60, prefix: "opportunities" });
    if (!rl.success) {
      return NextResponse.json(
        { error: "請求過於頻繁，請稍後再試" },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }

    const db = getDb();

    // Get user trade methods for routing filter
    const userSettings = db.prepare("SELECT profit_source FROM user_settings WHERE user_id = ?").get(userId) as { profit_source: string | null } | undefined;
    const userTradeMethods = (userSettings?.profit_source || "").split(",").filter(Boolean);

    const allOpps = db
      .prepare(
        `SELECT oa.*,
           (SELECT COUNT(*) FROM opportunity_actions oa2
            WHERE oa2.opp_title = oa.opp_title
              AND oa2.action IN ('action', 'todo', 'done')
           ) as action_count
         FROM opportunity_actions oa
         WHERE (oa.user_id = 'system' OR oa.user_id = ?)
           AND oa.action NOT IN ('bias','todo','done','cancel')
           AND oa.created_at >= datetime('now', '-7 days')
         ORDER BY oa.created_at DESC`
      )
      .all(userId);

    // Route filter: match opportunity signal categories to user trade methods
    const CATEGORY_TRADE_MAP: Record<string, string[]> = {
      funding_rate: ["contract", "arbitrage"],
      liquidation: ["contract"],
      whale_move: ["contract", "spot"],
      kol_call: ["spot", "meme"],
      onchain_flow: ["onchain", "meme"],
      token_launch: ["meme", "alpha"],
      airdrop_opp: ["airdrop"],
      listing: ["spot", "alpha"],
      spread: ["arbitrage"],
      security: [], // push to all
      macro: ["contract", "spot"],
      defi_yield: ["onchain", "arbitrage"],
    };

    let opportunities = allOpps;
    if (userTradeMethods.length > 0) {
      opportunities = allOpps.filter((opp: any) => {
        // Parse signal_ids and check categories
        let sids: number[] = [];
        try { sids = JSON.parse(opp.signal_ids || "[]"); } catch { /* ignore */ }
        if (!Array.isArray(sids) || sids.length === 0) return true; // no signals = show anyway

        const signals = db.prepare(
          `SELECT DISTINCT category FROM signals WHERE id IN (${sids.map(() => "?").join(",")})`
        ).all(...sids) as { category: string }[];

        for (const s of signals) {
          const targets = CATEGORY_TRADE_MAP[s.category] || [];
          if (targets.length === 0) return true; // security = everyone
          if (targets.some(t => userTradeMethods.includes(t))) return true;
        }
        return false;
      });
    }

    return NextResponse.json({ opportunities });
  } catch (err) {
    logger.error("opportunities/GET", "Failed to fetch opportunities", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to fetch opportunities" }, { status: 500 });
  }
}
