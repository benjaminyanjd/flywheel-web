"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getLangStored, type Lang } from "@/lib/lang";
import { useT } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { IconAITech, IconCrypto, IconOnchain, IconCommunity, IconKOL, IconAlpha } from "@/components/icons";
import { track } from "@/lib/analytics";

function CheckboxIcon({ checked }: { checked: boolean }) {
  if (checked) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
        <rect x="0.5" y="0.5" width="15" height="15" rx="3.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor"/>
        <path d="M4 8L6.5 10.5L12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <rect x="0.5" y="0.5" width="15" height="15" rx="3.5" stroke="currentColor" strokeOpacity="0.4"/>
    </svg>
  );
}

const CATEGORIES: { value: string; zh: string; en: string; icon: React.ReactNode }[] = [
  { value: "kol", zh: "KOL 動態", en: "KOL", icon: <IconKOL /> },
  { value: "crypto_news", zh: "加密新聞", en: "Crypto News", icon: <IconCrypto /> },
  { value: "onchain", zh: "鏈上資金", en: "On-chain", icon: <IconOnchain /> },
  { value: "ai_tech", zh: "AI 科技", en: "AI & Tech", icon: <IconAITech /> },
  { value: "community", zh: "社區情報", en: "Community", icon: <IconCommunity /> },
  { value: "alpha", zh: "Alpha", en: "Alpha", icon: <IconAlpha /> },
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

  // Subscription state
  const [trialInfo, setTrialInfo] = useState<{ daysLeft: number | null; plan: string | null } | null>(null);

  useEffect(() => {
    fetch("/api/user/trial")
      .then(r => r.json())
      .then(d => setTrialInfo(d))
      .catch(() => {});
  }, []);

  // Telegram state
  const [chatId, setChatId] = useState(initialSettings?.telegram_chat_id || "");
  const [tgStatus, setTgStatus] = useState<"idle" | "saving" | "saved" | "testing" | "sent" | "error">("idle");
  const [tgVerified, setTgVerified] = useState<"none" | "ok" | "fail">(initialSettings?.telegram_chat_id ? "ok" : "none");
  // Track if user already had Telegram bound (to avoid re-sending welcome digest)
  const [hasExistingTelegram, setHasExistingTelegram] = useState(!!initialSettings?.telegram_chat_id);

  // Categories state
  const [categories, setCategories] = useState<string[]>(() => {
    try {
      return JSON.parse(initialSettings?.categories || "[]");
    } catch {
      return ["kol", "crypto_news", "onchain", "ai_tech", "community", "alpha"];
    }
  });
  const [catStatus, setCatStatus] = useState<"idle" | "saving" | "saved">("idle");
  // IX24: track if categories have been initialized (skip first render auto-save)
  const catInitializedRef = useRef(false);
  const catDebounceRef = useRef<NodeJS.Timeout | null>(null);


  // IX24: Auto-save categories on change with 1s debounce
  useEffect(() => {
    if (!catInitializedRef.current) {
      catInitializedRef.current = true;
      return;
    }
    if (catDebounceRef.current) clearTimeout(catDebounceRef.current);
    catDebounceRef.current = setTimeout(() => {
      saveCategories();
    }, 1000);
    return () => {
      if (catDebounceRef.current) clearTimeout(catDebounceRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

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
        }),
      });
      if (res.ok) {
        track("telegram_bind", { success: true });
        setTgStatus("saved");
        toast(tr("settings_tg_toast_ok"));
        setTimeout(() => setTgStatus("idle"), 2000);
        // Send welcome digest only on first-time binding
        if (!hasExistingTelegram && chatId) {
          fetch("/api/user/welcome-digest", { method: "POST" }).catch((err) => console.error("settings/welcomeDigest:", err))
          setHasExistingTelegram(true)
        }
        // Auto-verify by sending test message
        if (chatId) {
          try {
            const verifyRes = await fetch("/api/notify/telegram", { method: "POST" });
            const verifyData = await verifyRes.json();
            setTgVerified(verifyData.success ? "ok" : "fail");
          } catch {
            setTgVerified("fail");
          }
        }
      } else {
        setTgStatus("error");
        setTgVerified("fail");
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
        track("settings_save");
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
    <div className="min-h-screen p-4 md:p-8 pb-24 md:pb-8 animate-page-enter" style={{ backgroundColor: "var(--bg)" }}>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          {tr("settings_title")}
        </h1>

        {/* Subscription Status Card */}
        {trialInfo && (
          <Card className="rounded-2xl" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
            <CardContent className="py-4 px-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {trialInfo.plan === "pro" ? (
                        <span className="inline-flex items-center gap-1.5">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 8.5L6.5 11.5L12.5 4.5"/></svg>
                          {tr("settings_plan_pro")}
                        </span>
                      ) : trialInfo.daysLeft !== null && trialInfo.daysLeft > 0 ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-500 border border-green-500/30">
                            {lang === "zh" ? "免費試用中" : "Free Trial"}
                          </span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/30">
                            {tr("settings_plan_expired")}
                          </span>
                        </span>
                      )}
                    </span>
                    <span className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {trialInfo.plan === "pro"
                        ? tr("settings_plan_pro_desc")
                        : trialInfo.daysLeft !== null && trialInfo.daysLeft > 0
                          ? `${tr("settings_plan_days_left_pre")} ${trialInfo.daysLeft} ${tr("settings_plan_days_left_post")}`
                          : tr("settings_plan_expired_desc")}
                    </span>
                  </div>
                </div>
                {trialInfo.plan !== "pro" && (
                  <a
                    href="/expired"
                    className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                    style={{ backgroundColor: "var(--signal)", color: "var(--bg)" }}
                  >
                    {tr("settings_upgrade")}
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {!hasTelegram && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center justify-between mb-2 animate-fade-in">
            <span className="text-amber-700 text-sm">尚未綁定 Telegram，無法收到機會推送</span>
            <Link href="#telegram" className="text-amber-600 hover:underline text-sm font-medium shrink-0 ml-4">立即綁定 →</Link>
          </div>
        )}

        {/* Telegram Push */}
        <Card id="telegram" className="rounded-2xl card-hover" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
          <CardHeader>
            <CardTitle className="text-lg" style={{ color: "var(--text-primary)" }}>
              {tr("settings_tg_title")}
            </CardTitle>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {tr("settings_tg_desc")}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl p-3 text-sm space-y-1 mb-2" style={{ backgroundColor: "var(--bg-panel)", color: "var(--text-secondary)" }}>
              <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                {tr("settings_tg_howto")}
              </p>
              <p>1. {tr("settings_tg_step1")} <span className="font-mono" style={{ color: "var(--text-primary)" }}>@userinfobot</span></p>
              <p>2. {tr("settings_tg_step2")}</p>
              <p>3. {tr("settings_tg_step3_pre")} <span className="font-mono" style={{ color: "var(--text-primary)" }}>Id:</span> {tr("settings_tg_step3_post")}</p>
            </div>

            <Input
              value={chatId}
              onChange={(e) => { setChatId(e.target.value.replace(/\D/g, "")); setTgVerified("none"); }}
              placeholder="僅輸入數字 ID（如 5825881638）"
              className="rounded-xl font-mono input-focus-ring focus:outline-none border" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)", color: "var(--text-primary)" }}
            />

            <div className="flex gap-3">
              <Button
                onClick={saveTelegram}
                disabled={tgStatus === "saving" || !chatId}
                className="rounded-xl btn-press" style={{ backgroundColor: "var(--signal)", color: "var(--bg)" }}
              >
                {tgStatus === "saving" ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {tr("settings_tg_saving")}
                  </span>
                ) : tr("settings_tg_save")}
              </Button>
              <Button
                onClick={testTelegram}
                disabled={tgStatus === "testing" || !chatId}
                variant="outline"
                className="rounded-xl btn-press border hover:bg-[var(--bg-panel)]" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
              >
                {tgStatus === "testing" ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-t-[var(--text-primary)] rounded-full animate-spin" style={{ borderColor: "var(--border)" }} />
                    {tr("settings_tg_testing")}
                  </span>
                ) : tr("settings_tg_test")}
              </Button>
            </div>

            {tgStatus === "saved" && (
              <p className="text-green-600 text-sm animate-fade-in">{tr("settings_tg_saved")}</p>
            )}
            {tgStatus === "sent" && (
              <p className="text-green-600 text-sm animate-fade-in">{tr("settings_tg_sent")}</p>
            )}
            {tgStatus === "error" && (
              <p className="text-red-500 text-sm animate-fade-in">{tr("settings_tg_error")}</p>
            )}
            {tgVerified === "ok" && tgStatus === "idle" && (
              <p className="text-green-600 text-sm flex items-center gap-1.5 animate-fade-in">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 border border-green-500/30">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block"><path d="M3.5 8.5L6.5 11.5L12.5 4.5"/></svg>
                  {lang === "zh" ? " 已驗證" : " Verified"}
                </span>
              </p>
            )}
            {tgVerified === "fail" && tgStatus === "idle" && (
              <p className="text-red-500 text-sm flex items-center gap-1.5 animate-fade-in">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 border border-red-500/30">
                  {lang === "zh" ? "❌ Token 無效，請重新確認" : "❌ Invalid token, please check"}
                </span>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Categories */}
        <Card className="rounded-2xl card-hover" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
          <CardHeader>
            <CardTitle className="text-lg" style={{ color: "var(--text-primary)" }}>
              {tr("settings_cat_title")}
            </CardTitle>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {tr("settings_cat_desc")}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => toggleCategory(cat.value)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 btn-press ${
                  categories.includes(cat.value)
                    ? "border-2 font-medium shadow-sm"
                    : "hover:bg-[var(--bg-panel)]"
                }`}
                style={categories.includes(cat.value)
                  ? { borderColor: "var(--signal)", backgroundColor: "color-mix(in srgb, var(--signal) 10%, transparent)", color: "var(--signal)" }
                  : { borderColor: "var(--border)", color: "var(--text-secondary)" }
                }
              >
                <span className="inline-flex items-center gap-2">
                  <CheckboxIcon checked={categories.includes(cat.value)} />
                  {cat.icon}
                  {lang === "zh" ? cat.zh : cat.en}
                </span>
              </button>
            ))}
            {/* IX24: auto-save status indicator */}
            {catStatus === "saving" && (
              <p className="text-xs flex items-center gap-1.5 animate-fade-in" style={{ color: "var(--text-muted)" }}>
                <span className="w-3 h-3 border-2 border-t-[var(--signal)] rounded-full animate-spin" style={{ borderColor: "var(--border)" }} />
                自動保存中…
              </p>
            )}
            {catStatus === "saved" && (
              <p className="text-xs text-green-600 animate-fade-in">✓ 已保存</p>
            )}
          </CardContent>
        </Card>

        {/* Language */}
        <Card className="rounded-2xl card-hover" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
          <CardHeader>
            <CardTitle className="text-lg" style={{ color: "var(--text-primary)" }}>
              {tr("settings_lang_title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button
              onClick={() => switchLang("zh")}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 btn-press ${
                lang === "zh" ? "border-2 font-medium shadow-sm" : "hover:bg-[var(--bg-panel)]"
              }`}
              style={lang === "zh"
                ? { borderColor: "var(--signal)", backgroundColor: "color-mix(in srgb, var(--signal) 10%, transparent)", color: "var(--signal)" }
                : { borderColor: "var(--border)", color: "var(--text-secondary)" }
              }
            >
              {tr("settings_lang_zh")}
            </button>
            <button
              onClick={() => switchLang("en")}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 btn-press ${
                lang === "en" ? "border-2 font-medium shadow-sm" : "hover:bg-[var(--bg-panel)]"
              }`}
              style={lang === "en"
                ? { borderColor: "var(--signal)", backgroundColor: "color-mix(in srgb, var(--signal) 10%, transparent)", color: "var(--signal)" }
                : { borderColor: "var(--border)", color: "var(--text-secondary)" }
              }
            >
              {tr("settings_lang_en")}
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
