"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getLangStored, type Lang } from "@/lib/lang";
import { useT } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { deriveFocus, PROFIT_SOURCE_KEYS, CORE_SKILL_KEYS, OPP_HORIZON_KEYS, RISK_LEVEL_KEYS, TIME_BUDGET_KEYS } from "@/lib/preferences";

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
  profit_source: string | null;
  core_skills: string | null;
  opp_horizon: string | null;
  risk_level: string | null;
  time_budget: string | null;
}

interface Props {
  initialSettings: UserSettings | null;
}

export default function SettingsClient({ initialSettings }: Props) {
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

  // 5-question preferences state
  const [profitSource, setProfitSource] = useState<string[]>(() =>
    initialSettings?.profit_source ? initialSettings.profit_source.split(",") : []
  );
  const [coreSkills, setCoreSkills] = useState<string[]>(() =>
    initialSettings?.core_skills ? initialSettings.core_skills.split(",") : []
  );
  const [oppHorizon, setOppHorizon] = useState(initialSettings?.opp_horizon || "");
  const [riskLevel, setRiskLevel] = useState(initialSettings?.risk_level || "");
  const [timeBudget, setTimeBudget] = useState(initialSettings?.time_budget || "");
  const [prefStatus, setPrefStatus] = useState<"idle" | "saving" | "saved">("idle");

  function toggleMultiArr(arr: string[], val: string): string[] {
    return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
  }

  async function savePreferences() {
    setPrefStatus("saving");
    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profit_source: profitSource.join(",") || null,
          core_skills: coreSkills.join(",") || null,
          opp_horizon: oppHorizon || null,
          risk_level: riskLevel || null,
          time_budget: timeBudget || null,
          user_focus: deriveFocus(profitSource),
        }),
      });
      if (res.ok) {
        setPrefStatus("saved");
        toast(tr("settings_pref_toast_ok"));
        setTimeout(() => setPrefStatus("idle"), 2000);
      } else {
        toast(tr("settings_tg_toast_fail"), "error");
        setPrefStatus("idle");
      }
    } catch {
      toast(tr("settings_tg_toast_fail"), "error");
      setPrefStatus("idle");
    }
  }

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
          fetch("/api/user/welcome-digest", { method: "POST" }).catch(() => {})
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

  const btnClass = (selected: boolean) =>
    `w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
      selected
        ? "border-amber-500 bg-amber-500/20 text-amber-300"
        : "border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500"
    }`;

  const chipClass = (selected: boolean) =>
    `px-4 py-2 rounded-lg border text-sm transition-colors ${
      selected
        ? "border-amber-500 bg-amber-500/20 text-amber-300"
        : "border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500"
    }`;

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8 pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-slate-100">
          ⚙️ {tr("settings_title")}
        </h1>

        {/* 5-Question Preferences */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100 text-lg">
              🎯 {tr("settings_profile_title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Q1: Profit Source */}
            <div>
              <p className="text-slate-300 text-sm font-medium mb-2">{tr("onboard_profit_label")}</p>
              <div className="flex flex-wrap gap-2">
                {PROFIT_SOURCE_KEYS.map((o) => (
                  <button key={o.value} onClick={() => setProfitSource(toggleMultiArr(profitSource, o.value))}
                    className={chipClass(profitSource.includes(o.value))}>
                    {tr(o.tKey)}
                  </button>
                ))}
              </div>
            </div>

            {/* Q2: Core Skills */}
            <div>
              <p className="text-slate-300 text-sm font-medium mb-2">{tr("onboard_skills_label")}</p>
              <div className="flex flex-wrap gap-2">
                {CORE_SKILL_KEYS.map((o) => (
                  <button key={o.value} onClick={() => setCoreSkills(toggleMultiArr(coreSkills, o.value))}
                    className={chipClass(coreSkills.includes(o.value))}>
                    {tr(o.tKey)}
                  </button>
                ))}
              </div>
            </div>

            {/* Q3: Opportunity Horizon */}
            <div>
              <p className="text-slate-300 text-sm font-medium mb-2">{tr("onboard_horizon_label")}</p>
              <div className="space-y-2">
                {OPP_HORIZON_KEYS.map((o) => (
                  <button key={o.value} onClick={() => setOppHorizon(o.value)}
                    className={btnClass(oppHorizon === o.value)}>
                    {tr(o.tKey)}
                  </button>
                ))}
              </div>
            </div>

            {/* Q4: Risk Level */}
            <div>
              <p className="text-slate-300 text-sm font-medium mb-2">{tr("onboard_risk_label")}</p>
              <div className="space-y-2">
                {RISK_LEVEL_KEYS.map((o) => (
                  <button key={o.value} onClick={() => setRiskLevel(o.value)}
                    className={btnClass(riskLevel === o.value)}>
                    {tr(o.tKey)}
                  </button>
                ))}
              </div>
            </div>

            {/* Q5: Time Budget */}
            <div>
              <p className="text-slate-300 text-sm font-medium mb-2">{tr("onboard_time_label")}</p>
              <div className="space-y-2">
                {TIME_BUDGET_KEYS.map((o) => (
                  <button key={o.value} onClick={() => setTimeBudget(o.value)}
                    className={btnClass(timeBudget === o.value)}>
                    {tr(o.tKey)}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={savePreferences}
              disabled={prefStatus === "saving"}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 mt-2"
            >
              {prefStatus === "saving"
                ? tr("settings_pref_saving")
                : prefStatus === "saved"
                ? tr("settings_pref_saved")
                : tr("settings_pref_save")}
            </Button>
          </CardContent>
        </Card>

        {/* Telegram Push */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100 text-lg">
              ✈️ {tr("settings_tg_title")}
            </CardTitle>
            <p className="text-slate-400 text-sm">
              {tr("settings_tg_desc")}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-700/30 rounded-lg p-3 text-sm text-slate-400 space-y-1 mb-2">
              <p className="text-slate-300 font-medium">
                {tr("settings_tg_howto")}
              </p>
              <p>1. {tr("settings_tg_step1")} <span className="font-mono text-amber-400">@userinfobot</span></p>
              <p>2. {tr("settings_tg_step2")}</p>
              <p>3. {tr("settings_tg_step3_pre")} <span className="font-mono text-amber-400">Id:</span> {tr("settings_tg_step3_post")}</p>
            </div>

            <Input
              value={chatId}
              onChange={(e) => setChatId(e.target.value.replace(/\D/g, ""))}
              placeholder={tr("settings_tg_placeholder")}
              className="bg-slate-700 border-slate-600 text-slate-100 font-mono"
            />

            <div className="flex gap-3">
              <Button
                onClick={saveTelegram}
                disabled={tgStatus === "saving" || !chatId}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950"
              >
                {tgStatus === "saving"
                  ? tr("settings_tg_saving")
                  : tr("settings_tg_save")}
              </Button>
              <Button
                onClick={testTelegram}
                disabled={tgStatus === "testing" || !chatId}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                {tgStatus === "testing"
                  ? tr("settings_tg_testing")
                  : tr("settings_tg_test")}
              </Button>
            </div>

            {tgStatus === "saved" && (
              <p className="text-green-400 text-sm">✅ {tr("settings_tg_saved")}</p>
            )}
            {tgStatus === "sent" && (
              <p className="text-green-400 text-sm">✅ {tr("settings_tg_sent")}</p>
            )}
            {tgStatus === "error" && (
              <p className="text-red-400 text-sm">❌ {tr("settings_tg_error")}</p>
            )}
          </CardContent>
        </Card>

        {/* Categories */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100 text-lg">
              📡 {tr("settings_cat_title")}
            </CardTitle>
            <p className="text-slate-400 text-sm">
              {tr("settings_cat_desc")}
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
                {lang === "zh" ? cat.zh : cat.en}
              </button>
            ))}
            <Button
              onClick={saveCategories}
              disabled={catStatus === "saving" || categories.length === 0}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 mt-2"
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
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100 text-lg">
              🌐 {tr("settings_lang_title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button
              onClick={() => switchLang("zh")}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                lang === "zh"
                  ? "border-amber-500 bg-amber-500/20 text-amber-300"
                  : "border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500"
              }`}
            >
              {tr("settings_lang_zh")}
            </button>
            <button
              onClick={() => switchLang("en")}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                lang === "en"
                  ? "border-amber-500 bg-amber-500/20 text-amber-300"
                  : "border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500"
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
