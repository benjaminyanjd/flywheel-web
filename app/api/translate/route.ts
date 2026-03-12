import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { texts, targetLang } = await req.json();
    if (!Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json({ translations: [] });
    }

    const target = targetLang === "en" ? "English" : "Chinese";
    const prompt = `Translate to ${target}. If already in ${target}, keep as-is. Output ONLY numbered results, no explanation:
${texts.map((t: string, i: number) => `${i + 1}. ${t}`).join("\n")}`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const output =
      message.content[0].type === "text" ? message.content[0].text : "";
    const lines = output.split("\n").filter((l) => l.trim());
    const translations: string[] = [];

    for (let i = 0; i < texts.length; i++) {
      const pattern = new RegExp(`^${i + 1}\\.\\s*(.+)$`);
      const match = lines.find((l) => pattern.test(l));
      translations.push(match ? match.replace(pattern, "$1").trim() : texts[i]);
    }

    return NextResponse.json({ translations });
  } catch (e) {
    console.error("Translate error:", e);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
