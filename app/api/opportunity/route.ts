import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { spawn } from "child_process";

const COOLDOWN_SECONDS = 30 * 60; // 30 minutes

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();

    // Check cooldown (shares last_scan_at with scan)
    const settings = db
      .prepare(`SELECT last_scan_at FROM user_settings WHERE user_id = ?`)
      .get(userId) as { last_scan_at: string | null } | undefined;

    if (settings?.last_scan_at) {
      const lastScan = new Date(settings.last_scan_at + "Z").getTime();
      const elapsed = (Date.now() - lastScan) / 1000;
      if (elapsed < COOLDOWN_SECONDS) {
        const remaining = Math.ceil(COOLDOWN_SECONDS - elapsed);
        return NextResponse.json({ error: "冷卻中", cooldown: remaining }, { status: 429 });
      }
    }

    const script = process.env["FLYWHEEL_OPP_SCRIPT"];
    if (!script) {
      return NextResponse.json({ status: "error", message: "FLYWHEEL_OPP_SCRIPT not configured" }, { status: 500 });
    }

    const child = spawn("node", [script], { detached: true, stdio: "ignore" });
    child.unref();

    // Delayed Telegram push after opportunity generation completes
    setTimeout(async () => {
      try {
        const db2 = getDb();
        const opps = db2.prepare(
          `SELECT opp_title, opp_embed FROM opportunity_actions
           WHERE created_at >= datetime("now", "-5 minutes")
           AND action = "pending"
           ORDER BY opp_rank DESC LIMIT 3`
        ).all() as any[];

        if (opps.length === 0) return;

        const users = db2.prepare(
          `SELECT telegram_chat_id FROM user_settings
           WHERE telegram_chat_id IS NOT NULL AND telegram_chat_id != ""`
        ).all() as any[];

        if (users.length === 0) return;

        const lines = opps.map((o: any) => {
          let conf = "";
          try { conf = `  置信度：${JSON.parse(o.opp_embed).confidence}%`; } catch {}
          return `💎 *${o.opp_title}*${conf}`;
        });
        const msg = `🔔 *Flywheel 新機會*\n\n${lines.join("\n\n")}\n\n🔗 [查看詳情](https://flywheelsea.club/opportunities)`;

        const token = process.env.TELEGRAM_BOT_TOKEN;
        if (!token) return;
        for (const user of users) {
          await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: user.telegram_chat_id, text: msg, parse_mode: "Markdown", disable_web_page_preview: true }),
          }).catch(() => {});
        }
      } catch {}
    }, 30000);

    // Update last_scan_at
    db.prepare(
      `INSERT INTO user_settings (user_id, last_scan_at) VALUES (?, datetime('now'))
       ON CONFLICT(user_id) DO UPDATE SET last_scan_at = datetime('now')`
    ).run(userId);

    return NextResponse.json({ status: "started", message: "机会识别已启动，完成后刷新机会页面查看结果" });
  } catch (err) {
    console.error("Opportunity error:", err);
    return NextResponse.json({ error: "Opportunity analysis failed" }, { status: 500 });
  }
}
