import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendTelegramMessage } from "@/app/api/notify/telegram/route";
import { logger } from "@/lib/logger";

// Simple in-memory IP rate limiter: max 3 submissions per IP per hour
const ipRateMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipRateMap.get(ip);
  if (!entry || entry.resetAt < now) {
    ipRateMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true; // allowed
  }
  if (entry.count >= 3) return false; // blocked
  entry.count++;
  return true; // allowed
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting by IP
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "提交過於頻繁，請稍後再試" },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { telegram, email, lang } = body;

    if (!telegram || typeof telegram !== "string") {
      return NextResponse.json({ error: "telegram is required" }, { status: 400 });
    }

    // Input length validation
    if (telegram.length > 64) {
      return NextResponse.json({ error: "Invalid telegram handle" }, { status: 400 });
    }
    if (email && (typeof email !== "string" || email.length > 256)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const db = getDb();

    db.exec(`
      CREATE TABLE IF NOT EXISTS waitlist (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        telegram   TEXT NOT NULL,
        email      TEXT,
        lang       TEXT DEFAULT 'zh',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check for duplicate submission
    const normalizedTelegram = telegram.replace(/^@/, "").toLowerCase();
    const existingEntry = db.prepare("SELECT id FROM waitlist WHERE telegram = ?").get(normalizedTelegram);
    if (existingEntry) {
      return NextResponse.json({ success: true }); // Silent duplicate, don't spam admin
    }

    db.prepare("INSERT INTO waitlist (telegram, email, lang) VALUES (?, ?, ?)").run(
      normalizedTelegram,
      email || null,
      lang || "zh"
    );

    // Send Telegram notification to admin
    const adminChatId = process.env.ADMIN_TELEGRAM_CHAT_ID;
    if (adminChatId) {
      const now = new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });
      const msg = [
        "🔔 新申請邀請碼",
        "",
        `Telegram: @${telegram.replace(/^@/, "")}`,
        `Email: ${email || "未填寫"}`,
        `時間: ${now}`,
      ].join("\n");
      await sendTelegramMessage(adminChatId, msg);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    logger.error("waitlist/POST", "Waitlist submission failed", { error: e instanceof Error ? e.message : String(e) });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
