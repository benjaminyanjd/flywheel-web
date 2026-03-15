import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { createHash } from "crypto";
import { logger } from "@/lib/logger";

const client = new OpenAI({
  apiKey: "claude-proxy",
  baseURL: "http://localhost:3456/v1",
});

// Per-user daily rate limit: max 30 translation requests per day
const DAILY_LIMIT = 30;
const userDailyUsage = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const entry = userDailyUsage.get(userId);
  if (!entry || now > entry.resetAt) {
    userDailyUsage.set(userId, { count: 1, resetAt: now + dayMs });
    return true;
  }
  if (entry.count >= DAILY_LIMIT) return false;
  entry.count++;
  return true;
}

// Server-side translation cache: key = hash(texts + targetLang), TTL = 24h
interface CacheEntry {
  translations: string[];
  expiresAt: number;
}
const translationCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getCacheKey(texts: string[], targetLang: string): string {
  const raw = texts.join("\x00") + "\x01" + targetLang;
  return createHash("md5").update(raw).digest("hex");
}

function getFromCache(key: string): string[] | null {
  const entry = translationCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    translationCache.delete(key);
    return null;
  }
  return entry.translations;
}

function setCache(key: string, translations: string[]): void {
  // Evict stale entries if cache grows large (keep max 2000 entries)
  if (translationCache.size >= 2000) {
    const now = Date.now();
    for (const [k, v] of translationCache) {
      if (now > v.expiresAt) translationCache.delete(k);
      if (translationCache.size < 1500) break;
    }
  }
  translationCache.set(key, { translations, expiresAt: Date.now() + CACHE_TTL_MS });
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { texts, targetLang } = await req.json();

    // Input validation
    if (!Array.isArray(texts) || texts.length > 20) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    if (texts.length === 0) {
      return NextResponse.json({ translations: [] });
    }

    const sanitizedTexts = texts.map((t: string) => String(t).slice(0, 500));
    const lang = targetLang === "en" ? "en" : "zh";

    // Check server-side cache first (no rate limit consumption)
    const cacheKey = getCacheKey(sanitizedTexts, lang);
    const cached = getFromCache(cacheKey);
    if (cached) {
      return NextResponse.json({ translations: cached, cached: true });
    }

    // Rate limit check only happens when cache misses (actual API call needed)
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: "今日翻譯次數已達上限（30次），請明天再試。" },
        { status: 429 }
      );
    }

    const target = lang === "en" ? "English" : "Chinese";
    const prompt = `Translate to ${target}. If already in ${target}, keep as-is. Output ONLY numbered results, no explanation:
${sanitizedTexts.map((t: string, i: number) => `${i + 1}. ${t}`).join("\n")}`;

    const message = await client.chat.completions.create({
      model: "claude-haiku-4-5",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const output = message.choices[0]?.message?.content ?? "";
    const lines = output.split("\n").filter((l) => l.trim());
    const translations: string[] = [];

    for (let i = 0; i < sanitizedTexts.length; i++) {
      const pattern = new RegExp(`^${i + 1}\\.\\s*(.+)$`);
      const match = lines.find((l) => pattern.test(l));
      translations.push(match ? match.replace(pattern, "$1").trim() : sanitizedTexts[i]);
    }

    // Store in server cache
    setCache(cacheKey, translations);

    return NextResponse.json({ translations });
  } catch (e) {
    logger.error("translate/POST", "Translation failed", { error: e instanceof Error ? e.message : String(e) });
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
