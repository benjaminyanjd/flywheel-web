import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();

    // Get user settings
    const settings = db.prepare(
      "SELECT profit_source, capital_range, trade_goal, risk_level, time_budget FROM user_settings WHERE user_id = ?"
    ).get(userId) as {
      profit_source: string | null;
      capital_range: string | null;
      trade_goal: string | null;
      risk_level: string | null;
      time_budget: string | null;
    } | undefined;

    if (!settings) {
      return NextResponse.json({ error: "No settings found" }, { status: 404 });
    }

    // Get today's top 5 high-score signals
    const today = new Date().toISOString().slice(0, 10);
    const signals = db.prepare(
      `SELECT title, category, heat_score FROM signals
       WHERE date(created_at) = ?
       ORDER BY heat_score DESC LIMIT 5`
    ).all(today) as { title: string; category: string; heat_score: number }[];

    const signalText = signals.length > 0
      ? signals.map((s, i) => `${i + 1}. [${s.category}] ${s.title}（熱度 ${s.heat_score}）`).join("\n")
      : "暫無今日信號數據";

    const prompt = `你是嗅鐘的交易分析師。根據用戶畫像生成專屬分析。

用戶畫像：
- 交易方式：${settings.profit_source || "未設定"}
- 資金量級：${settings.capital_range || "未設定"}
- 交易目標：${settings.trade_goal || "未設定"}
- 風險偏好：${settings.risk_level || "未設定"}
- 時間預算：${settings.time_budget || "未設定"}

今日高分信號（前5條）：
${signalText}

請生成：
1. 交易風格標籤（2-4個字，例如「高波動獵手」「穩健套利者」）
2. avatar_style 關鍵詞（從以下選一個：surfer / sniper / turtle / rocket / whale / ninja，代表用戶交易風格的形象）
3. 你最大的風險提醒（1-2句，說出用戶可能沒意識到的弱點）
4. 為你定制的風控規則（3-4條，帶具體數字）
5. 本週建議關注（基於今日信號，2-3條具體行動）
6. 嗅鐘會為你做的事（2-3條）

語氣：專業但不冰冷，像一個懂行的朋友在給建議。用繁體中文。
重要：不要使用任何 emoji 表情符號，全部用文字表達。`;

    // Call claude-proxy with streaming
    const response = await fetch("http://localhost:3456/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-3-5-haiku-latest",
        messages: [{ role: "user", content: prompt }],
        stream: true,
        max_tokens: 1024,
      }),
    });

    if (!response.ok || !response.body) {
      logger.error("welcome-analysis", "Claude proxy request failed", { status: response.status });
      return NextResponse.json({ error: "AI service unavailable" }, { status: 502 });
    }

    // Stream the response through as SSE
    const reader = response.body.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || trimmed === "data: [DONE]") {
                if (trimmed === "data: [DONE]") {
                  controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                  controller.close();
                  return;
                }
                continue;
              }
              if (trimmed.startsWith("data: ")) {
                try {
                  const json = JSON.parse(trimmed.slice(6));
                  const content = json.choices?.[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                  }
                } catch {
                  // skip malformed JSON
                }
              }
            }
          }
        } catch (err) {
          logger.error("welcome-analysis", "Stream error", { error: err instanceof Error ? err.message : String(err) });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (err) {
    logger.error("welcome-analysis", "Failed", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
