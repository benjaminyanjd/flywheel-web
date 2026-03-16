import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { getDb } from "@/lib/db";
import { logger } from "@/lib/logger";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ history: [] });
    const db = getDb();
    const rows = db.prepare(
      `SELECT input_summary, output, created_at FROM conversations
       WHERE type = 'advisor' AND user_id = ?
       ORDER BY created_at DESC LIMIT 20`
    ).all(userId) as { input_summary: string; output: string; created_at: string }[];
    // Return in chronological order as message pairs
    const history = rows.reverse().flatMap(r => [
      { role: "user" as const, content: r.input_summary },
      { role: "assistant" as const, content: r.output },
    ]);
    return NextResponse.json({ history });
  } catch {
    return NextResponse.json({ history: [] });
  }
}

const SYSTEM_PROMPT = `You are the 嗅鐘 Advisor — a strategic AI assistant for a solo entrepreneur running an automated signal-to-opportunity pipeline. Your role is to help analyze trends, prioritize opportunities, suggest monetization strategies, and provide actionable business advice.

You have access to recent hot signals from various sources (Reddit, Hacker News, Twitter, newsletters, etc.) and can see the user's opportunity pipeline. Use this context to give informed, specific advice rather than generic suggestions.

你可以訪問以下即時數據：
- 今日高分信號（heat_score ≥ 3）
- 用戶的機會歷史和偏好

當用戶問「今天有什麼值得做的」「推薦機會」「分析信號」時，主動參考以下即時數據回答。

Be concise, direct, and action-oriented. Focus on practical next steps the user can take today.

請務必使用繁體中文回覆，不要使用簡體中文。`;

