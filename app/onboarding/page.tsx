"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useT } from "@/lib/i18n";
import { deriveFocus } from "@/lib/preferences";

export default function OnboardingPage() {
  const { t } = useT();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [inviteCode, setInviteCode] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  // New 5-question state
  const [profitSource, setProfitSource] = useState<string[]>([]);
  const [coreSkills, setCoreSkills] = useState<string[]>([]);
  const [oppHorizon, setOppHorizon] = useState("");
  const [riskLevel, setRiskLevel] = useState("");
  const [timeBudget, setTimeBudget] = useState("");

  const [categories, setCategories] = useState(["ai_tech", "crypto_policy", "new_tools"]);
  const [scanInterval, setScanInterval] = useState(60);
  const [saving, setSaving] = useState(false);
  const [telegramId, setTelegramId] = useState("");

  const PROFIT_SOURCES = [
    { value: "crypto_trading", label: t("profit_crypto_trading") },
    { value: "ai_content", label: t("profit_ai_content") },
    { value: "info_arbitrage", label: t("profit_info_arbitrage") },
    { value: "saas_tech", label: t("profit_saas_tech") },
    { value: "early_investment", label: t("profit_early_investment") },
  ];

  const CORE_SKILLS = [
    { value: "trading", label: t("skill_trading") },
    { value: "content_ops", label: t("skill_content_ops") },
    { value: "coding", label: t("skill_coding") },
    { value: "sales_biz", label: t("skill_sales_biz") },
  ];

  const OPP_HORIZONS = [
    { value: "short_term", label: t("horizon_short_term") },
    { value: "mid_term", label: t("horizon_mid_term") },
    { value: "long_term", label: t("horizon_long_term") },
  ];

  const RISK_LEVELS = [
    { value: "conservative", label: t("risk_conservative") },
    { value: "balanced", label: t("risk_balanced") },
    { value: "aggressive", label: t("risk_aggressive") },
  ];

  const TIME_BUDGETS = [
    { value: "under_1h", label: t("time_under_1h") },
    { value: "1_3h", label: t("time_1_3h") },
    { value: "unlimited", label: t("time_unlimited") },
  ];

  const CATEGORIES = [
    { value: "ai_tech", label: t("onboard_cat_ai") },
    { value: "crypto_policy", label: t("onboard_cat_crypto") },
    { value: "new_tools", label: t("onboard_cat_tools") },
    { value: "overseas_trends", label: t("onboard_cat_overseas") },
    { value: "x_kol", label: t("onboard_cat_kol") },
  ];

  const INTERVALS = [
    { value: 30, label: t("onboard_interval_30") },
    { value: 60, label: t("onboard_interval_60") },
    { value: 180, label: t("onboard_interval_180") },
  ];

  async function validateInvite() {
    setInviteError("");
    setInviteLoading(true);
    try {
      const res = await fetch("/api/invite/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: inviteCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInviteError(data.error || t("onboard_invite_error"));
      } else {
        setStep(1);
      }
    } catch {
      setInviteError(t("onboard_network_error"));
    } finally {
      setInviteLoading(false);
    }
  }

  function toggleMulti(value: string, list: string[], setList: (v: string[]) => void) {
    setList(list.includes(value) ? list.filter(v => v !== value) : [...list, value]);
  }

  function toggleCategory(val: string) {
    setCategories(prev =>
      prev.includes(val) ? prev.filter(c => c !== val) : [...prev, val]
    );
  }

  const profilePayload = {
    profit_source: profitSource.join(","),
    core_skills: coreSkills.join(","),
    opp_horizon: oppHorizon,
    risk_level: riskLevel,
    time_budget: timeBudget,
    user_focus: deriveFocus(profitSource),
  };

  async function saveProfile() {
    await fetch("/api/user/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profilePayload),
    });
  }

  async function finish() {
    setSaving(true);
    try {
      await fetch("/api/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories, scan_interval: scanInterval }),
      });
      if (profitSource.length > 0) await saveProfile();
      fetch("/api/scan", { method: "POST" }).catch(() => {});
      router.push("/opportunities?welcome=1");
    } catch {
      setSaving(false);
    }
  }

  async function finishWithTelegram() {
    setSaving(true);
    try {
      await fetch("/api/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categories,
          scan_interval: scanInterval,
          telegram_chat_id: telegramId || null,
          notify_channel: telegramId ? "telegram" : "none",
        }),
      });
      if (profitSource.length > 0) await saveProfile();
      fetch("/api/scan", { method: "POST" }).catch(() => {});
      router.push("/opportunities?welcome=1");
    } catch {
      setSaving(false);
    }
  }

  const step1Complete = profitSource.length > 0 && coreSkills.length > 0 && oppHorizon && riskLevel && timeBudget;

  const btnClass = (selected: boolean) =>
    `w-full text-left px-4 py-3 rounded-lg border transition-colors ${
      selected
        ? "border-amber-500 bg-amber-500/20 text-amber-300"
        : "border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500"
    }`;

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress bar - 5 steps */}
        <div className="flex gap-2 mb-6">
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-amber-500" : "bg-slate-700"
              }`}
            />
          ))}
        </div>

        {step === 0 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100 text-xl">{t("onboard_invite_title")}</CardTitle>
              <p className="text-slate-400 text-sm">
                {t("onboard_invite_desc")}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value.toUpperCase())}
                placeholder="FLYWHEEL-XXXXX-XXX"
                className="bg-slate-700 border-slate-600 text-slate-100 font-mono uppercase tracking-widest"
                onKeyDown={e => e.key === "Enter" && validateInvite()}
              />
              {inviteError && <p className="text-red-400 text-sm">{inviteError}</p>}
              <Button
                onClick={validateInvite}
                disabled={!inviteCode || inviteLoading}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950"
              >
                {inviteLoading ? t("onboard_invite_loading") : t("onboard_invite_btn")}
              </Button>
              <p className="text-center text-xs text-slate-500">
                {t("onboard_no_code")}
                <a href="https://flywheelsea.club/#waitlist-form" className="text-amber-400 hover:underline ml-1">
                  {t("onboard_apply")}
                </a>
              </p>
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100 text-xl">{t("onboard_identity_title")}</CardTitle>
              <p className="text-slate-400 text-sm">{t("onboard_identity_sub")}</p>
            </CardHeader>
            <CardContent className="space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Q1: Profit Source - multi select */}
              <div>
                <p className="text-slate-300 text-sm font-medium mb-2">{t("onboard_profit_label")}</p>
                <div className="space-y-2">
                  {PROFIT_SOURCES.map(r => (
                    <button key={r.value} type="button" onClick={() => toggleMulti(r.value, profitSource, setProfitSource)}
                      aria-pressed={profitSource.includes(r.value)} className={btnClass(profitSource.includes(r.value))}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q2: Core Skills - multi select */}
              <div>
                <p className="text-slate-300 text-sm font-medium mb-2">{t("onboard_skills_label")}</p>
                <div className="space-y-2">
                  {CORE_SKILLS.map(r => (
                    <button key={r.value} type="button" onClick={() => toggleMulti(r.value, coreSkills, setCoreSkills)}
                      aria-pressed={coreSkills.includes(r.value)} className={btnClass(coreSkills.includes(r.value))}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q3: Opportunity Horizon - single select */}
              <div>
                <p className="text-slate-300 text-sm font-medium mb-2">{t("onboard_horizon_label")}</p>
                <div className="space-y-2">
                  {OPP_HORIZONS.map(r => (
                    <button key={r.value} type="button" onClick={() => setOppHorizon(r.value)}
                      aria-pressed={oppHorizon === r.value} className={btnClass(oppHorizon === r.value)}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q4: Risk Level - single select */}
              <div>
                <p className="text-slate-300 text-sm font-medium mb-2">{t("onboard_risk_label")}</p>
                <div className="space-y-2">
                  {RISK_LEVELS.map(r => (
                    <button key={r.value} type="button" onClick={() => setRiskLevel(r.value)}
                      aria-pressed={riskLevel === r.value} className={btnClass(riskLevel === r.value)}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q5: Time Budget - single select */}
              <div>
                <p className="text-slate-300 text-sm font-medium mb-2">{t("onboard_time_label")}</p>
                <div className="space-y-2">
                  {TIME_BUDGETS.map(r => (
                    <button key={r.value} type="button" onClick={() => setTimeBudget(r.value)}
                      aria-pressed={timeBudget === r.value} className={btnClass(timeBudget === r.value)}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={!step1Complete}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 mt-2"
              >
                {t("onboard_next")}
              </Button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full text-center text-sm text-slate-500 hover:text-slate-400 transition-colors"
              >
                {t("onboard_skip")}
              </button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100 text-xl">{t("onboard_cat_title")}</CardTitle>
              <p className="text-slate-400 text-sm">{t("onboard_cat_desc")}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => toggleCategory(cat.value)}
                  aria-pressed={categories.includes(cat.value)}
                  className={btnClass(categories.includes(cat.value))}
                >
                  {cat.label}
                </button>
              ))}
              <Button
                onClick={() => setStep(3)}
                disabled={categories.length === 0}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 mt-2"
              >
                {t("onboard_next")}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100 text-xl">{t("onboard_scan_title")}</CardTitle>
              <p className="text-slate-400 text-sm">{t("onboard_scan_desc")}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {INTERVALS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setScanInterval(opt.value)}
                  aria-pressed={scanInterval === opt.value}
                  className={btnClass(scanInterval === opt.value)}
                >
                  {opt.label}
                </button>
              ))}
              <Button
                onClick={() => setStep(4)}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 mt-2"
              >
                {t("onboard_next")}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100 text-xl">{t("onboard_tg_title")}</CardTitle>
              <p className="text-slate-400 text-sm">{t("onboard_tg_desc")}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-700/50 rounded-lg p-4 text-sm text-slate-300 space-y-2">
                <p className="font-medium text-slate-200">{t("onboard_tg_howto")}</p>
                <ol className="space-y-1 list-decimal list-inside text-slate-400">
                  <li>{t("onboard_tg_step1_pre")} <span className="font-mono text-amber-400">@userinfobot</span></li>
                  <li>{t("onboard_tg_step2")}</li>
                  <li>{t("onboard_tg_step3_pre")} <span className="font-mono text-amber-400">Id:</span> {t("onboard_tg_step3_post")}</li>
                </ol>
              </div>
              <Input
                value={telegramId}
                onChange={e => setTelegramId(e.target.value)}
                placeholder={t("onboard_tg_example")}
                className="bg-slate-700 border-slate-600 text-slate-100 font-mono"
              />
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={finish}
                  disabled={saving}
                  className="flex-1 text-slate-400 hover:text-slate-200"
                >
                  {t("onboard_tg_later")}
                </Button>
                <Button
                  onClick={finishWithTelegram}
                  disabled={saving}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950"
                >
                  {saving ? t("onboard_tg_saving") : t("onboard_tg_done")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
