import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { logger } from "@/lib/logger";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

// --- Five-dimension filter constants ---

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

// Layer 2: risk_level → minimum confidence threshold
const RISK_CONFIDENCE_MAP: Record<string, number> = {
  conservative: 8,
  balanced: 6,
  aggressive: 4,
};

// Layer 3: trade_goal → category priority for sorting
const STEADY_CATEGORIES = new Set(["funding_rate", "defi_yield", "spread"]);
const PRESERVE_CATEGORIES = new Set(["macro", "whale_move"]);

// Layer 4: time_budget → max opportunities returned
const TIME_LIMIT_MAP: Record<string, number> = {
  under_1h: 5,
  "1_3h": 15,
  unlimited: 999,
};

// Extract confidence from opp_embed JSON
function extractConfidence(embed: unknown): number | null {
  if (!embed || typeof embed !== "object") return null;
  const e = embed as Record<string, unknown>;

  // Direct numeric confidence field
  if (typeof e.confidence === "number") return e.confidence;

  // String format like "8/10"
  if (typeof e.confidence === "string") {
    const m = e.confidence.match(/(\d+)\/10/);
    if (m) return parseInt(m[1], 10);
    const n = parseInt(e.confidence, 10);
    if (!isNaN(n)) return n;
  }

  // Try extracting from title
  if (typeof e.title === "string") {
    const m = e.title.match(/(\d+)\/10/);
    if (m) return parseInt(m[1], 10);
  }

  return null;
}

// Get categories for an opportunity from its signal_ids
function getOppCategories(
  db: ReturnType<typeof getDb>,
  signalIds: number[]
): string[] {
  if (signalIds.length === 0) return [];
  const placeholders = signalIds.map(() => "?").join(",");
  const rows = db
    .prepare(
      `SELECT DISTINCT category FROM signals WHERE id IN (${placeholders})`
    )
    .all(...signalIds) as { category: string }[];
  return rows.map((r) => r.category);
}

interface UserSettings {
  profit_source: string | null;
  capital_range: string | null;
  trade_goal: string | null;
  risk_level: string | null;
  time_budget: string | null;
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 30 req/min per user
    const rlKey = getRateLimitKey(req, userId);
    const rl = rateLimit(rlKey, {
      limit: 30,
      windowSec: 60,
      prefix: "opportunities",
    });
    if (!rl.success) {
      return NextResponse.json(
        { error: "請求過於頻繁，請稍後再試" },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.ceil((rl.resetAt - Date.now()) / 1000)
            ),
          },
        }
      );
    }

    const db = getDb();

    // Get user settings for five-dimension filtering
    const userSettings = db
      .prepare(
        "SELECT profit_source, capital_range, trade_goal, risk_level, time_budget FROM user_settings WHERE user_id = ?"
      )
      .get(userId) as UserSettings | undefined;

    const profitSource = (userSettings?.profit_source || "")
      .split(",")
      .filter(Boolean);
    const riskLevel = userSettings?.risk_level || null;
    const tradeGoal = userSettings?.trade_goal || null;
    const timeBudget = userSettings?.time_budget || null;

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

    // Parse embed for each opportunity (used in layers 2-3)
    type OppWithMeta = (typeof allOpps)[number] & {
      _embed: Record<string, unknown> | null;
      _confidence: number | null;
      _signalIds: number[];
      _categories: string[];
    };

    let opportunities: OppWithMeta[] = allOpps.map((opp: any) => {
      let embed: Record<string, unknown> | null = null;
      try {
        embed = opp.opp_embed ? JSON.parse(opp.opp_embed) : null;
      } catch {
        /* ignore parse errors */
      }

      // signal_ids: could be in embed or top-level column, array or JSON string
      let sids: number[] = [];
      const rawSids = embed?.signal_ids ?? opp.signal_ids;
      if (Array.isArray(rawSids)) {
        sids = rawSids.filter((n: unknown) => typeof n === "number");
      } else if (typeof rawSids === "string") {
        try {
          const parsed = JSON.parse(rawSids);
          if (Array.isArray(parsed))
            sids = parsed.filter((n: unknown) => typeof n === "number");
        } catch {
          /* ignore */
        }
      }

      return {
        ...opp,
        _embed: embed,
        _confidence: extractConfidence(embed),
        _signalIds: sids,
        _categories: getOppCategories(db, sids),
      };
    });

    // --- Layer 1: Category routing (profit_source × CATEGORY_TRADE_MAP) ---
    if (profitSource.length > 0) {
      opportunities = opportunities.filter((opp) => {
        if (opp._signalIds.length === 0) return true; // no signals = show
        for (const cat of opp._categories) {
          const targets = CATEGORY_TRADE_MAP[cat] || [];
          if (targets.length === 0) return true; // security = everyone
          if (targets.some((t) => profitSource.includes(t))) return true;
        }
        return false;
      });
    }

    // --- Layer 2: Confidence threshold (risk_level) ---
    if (riskLevel && RISK_CONFIDENCE_MAP[riskLevel] !== undefined) {
      const minConf = RISK_CONFIDENCE_MAP[riskLevel];
      // learn_explore skips confidence filtering
      if (tradeGoal !== "learn_explore") {
        opportunities = opportunities.filter((opp) => {
          // If no confidence data, keep the opportunity (don't filter unknowns)
          if (opp._confidence === null) return true;
          return opp._confidence >= minConf;
        });
      }
    }

    // --- Layer 3: Sort by trade_goal ---
    if (tradeGoal) {
      opportunities.sort((a, b) => {
        switch (tradeGoal) {
          case "grow_fast": {
            // Higher confidence first
            const ca = a._confidence ?? 0;
            const cb = b._confidence ?? 0;
            return cb - ca;
          }
          case "steady_income": {
            // Stable categories first (funding_rate, defi_yield, spread)
            const sa = a._categories.some((c) => STEADY_CATEGORIES.has(c))
              ? 1
              : 0;
            const sb = b._categories.some((c) => STEADY_CATEGORIES.has(c))
              ? 1
              : 0;
            if (sb !== sa) return sb - sa;
            return (b._confidence ?? 0) - (a._confidence ?? 0);
          }
          case "preserve_grow": {
            // macro, whale_move categories first
            const pa = a._categories.some((c) => PRESERVE_CATEGORIES.has(c))
              ? 1
              : 0;
            const pb = b._categories.some((c) => PRESERVE_CATEGORIES.has(c))
              ? 1
              : 0;
            if (pb !== pa) return pb - pa;
            return (b._confidence ?? 0) - (a._confidence ?? 0);
          }
          case "learn_explore":
          default:
            // Keep original order (newest first)
            return 0;
        }
      });
    }

    // --- Layer 4: Limit by time_budget ---
    const limit =
      timeBudget && TIME_LIMIT_MAP[timeBudget] !== undefined
        ? TIME_LIMIT_MAP[timeBudget]
        : 999;
    opportunities = opportunities.slice(0, limit);

    // Strip internal metadata before returning
    const result = opportunities.map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ _embed, _confidence, _signalIds, _categories, ...rest }) => rest
    );

    return NextResponse.json({ opportunities: result });
  } catch (err) {
    logger.error(
      "opportunities/GET",
      "Failed to fetch opportunities",
      { error: err instanceof Error ? err.message : String(err) }
    );
    return NextResponse.json(
      { error: "Failed to fetch opportunities" },
      { status: 500 }
    );
  }
}