export async function DELETE() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const db = getDb();
    db.prepare("DELETE FROM conversations WHERE type = 'advisor' AND user_id = ?").run(userId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to clear history" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rlKey = getRateLimitKey(req, userId);
    const rl = rateLimit(rlKey, { limit: 5, windowSec: 60, prefix: "advisor" });
    if (!rl.success) {
      return NextResponse.json(
        { error: "請求過於頻繁，請稍後再試" },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }

    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }
    if (message.length > 2000) {
      return NextResponse.json({ error: "Message too long (max 2000 characters)" }, { status: 400 });
    }

    const db = getDb();

    // Trial rate limit: max 3 advisor queries per day for trial users
    const sub = db.prepare(
      "SELECT trial_end, plan FROM user_subscriptions WHERE user_id = ?"
    ).get(userId) as { trial_end: string | null; plan: string } | undefined;
    const isTrial = sub?.trial_end && new Date(sub.trial_end) > new Date() && (!sub.plan || sub.plan === "trial");
    if (isTrial) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const usageToday = (db.prepare(
        "SELECT COUNT(*) as cnt FROM conversations WHERE type = 'advisor' AND user_id = ? AND created_at >= ?"
      ).get(userId, todayStart.toISOString()) as { cnt: number } | undefined)?.cnt ?? 0;
      if (usageToday >= 3) {
        return NextResponse.json(
          { error: "trial_limit", message: "試用期每天最多 3 次顧問諮詢，明天再來！升級訂閱可享無限次使用。" },
          { status: 429 }
        );
      }
    }

    // Get user's recent opportunity actions for context
    const recentOpps = db.prepare(
      "SELECT opp_title, action, created_at FROM opportunity_actions WHERE user_id = ? OR user_id = 'system' ORDER BY created_at DESC LIMIT 5"
    ).all(userId) as { opp_title: string; action: string; created_at: string }[];
    const contextStr = recentOpps.length > 0
      ? `\n\n用戶最近的機會記錄：\n${recentOpps.map(o => `- ${o.opp_title} (${o.action})`).join('\n')}`
      : '';

    // Get recent hot signals for context
    const hotSignals = db
      .prepare(
        `SELECT source, title, url, description, category, heat_score, monetize_score
         FROM signals
         WHERE created_at >= datetime('now', '-24 hours') AND heat_score >= 3
         ORDER BY heat_score DESC
         LIMIT 10`
      )
      .all();

    // #11 Inject top 5 high-score signals into system prompt
    const todaySignals = db.prepare(`
      SELECT title, heat_score, source, category
      FROM signals
      WHERE heat_score >= 3 AND created_at > datetime('now', '-24 hours')
      ORDER BY heat_score DESC LIMIT 5
    `).all() as { title: string; heat_score: number; source: string; category: string }[];
    const signalContextInject = todaySignals.length > 0
      ? `\n\n📡 今日高分信號：\n${todaySignals.map((s, i) => `${i + 1}. [${s.heat_score}分] ${s.title} (${s.source})`).join('\n')}`
      : '\n\n📡 今日暫無高分信號。';

    // Get recent advisor conversations for history (filtered by user)
    const recentConversations = db
      .prepare(
        `SELECT input_summary, output
         FROM conversations
         WHERE type = 'advisor' AND user_id = ?
         ORDER BY created_at DESC
         LIMIT 5`
      )
      .all(userId) as { input_summary: string; output: string }[];

    // Get user profile for personalized system prompt
    const userSettings = db.prepare("SELECT user_role, user_focus, opp_type FROM user_settings WHERE user_id = ?").get(userId) as { user_role?: string; user_focus?: string; opp_type?: string } | undefined;

    const roleMap: Record<string, string> = { indie_dev: "獨立開發者", investor: "投資者", founder: "創業者", researcher: "研究者" };
    const focusMap: Record<string, string> = { ai: "AI", crypto: "加密貨幣", saas: "SaaS", overseas: "出海" };
    const oppMap: Record<string, string> = { tools: "技術工具", arbitrage: "套利機會", content: "內容創作", growth: "增長策略" };

    let systemPrompt = SYSTEM_PROMPT;
    if (userSettings && (userSettings.user_role || userSettings.user_focus)) {
      const profileParts: string[] = [];
      if (userSettings.user_role && roleMap[userSettings.user_role]) profileParts.push(`身份：${roleMap[userSettings.user_role]}`);
      if (userSettings.user_focus && focusMap[userSettings.user_focus]) profileParts.push(`關注領域：${focusMap[userSettings.user_focus]}`);
      if (userSettings.opp_type && oppMap[userSettings.opp_type]) profileParts.push(`偏好機會類型：${oppMap[userSettings.opp_type]}`);
      if (profileParts.length > 0) {
        systemPrompt += `\n\n用戶資料：${profileParts.join("，")}。請根據此資料調整建議的角度和重點。`;
      }
    }

    // Build messages array with history
    const messages: { role: "user" | "assistant"; content: string }[] = [];

    // Add conversation history (in chronological order)
    for (const conv of recentConversations.reverse()) {
      messages.push({ role: "user", content: conv.input_summary });
      messages.push({ role: "assistant", content: conv.output });
    }

    // Add context about current signals
    const signalContext =
      hotSignals.length > 0
        ? `\n\n[Current hot signals for context:\n${JSON.stringify(hotSignals, null, 2)}]`
        : "";

    messages.push({ role: "user", content: message + signalContext });

    // Use local claude-proxy (OpenAI-compatible) to avoid direct API key dependency
    const client = new OpenAI({ apiKey: "not-needed", baseURL: "http://localhost:3456/v1" });

    const encoder = new TextEncoder();
    let fullResponse = "";

    // Prepend system prompt as a system message
    const allMessages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt + contextStr + signalContextInject },
      ...messages.map(m => ({ role: m.role as "user" | "assistant", content: m.content as string })),
    ];

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          const stream = await client.chat.completions.create({
            model: "claude-sonnet-4",
            max_tokens: 4096,
            messages: allMessages,
            stream: true,
          });

          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) {
              fullResponse += text;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
              );
            }
          }

          // Save conversation to DB after streaming completes
          // Trial users: use transaction to atomically check limit and insert
          if (isTrial) {
            const saveIfUnderLimit = db.transaction(() => {
              const todayStart = new Date();
              todayStart.setHours(0, 0, 0, 0);
              const countNow = (db.prepare(
                "SELECT COUNT(*) as cnt FROM conversations WHERE type = 'advisor' AND user_id = ? AND created_at >= ?"
              ).get(userId, todayStart.toISOString()) as { cnt: number } | undefined)?.cnt ?? 0;
              if (countNow >= 3) return false;
              db.prepare(
                `INSERT INTO conversations (type, input_summary, output, user_id) VALUES ('advisor', ?, ?, ?)`
              ).run(message, fullResponse, userId);
              return true;
            });
            saveIfUnderLimit();
          } else {
            db.prepare(
              `INSERT INTO conversations (type, input_summary, output, user_id) VALUES ('advisor', ?, ?, ?)`
            ).run(message, fullResponse, userId);
          }

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
          );
          controller.close();
        } catch (err) {
          logger.error("advisor/POST", "Advisor stream error", { error: err instanceof Error ? err.message : String(err) });
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "Stream failed" })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new NextResponse(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    logger.error("advisor/POST", "Advisor request failed", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Advisor request failed" }, { status: 500 });
  }
}
