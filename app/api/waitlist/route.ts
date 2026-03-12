import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendTelegramMessage } from "@/app/api/notify/telegram/route";

export async function POST(req: NextRequest) {
  try {
    const { telegram, email } = await req.json();

    if (!telegram || typeof telegram !== "string") {
      return NextResponse.json({ error: "telegram is required" }, { status: 400 });
    }

    const db = getDb();

    db.exec(`
      CREATE TABLE IF NOT EXISTS waitlist (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        telegram   TEXT NOT NULL,
        email      TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.prepare("INSERT INTO waitlist (telegram, email) VALUES (?, ?)").run(
      telegram,
      email || null
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
    console.error("waitlist error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
