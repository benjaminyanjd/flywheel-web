import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const db = getDb();
    const settings = db.prepare("SELECT * FROM user_settings WHERE user_id = ?").get(userId);
    return NextResponse.json(settings || null);
  } catch (err) {
    logger.error("user/settings/GET", "Failed to fetch settings", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

const VALID_CATEGORIES = ["ai_tech", "crypto_policy", "new_tools", "overseas_trends", "x_kol", "finance", "geopolitics"];
const VALID_CHANNELS = ["none", "telegram", "email"];
const VALID_INTERVALS = [30, 60, 120, 360];
const VALID_ROLES = ["indie_dev", "investor", "founder", "researcher"];
const VALID_FOCUS = ["ai", "crypto", "saas", "overseas", "all"];
const VALID_OPP_TYPES = ["tools", "arbitrage", "content", "all"];
const VALID_PROFIT_SOURCE = ["crypto_trading", "ai_content", "info_arbitrage", "saas_tech", "early_investment"];
const VALID_CORE_SKILLS = ["trading", "content_ops", "coding", "sales_biz"];
const VALID_OPP_HORIZON = ["short_term", "mid_term", "long_term"];
const VALID_RISK_LEVEL = ["conservative", "balanced", "aggressive"];
const VALID_TIME_BUDGET = ["under_1h", "1_3h", "unlimited"];

export async function POST(req: NextRequest) {
  try {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Validate categories
  const rawCats = Array.isArray(body.categories) ? body.categories : [];
  const categories = rawCats
    .filter((c): c is string => typeof c === "string" && VALID_CATEGORIES.includes(c))
    .slice(0, 10);

  // Validate scan_interval
  const scanInterval = VALID_INTERVALS.includes(Number(body.scan_interval))
    ? Number(body.scan_interval)
    : 60;

  // Validate notify_channel
  const notifyChannel =
    typeof body.notify_channel === "string" && VALID_CHANNELS.includes(body.notify_channel)
      ? body.notify_channel
      : "none";

  // Validate email
  const email =
    typeof body.email === "string" && body.email.length <= 256 && body.email.includes("@")
      ? body.email.trim()
      : null;

  // Validate telegram_chat_id (numeric string)
  const telegramChatId =
    typeof body.telegram_chat_id === "string" && /^-?\d{1,20}$/.test(body.telegram_chat_id.trim())
      ? body.telegram_chat_id.trim()
      : typeof body.telegram_chat_id === "number"
        ? String(body.telegram_chat_id)
        : null;

  const db = getDb();

  db.prepare(`
    INSERT INTO user_settings (user_id, categories, scan_interval, notify_channel, email, telegram_chat_id, onboarding_done)
    VALUES (?, ?, ?, ?, ?, ?, 1)
    ON CONFLICT(user_id) DO UPDATE SET
      categories = excluded.categories,
      scan_interval = excluded.scan_interval,
      notify_channel = excluded.notify_channel,
      email = excluded.email,
      telegram_chat_id = excluded.telegram_chat_id,
      onboarding_done = 1
  `).run(
    userId,
    JSON.stringify(categories.length > 0 ? categories : ["ai_tech", "crypto_policy", "new_tools", "overseas_trends", "x_kol"]),
    scanInterval,
    notifyChannel,
    email,
    telegramChatId
  );

  logger.info("user/settings/POST", "Settings saved", { userId });
  return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("user/settings/POST", "Failed to save settings", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const userRole =
      typeof body.user_role === "string" && VALID_ROLES.includes(body.user_role)
        ? body.user_role
        : null;

    const userFocus =
      typeof body.user_focus === "string"
        ? body.user_focus.split(",").filter((f: string) => VALID_FOCUS.includes(f.trim())).join(",") || null
        : null;

    const oppType =
      typeof body.opp_type === "string"
        ? body.opp_type.split(",").filter((t: string) => VALID_OPP_TYPES.includes(t.trim())).join(",") || null
        : null;

    const profitSource =
      typeof body.profit_source === "string"
        ? body.profit_source.split(",").filter((v: string) => VALID_PROFIT_SOURCE.includes(v.trim())).join(",") || null
        : null;

    const coreSkills =
      typeof body.core_skills === "string"
        ? body.core_skills.split(",").filter((v: string) => VALID_CORE_SKILLS.includes(v.trim())).join(",") || null
        : null;

    const oppHorizon =
      typeof body.opp_horizon === "string" && VALID_OPP_HORIZON.includes(body.opp_horizon)
        ? body.opp_horizon
        : null;

    const riskLevel =
      typeof body.risk_level === "string" && VALID_RISK_LEVEL.includes(body.risk_level)
        ? body.risk_level
        : null;

    const timeBudget =
      typeof body.time_budget === "string" && VALID_TIME_BUDGET.includes(body.time_budget)
        ? body.time_budget
        : null;

    const db = getDb();
    db.prepare(`INSERT OR IGNORE INTO user_settings (user_id) VALUES (?)`).run(userId);
    db.prepare(`UPDATE user_settings SET user_role = ?, user_focus = ?, opp_type = ?, profit_source = ?, core_skills = ?, opp_horizon = ?, risk_level = ?, time_budget = ? WHERE user_id = ?`)
      .run(userRole, userFocus, oppType, profitSource, coreSkills, oppHorizon, riskLevel, timeBudget, userId);

    logger.info("user/settings/PATCH", "Preferences saved", { userId });
    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("user/settings/PATCH", "Failed to save preferences", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to save preferences" }, { status: 500 });
  }
}
