"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getLangStored, type Lang } from "@/lib/lang";
import { useT } from "@/lib/i18n";
import { useToast } from "@/components/toast";

const CATEGORIES = [
  { value: "ai_tech", zh: "🤖 AI 科技", en: "🤖 AI Tech" },
  { value: "crypto_policy", zh: "₿ 加密政策", en: "₿ Crypto Policy" },
  { value: "new_tools", zh: "🔧 新工具", en: "🔧 New Tools" },
  { value: "overseas_trends", zh: "🌍 海外趨勢", en: "🌍 Overseas Trends" },
  { value: "x_kol", zh: "⭐ KOL 動態", en: "⭐ KOL" },
];

interface UserSettings {
  categories: string | null;
  scan_interval: number | null;
  notify_channel: string | null;
  email: string | null;
  telegram_chat_id: string | null;
  user_role: string | null;
  user_focus: string | null;
  opp_type: string | null;
}

interface Props {
  initialSettings: UserSettings | null;
  hasTelegram: boolean;
}

export default function SettingsClient({ initialSettings, hasTelegram }: Props) {
  const toast = useToast();
  const { t: tr } = useT();
  const [lang, setLangState] = useState<Lang>(() => {
    // SSR-safe: default "zh", will be updated on client mount
    if (typeof window !== "undefined") return getLangStored();
    return "zh";
  });

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


  function switchLang(l: Lang) {
    localStorage.setItem("flywheel-lang", l);
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
        toast(tr("settings_tg_toast_ok"));
        setTimeout(() => setTgStatus("idle"), 2000);
        // Send welcome digest only on first-time binding
        if (!hasExistingTelegram && chatId) {
          fetch("/api/user/welcome-digest", { method: "POST" }).catch((err) => console.error("settings/welcomeDigest:", err))
          setHasExistingTelegram(true)
        }
      } else {
        setTgStatus("error");
        toast(tr("settings_tg_toast_fail"), "error");
      }
    } catch {
      setTgStatus("error");
      toast(tr("settings_tg_toast_fail"), "error");
    }
  }

  async function testTelegram() {
    setTgStatus("testing");
    try {
      const res = await fetch("/api/notify/telegram", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setTgStatus("sent");
        toast(tr("settings_tg_toast_test_ok"));
      } else {
        setTgStatus("error");
        toast(tr("settings_tg_toast_fail"), "error");
      }
      setTimeout(() => setTgStatus("idle"), 3000);
    } catch {
      setTgStatus("error");
      toast(tr("settings_tg_toast_fail"), "error");
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
        toast(tr("settings_cat_toast_ok"));
        setTimeout(() => setCatStatus("idle"), 2000);
      } else {
        toast(tr("settings_tg_toast_fail"), "error");
        setCatStatus("idle");
      }
    } catch {
      toast(tr("settings_tg_toast_fail"), "error");
      setCatStatus("idle");
    }
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {tr("settings_title")}
        </h1>

        {!hasTelegram && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center justify-between mb-2">
            <span className="text-amber-700 text-sm">尚未綁定 Telegram，無法收到機會推送</span>
            <a href="#telegram" className="text-amber-600 hover:underline text-sm font-medium shrink-0 ml-4">立即綁定 →</a>
          </div>
        )}

        {/* Telegram Push */}
        <Card id="telegram" className="bg-white border border-gray-100 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-gray-900 text-lg">
              {tr("settings_tg_title")}
            </CardTitle>
            <p className="text-gray-500 text-sm">
              {tr("settings_tg_desc")}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-500 space-y-1 mb-2">
              <p className="text-gray-700 font-medium">
                {tr("settings_tg_howto")}
              </p>
              <p>1. {tr("settings_tg_step1")} <span className="font-mono text-gray-900">@userinfobot</span></p>
              <p>2. {tr("settings_tg_step2")}</p>
              <p>3. {tr("settings_tg_step3_pre")} <span className="font-mono text-gray-900">Id:</span> {tr("settings_tg_step3_post")}</p>
            </div>

            <Input
              value={chatId}
              onChange={(e) => setChatId(e.target.value.replace(/\D/g, ""))}
              placeholder={tr("settings_tg_placeholder")}
              className="border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 font-mono"
            />

            <div className="flex gap-3">
              <Button
                onClick={saveTelegram}
                disabled={tgStatus === "saving" || !chatId}
                className="bg-black hover:bg-gray-800 text-white rounded-xl"
              >
                {tgStatus === "saving"
                  ? tr("settings_tg_saving")
                  : tr("settings_tg_save")}
              </Button>
              <Button
                onClick={testTelegram}
                disabled={tgStatus === "testing" || !chatId}
                variant="outline"
                className="border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl"
              >
                {tgStatus === "testing"
                  ? tr("settings_tg_testing")
                  : tr("settings_tg_test")}
              </Button>
            </div>

            {tgStatus === "saved" && (
              <p className="text-green-600 text-sm">{tr("settings_tg_saved")}</p>
            )}
            {tgStatus === "sent" && (
              <p className="text-green-600 text-sm">{tr("settings_tg_sent")}</p>
            )}
            {tgStatus === "error" && (
              <p className="text-red-500 text-sm">{tr("settings_tg_error")}</p>
            )}
          </CardContent>
        </Card>

        {/* Categories */}
        <Card className="bg-white border border-gray-100 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-gray-900 text-lg">
              {tr("settings_cat_title")}
            </CardTitle>
            <p className="text-gray-500 text-sm">
              {tr("settings_cat_desc")}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => toggleCategory(cat.value)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                  categories.includes(cat.value)
                    ? "border-2 border-black bg-black/5 text-black font-medium"
                    : "border border-gray-200 text-gray-600 hover:border-gray-400"
                }`}
              >
                {lang === "zh" ? cat.zh : cat.en}
              </button>
            ))}
            <Button
              onClick={saveCategories}
              disabled={catStatus === "saving" || categories.length === 0}
              className="w-full bg-black hover:bg-gray-800 text-white rounded-xl mt-2"
            >
              {catStatus === "saving"
                ? tr("settings_cat_saving")
                : catStatus === "saved"
                ? tr("settings_cat_saved")
                : tr("settings_cat_save")}
            </Button>
          </CardContent>
        </Card>

        {/* Language */}
        <Card className="bg-white border border-gray-100 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-gray-900 text-lg">
              {tr("settings_lang_title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button
              onClick={() => switchLang("zh")}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                lang === "zh"
                  ? "border-2 border-black bg-black/5 text-black font-medium"
                  : "border border-gray-200 text-gray-600 hover:border-gray-400"
              }`}
            >
              {tr("settings_lang_zh")}
            </button>
            <button
              onClick={() => switchLang("en")}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                lang === "en"
                  ? "border-2 border-black bg-black/5 text-black font-medium"
                  : "border border-gray-200 text-gray-600 hover:border-gray-400"
              }`}
            >
              {tr("settings_lang_en")}
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
