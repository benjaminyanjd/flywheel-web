import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  const settings = db.prepare("SELECT * FROM user_settings WHERE user_id = ?").get(userId);
  return NextResponse.json(settings || null);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
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
    JSON.stringify(body.categories || ["ai_tech", "crypto_policy", "new_tools", "overseas_trends", "x_kol"]),
    body.scan_interval || 60,
    body.notify_channel || "none",
    body.email || null,
    body.telegram_chat_id || null
  );

  return NextResponse.json({ success: true });
}
