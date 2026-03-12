import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";

// Internal function to send Telegram message
export async function sendTelegramMessage(chatId: string, text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) return false;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      }),
    });
    const data = await res.json();
    return data.ok === true;
  } catch {
    return false;
  }
}

// API route for testing notification
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const settings = db.prepare("SELECT telegram_chat_id FROM user_settings WHERE user_id = ?").get(userId) as any;

  if (!settings?.telegram_chat_id) {
    return NextResponse.json({ error: "未綁定 Telegram" }, { status: 400 });
  }

  const ok = await sendTelegramMessage(
    settings.telegram_chat_id,
    "✅ *Flywheel 通知測試*\n\n你已成功綁定 Telegram！當有高價值機會時，你將收到即時推送。\n\n🔗 [查看機會](https://flywheelsea.club/opportunities)"
  );

  return NextResponse.json({ success: ok });
}
