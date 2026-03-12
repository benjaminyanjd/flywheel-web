"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getLangStored, type Lang } from "@/lib/lang";
import { useToast } from "@/components/toast";

const CATEGORIES = [
  { value: "ai_tech", zh: "🤖 AI 科技", en: "🤖 AI Tech" },
  { value: "crypto_policy", zh: "₿ 加密政策", en: "₿ Crypto Policy" },
  { value: "new_tools", zh: "🔧 新工具", en: "🔧 New Tools" },
  { value: "overseas_trends", zh: "🌍 海外趨勢", en: "🌍 Overseas Trends" },
  { value: "x_kol", zh: "⭐ KOL 動態", en: "⭐ KOL" },
];

interface Props {
  initialSettings: any;
}

export default function SettingsClient({ initialSettings }: Props) {
  const toast = useToast();
  const [lang, setLangState] = useState<Lang>("zh");

  useEffect(() => {
    setLangState(getLangStored());
    const handler = (e: Event) => setLangState((e as CustomEvent<Lang>).detail);
    window.addEventListener("flywheel-lang-change", handler);
    return () => window.removeEventListener("flywheel-lang-change", handler);
  }, []);

  // Telegram state
  const [chatId, setChatId] = useState(initialSettings?.telegram_chat_id || "");
  const [tgStatus, setTgStatus] = useState<"idle" | "saving" | "saved" | "testing" | "sent" | "error">("idle");
  // Track if user already had Telegram bound (to avoid re-sending welcome digest)
  const [hasExistingTelegram, setHasExistingTelegram] = useState(!!initialSettings?.telegram_chat_id);

  // Categories state
  const [categories, setCategories] = useState<string[]>(() => {
    try {
      return JSON.parse(initialSettings?.categories || "[]");
    } catch {
      return ["ai_tech", "crypto_policy", "new_tools", "overseas_trends", "x_kol"];
    }
  });
  const [catStatus, setCatStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Language state
  const [currentLang, setCurrentLang] = useState<Lang>("zh");
  useEffect(() => {
    setCurrentLang(getLangStored());
  }, [lang]);

  function switchLang(l: Lang) {
    localStorage.setItem("flywheel-lang", l);
    setCurrentLang(l);
    setLangState(l);
    window.dispatchEvent(new CustomEvent("flywheel-lang-change", { detail: l }));
  }

  function toggleCategory(val: string) {
    setCategories((prev) =>
      prev.includes(val) ? prev.filter((c) => c !== val) : [...prev, val]
    );
  }

  async function saveTelegram() {
    setTgStatus("saving");
    try {
      const res = await fetch("/api/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegram_chat_id: chatId || null,
          notify_channel: chatId ? "telegram" : "none",
          categories,
        }),
      });
      if (res.ok) {
        setTgStatus("saved");
        toast("✅ Telegram 已綁定");
        setTimeout(() => setTgStatus("idle"), 2000);
        // Send welcome digest only on first-time binding
        if (!hasExistingTelegram && chatId) {
          fetch("/api/user/welcome-digest", { method: "POST" }).catch(() => {})
          setHasExistingTelegram(true)
        }
      } else {
        setTgStatus("error");
        toast("❌ 保存失敗，請重試", "error");
      }
    } catch {
      setTgStatus("error");
      toast("❌ 保存失敗，請重試", "error");
    }
  }

  async function testTelegram() {
    setTgStatus("testing");
    try {
      const res = await fetch("/api/notify/telegram", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setTgStatus("sent");
        toast("✅ 測試消息已發送");
      } else {
        setTgStatus("error");
        toast("❌ 保存失敗，請重試", "error");
      }
      setTimeout(() => setTgStatus("idle"), 3000);
    } catch {
      setTgStatus("error");
      toast("❌ 保存失敗，請重試", "error");
    }
  }

  async function saveCategories() {
    setCatStatus("saving");
    try {
      const res = await fetch("/api/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories }),
      });
      if (res.ok) {
        setCatStatus("saved");
        toast("✅ 偏好已保存");
        setTimeout(() => setCatStatus("idle"), 2000);
      } else {
        toast("❌ 保存失敗，請重試", "error");
        setCatStatus("idle");
      }
    } catch {
      toast("❌ 保存失敗，請重試", "error");
      setCatStatus("idle");
    }
  }

  const t = lang === "zh";

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8 pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-slate-100">
          ⚙️ {t ? "設置" : "Settings"}
        </h1>

        {/* Telegram Push */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100 text-lg">
              ✈️ {t ? "Telegram 推送" : "Telegram Notifications"}
            </CardTitle>
            <p className="text-slate-400 text-sm">
              {t
                ? "輸入你的 Telegram Chat ID 以接收機會推送通知"
                : "Enter your Telegram Chat ID to receive opportunity push notifications"}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-700/30 rounded-lg p-3 text-sm text-slate-400 space-y-1 mb-2">
              <p className="text-slate-300 font-medium">
                {t ? "如何獲取 Chat ID：" : "How to get your Chat ID:"}
              </p>
              {t ? (
                <>
                  <p>1. Telegram 搜索 <span className="font-mono text-amber-400">@userinfobot</span></p>
                  <p>2. 發送任意消息</p>
                  <p>3. 複製回覆裡的 <span className="font-mono text-amber-400">Id:</span> 數字貼到下方</p>
                </>
              ) : (
                <>
                  <p>1. Search <span className="font-mono text-amber-400">@userinfobot</span> on Telegram</p>
                  <p>2. Send any message</p>
                  <p>3. Copy the <span className="font-mono text-amber-400">Id:</span> number below</p>
                </>
              )}
            </div>

            <Input
              value={chatId}
              onChange={(e) => setChatId(e.target.value.replace(/\D/g, ""))}
              placeholder={t ? "例如：5825881638" : "e.g. 5825881638"}
              className="bg-slate-700 border-slate-600 text-slate-100 font-mono"
            />

            <div className="flex gap-3">
              <Button
                onClick={saveTelegram}
                disabled={tgStatus === "saving" || !chatId}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950"
              >
                {tgStatus === "saving"
                  ? t ? "保存中..." : "Saving..."
                  : t ? "保存" : "Save"}
              </Button>
              <Button
                onClick={testTelegram}
                disabled={tgStatus === "testing" || !chatId}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                {tgStatus === "testing"
                  ? t ? "發送中..." : "Sending..."
                  : t ? "發送測試消息" : "Send Test"}
              </Button>
            </div>

            {tgStatus === "saved" && (
              <p className="text-green-400 text-sm">✅ {t ? "已綁定" : "Saved"}</p>
            )}
            {tgStatus === "sent" && (
              <p className="text-green-400 text-sm">✅ {t ? "測試消息已發送" : "Test message sent"}</p>
            )}
            {tgStatus === "error" && (
              <p className="text-red-400 text-sm">❌ {t ? "發送失敗，請檢查 Chat ID" : "Failed, check your Chat ID"}</p>
            )}
          </CardContent>
        </Card>

        {/* Categories */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100 text-lg">
              📡 {t ? "話題偏好" : "Topic Preferences"}
            </CardTitle>
            <p className="text-slate-400 text-sm">
              {t
                ? "Flywheel 將優先掃描以下話題的信號"
                : "Flywheel will prioritize scanning signals for these topics"}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => toggleCategory(cat.value)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                  categories.includes(cat.value)
                    ? "border-amber-500 bg-amber-500/20 text-amber-300"
                    : "border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500"
                }`}
              >
                {t ? cat.zh : cat.en}
              </button>
            ))}
            <Button
              onClick={saveCategories}
              disabled={catStatus === "saving" || categories.length === 0}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 mt-2"
            >
              {catStatus === "saving"
                ? t ? "保存中..." : "Saving..."
                : catStatus === "saved"
                ? t ? "✅ 已保存" : "✅ Saved"
                : t ? "保存偏好" : "Save Preferences"}
            </Button>
          </CardContent>
        </Card>

        {/* Language */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100 text-lg">
              🌐 {t ? "語言設置" : "Language"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button
              onClick={() => switchLang("zh")}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                currentLang === "zh"
                  ? "border-amber-500 bg-amber-500/20 text-amber-300"
                  : "border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500"
              }`}
            >
              🇨🇳 中文（信號自動翻譯）
            </button>
            <button
              onClick={() => switchLang("en")}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                currentLang === "en"
                  ? "border-amber-500 bg-amber-500/20 text-amber-300"
                  : "border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500"
              }`}
            >
              🇺🇸 English (show original)
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
