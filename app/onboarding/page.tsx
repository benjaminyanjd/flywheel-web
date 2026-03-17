"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TopNav } from "@/components/top-nav";
import { useT } from "@/lib/i18n";
import { deriveFocus } from "@/lib/preferences";
import { FlywheelLogo } from "@/components/flywheel-logo";
import { track } from "@/lib/analytics";

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

  const [categories, setCategories] = useState(["kol", "crypto_news", "ai_tech"]);
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
    { value: "kol", label: t("onboard_cat_kol") },
    { value: "crypto_news", label: t("onboard_cat_crypto") },
    { value: "onchain", label: t("onboard_cat_onchain") },
    { value: "ai_tech", label: t("onboard_cat_ai") },
    { value: "community", label: t("onboard_cat_community") },
    { value: "alpha", label: t("onboard_cat_alpha") },
  ];

  const INTERVALS = [
    { value: 30, label: t("onboard_interval_30") },
    { value: 60, label: t("onboard_interval_60") },
    { value: 180, label: t("onboard_interval_180") },
  ];

  const STEP_TITLES = [
    t("onboard_invite_title"),
    t("onboard_identity_title"),
    t("onboard_cat_title"),
    t("onboard_scan_title"),
    t("onboard_tg_title"),
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
        track("onboarding_step_complete", { step: 0 });
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
    track("onboarding_step_complete", { step: 4 });
    track("onboarding_complete");
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

  // Multi-select button class (checkbox style)
  const multiBtnClass = (selected: boolean) =>
    `w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 flex items-center gap-3 ${
      selected ? "border-2 font-medium shadow-sm" : "hover:bg-[var(--bg-panel)]"
    }`;

  // Single-select button class (radio style)
  const singleBtnClass = (selected: boolean) =>
    `w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 flex items-center gap-3 ${
      selected ? "border-2 font-medium shadow-sm" : "hover:bg-[var(--bg-panel)]"
    }`;

  const selectedStyle = {
    borderColor: "var(--signal)",
    backgroundColor: "color-mix(in srgb, var(--signal) 10%, transparent)",
    color: "var(--signal)",
  };

  const unselectedStyle = {
    borderColor: "var(--border)",
    color: "var(--text-secondary)",
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg)" }}>
      <TopNav hideCta hideLogin />
      <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <FlywheelLogo size={28} className="animate-[spin_8s_linear_infinite]" style={{ color: "var(--signal)" }} />
          <span className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>嗅鐘</span>
        </div>

        {/* Step indicator */}
        <div className="text-center mb-3">
          <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
            Step {step + 1} / 5
          </span>
        </div>

        {/* Progress bar - 5 steps */}
        <div className="flex gap-2 mb-6">
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-colors"
              style={{ backgroundColor: i <= step ? "var(--signal)" : "var(--border)" }}
            />
          ))}
        </div>

        {step === 0 && (
          <Card className="rounded-2xl shadow-sm animate-page-enter" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-subtle)" }}>
            <CardHeader>
              <CardTitle className="text-xl" style={{ color: "var(--text-primary)" }}>{t("onboard_invite_title")}</CardTitle>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {t("onboard_invite_desc")}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value.toUpperCase())}
                placeholder="FLYWHEEL-XXXXX-XXX"
                className="input-focus-ring rounded-xl font-mono uppercase tracking-widest"
                onKeyDown={e => e.key === "Enter" && validateInvite()}
              />
              {inviteError && <p className="text-red-500 text-sm">{inviteError}</p>}
              <Button
                onClick={validateInvite}
                disabled={!inviteCode || inviteLoading}
                className="w-full rounded-xl"
                style={{ backgroundColor: "var(--signal)", color: "var(--bg)" }}
              >
                {inviteLoading ? t("onboard_invite_loading") : t("onboard_invite_btn")}
              </Button>
              <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
                {t("onboard_no_code")}
                <a href="https://sniffingclock.club/#waitlist-form" className="hover:underline ml-1" style={{ color: "var(--text-secondary)" }}>
                  {t("onboard_apply")}
                </a>
              </p>
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <Card className="rounded-2xl shadow-sm animate-page-enter" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-subtle)" }}>
            <CardHeader>
              <CardTitle className="text-xl" style={{ color: "var(--text-primary)" }}>{t("onboard_identity_title")}</CardTitle>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{t("onboard_identity_sub")}</p>
            </CardHeader>
            <CardContent className="space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Q1: Profit Source - multi select */}
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>{t("onboard_profit_label")}</p>
                <div className="space-y-2">
                  {PROFIT_SOURCES.map(r => {
                    const sel = profitSource.includes(r.value);
                    return (
                      <button key={r.value} type="button"
                        onClick={() => toggleMulti(r.value, profitSource, setProfitSource)}
                        aria-pressed={sel}
                        className={multiBtnClass(sel)}
                        style={sel ? selectedStyle : unselectedStyle}
                      >
                        <span className="text-base shrink-0">{sel ? "☑" : "☐"}</span>
                        <span>{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Q2: Core Skills - multi select */}
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>{t("onboard_skills_label")}</p>
                <div className="space-y-2">
                  {CORE_SKILLS.map(r => {
                    const sel = coreSkills.includes(r.value);
                    return (
                      <button key={r.value} type="button"
                        onClick={() => toggleMulti(r.value, coreSkills, setCoreSkills)}
                        aria-pressed={sel}
                        className={multiBtnClass(sel)}
                        style={sel ? selectedStyle : unselectedStyle}
                      >
                        <span className="text-base shrink-0">{sel ? "☑" : "☐"}</span>
                        <span>{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Q3: Opportunity Horizon - single select */}
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>{t("onboard_horizon_label")}</p>
                <div className="space-y-2">
                  {OPP_HORIZONS.map(r => {
                    const sel = oppHorizon === r.value;
                    return (
                      <button key={r.value} type="button"
                        onClick={() => setOppHorizon(r.value)}
                        aria-pressed={sel}
                        className={singleBtnClass(sel)}
                        style={sel ? selectedStyle : unselectedStyle}
                      >
                        <span className="text-base shrink-0">{sel ? "◉" : "○"}</span>
                        <span>{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Q4: Risk Level - single select */}
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>{t("onboard_risk_label")}</p>
                <div className="space-y-2">
                  {RISK_LEVELS.map(r => {
                    const sel = riskLevel === r.value;
                    return (
                      <button key={r.value} type="button"
                        onClick={() => setRiskLevel(r.value)}
                        aria-pressed={sel}
                        className={singleBtnClass(sel)}
                        style={sel ? selectedStyle : unselectedStyle}
                      >
                        <span className="text-base shrink-0">{sel ? "◉" : "○"}</span>
                        <span>{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Q5: Time Budget - single select */}
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>{t("onboard_time_label")}</p>
                <div className="space-y-2">
                  {TIME_BUDGETS.map(r => {
                    const sel = timeBudget === r.value;
                    return (
                      <button key={r.value} type="button"
                        onClick={() => setTimeBudget(r.value)}
                        aria-pressed={sel}
                        className={singleBtnClass(sel)}
                        style={sel ? selectedStyle : unselectedStyle}
                      >
                        <span className="text-base shrink-0">{sel ? "◉" : "○"}</span>
                        <span>{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div title={!step1Complete ? "請完成所有選項" : undefined}>
                <Button
                  onClick={() => { track("onboarding_step_complete", { step: 1 }); setStep(2) }}
                  disabled={!step1Complete}
                  className="w-full rounded-xl mt-2"
                  style={step1Complete ? { backgroundColor: "var(--signal)", color: "var(--bg)" } : {}}
                >
                  {t("onboard_next")}
                </Button>
              </div>

            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="rounded-2xl shadow-sm animate-page-enter" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-subtle)" }}>
            <CardHeader>
              <CardTitle className="text-xl" style={{ color: "var(--text-primary)" }}>{t("onboard_cat_title")}</CardTitle>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{t("onboard_cat_desc")}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {CATEGORIES.map(cat => {
                const sel = categories.includes(cat.value);
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => toggleCategory(cat.value)}
                    aria-pressed={sel}
                    className={multiBtnClass(sel)}
                    style={sel ? selectedStyle : unselectedStyle}
                  >
                    <span className="text-base shrink-0">{sel ? "☑" : "☐"}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
              <div title={categories.length === 0 ? "請完成所有選項" : undefined}>
                <Button
                  onClick={() => { track("onboarding_step_complete", { step: 2 }); setStep(3) }}
                  disabled={categories.length === 0}
                  className="w-full rounded-xl mt-2"
                  style={categories.length > 0 ? { backgroundColor: "var(--signal)", color: "var(--bg)" } : {}}
                >
                  {t("onboard_next")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="rounded-2xl shadow-sm animate-page-enter" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-subtle)" }}>
            <CardHeader>
              <CardTitle className="text-xl" style={{ color: "var(--text-primary)" }}>{t("onboard_scan_title")}</CardTitle>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{t("onboard_scan_desc")}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {INTERVALS.map(opt => {
                const sel = scanInterval === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setScanInterval(opt.value)}
                    aria-pressed={sel}
                    className={singleBtnClass(sel)}
                    style={sel ? selectedStyle : unselectedStyle}
                  >
                    <span className="text-base shrink-0">{sel ? "◉" : "○"}</span>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
              <Button
                onClick={() => { track("onboarding_step_complete", { step: 3 }); setStep(4) }}
                className="w-full rounded-xl mt-2"
                style={{ backgroundColor: "var(--signal)", color: "var(--bg)" }}
              >
                {t("onboard_next")}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card className="rounded-2xl shadow-sm animate-page-enter" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-subtle)" }}>
            <CardHeader>
              <CardTitle className="text-xl" style={{ color: "var(--text-primary)" }}>{t("onboard_tg_title")}</CardTitle>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{t("onboard_tg_desc")}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl p-4 text-sm space-y-2" style={{ backgroundColor: "var(--bg-panel)" }}>
                <p className="font-medium" style={{ color: "var(--text-secondary)" }}>{t("onboard_tg_howto")}</p>
                <ol className="space-y-1 list-decimal list-inside" style={{ color: "var(--text-secondary)" }}>
                  <li>{t("onboard_tg_step1_pre")} <span className="font-mono" style={{ color: "var(--text-primary)" }}>@userinfobot</span></li>
                  <li>{t("onboard_tg_step2")}</li>
                  <li>{t("onboard_tg_step3_pre")} <span className="font-mono" style={{ color: "var(--text-primary)" }}>Id:</span> {t("onboard_tg_step3_post")}</li>
                </ol>
              </div>
              <Input
                value={telegramId}
                onChange={e => setTelegramId(e.target.value)}
                placeholder={t("onboard_tg_example")}
                className="input-focus-ring rounded-xl font-mono"
              />
              <Button
                onClick={finishWithTelegram}
                disabled={saving || !telegramId}
                className="w-full rounded-xl"
                style={!saving && telegramId ? { backgroundColor: "var(--signal)", color: "var(--bg)" } : {}}
              >
                {saving ? t("onboard_tg_saving") : t("onboard_tg_done")}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    </div>
  );
}
