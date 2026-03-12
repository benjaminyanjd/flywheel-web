import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Anthropic from "@anthropic-ai/sdk";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are the Flywheel Advisor — a strategic AI assistant for a solo entrepreneur running an automated signal-to-opportunity pipeline. Your role is to help analyze trends, prioritize opportunities, suggest monetization strategies, and provide actionable business advice.

You have access to recent hot signals from various sources (Reddit, Hacker News, Twitter, newsletters, etc.) and can see the user's opportunity pipeline. Use this context to give informed, specific advice rather than generic suggestions.

Be concise, direct, and action-oriented. Focus on practical next steps the user can take today.`;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const db = getDb();

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

    // Get recent advisor conversations for history
    const recentConversations = db
      .prepare(
        `SELECT input_summary, output
         FROM conversations
         WHERE type = 'advisor'
         ORDER BY created_at DESC
         LIMIT 5`
      )
      .all() as { input_summary: string; output: string }[];

    // Build messages array with history
    const messages: Anthropic.MessageParam[] = [];

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

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const stream = await client.messages.stream({
      model: "claude-opus-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT + contextStr,
      messages,
    });

    const encoder = new TextEncoder();
    let fullResponse = "";

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const chunk = event.delta.text;
              fullResponse += chunk;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`)
              );
            }
          }

          // Save conversation to DB after streaming completes
          db.prepare(
            `INSERT INTO conversations (type, input_summary, output)
             VALUES ('advisor', ?, ?)`
          ).run(message, fullResponse);

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
          );
          controller.close();
        } catch (err) {
          console.error("Advisor stream error:", err);
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
    console.error("Advisor error:", err);
    return NextResponse.json({ error: "Advisor request failed" }, { status: 500 });
  }
}
