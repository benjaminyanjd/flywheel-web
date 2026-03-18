"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TopNav } from "@/components/top-nav";
import { useT } from "@/lib/i18n";
import { deriveFocus, TRADE_METHOD_VALUES } from "@/lib/preferences";
import { FlywheelLogo } from "@/components/flywheel-logo";
import { track } from "@/lib/analytics";
import { TRADE_ICONS } from "@/components/trade-icons";
import { CAPITAL_ICONS, GOAL_ICONS } from "@/components/profile-icons";

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const { t } = useT();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [inviteCode, setInviteCode] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  // Step 1: Trading methods (multi-select) + Capital Range + Trade Goal
  const [profitSource, setProfitSource] = useState<string[]>([]);
  const [capitalRange, setCapitalRange] = useState("");
  const [tradeGoal, setTradeGoal] = useState("");

  // Step 2: Risk + Time
  const [riskLevel, setRiskLevel] = useState("");
  const [timeBudget, setTimeBudget] = useState("");

  // Step 3: Telegram
  const [telegramId, setTelegramId] = useState("");
  const [saving, setSaving] = useState(false);

  const TRADE_METHODS = TRADE_METHOD_VALUES.map(v => ({
    value: v,
    label: t(`trade_${v}` as Parameters<typeof t>[0]),
  }));

  const CAPITAL_RANGES = [
    { value: "tiny", tKey: "capital_tiny" as const },
    { value: "small", tKey: "capital_small" as const },
    { value: "medium", tKey: "capital_medium" as const },
    { value: "large", tKey: "capital_large" as const },
  ];

  const TRADE_GOALS = [
    { value: "grow_fast", tKey: "goal_grow_fast" as const },
    { value: "steady_income", tKey: "goal_steady_income" as const },
    { value: "preserve_grow", tKey: "goal_preserve_grow" as const },
    { value: "learn_explore", tKey: "goal_learn_explore" as const },
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

  async function saveProfile() {
    await fetch("/api/user/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profit_source: profitSource.join(","),
        risk_level: riskLevel,
        time_budget: timeBudget,
        capital_range: capitalRange,
        trade_goal: tradeGoal,
        user_focus: deriveFocus(profitSource),
      }),
    });
  }

  async function finishWithTelegram() {
    setSaving(true);
    track("onboarding_step_complete", { step: 3 });
    track("onboarding_complete");
    try {
      await fetch("/api/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegram_chat_id: telegramId || null,
          notify_channel: telegramId ? "telegram" : "none",
        }),
      });
      if (profitSource.length > 0) await saveProfile();
      fetch("/api/scan", { method: "POST" }).catch(() => {});
      router.push("/welcome");
    } catch {
      setSaving(false);
    }
  }

  const step1Complete = profitSource.length > 0 && !!capitalRange && !!tradeGoal;
  const step2Complete = !!riskLevel && !!timeBudget;

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
    <div className="flex-1 flex flex-col" style={{ backgroundColor: "var(--bg)" }}>
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
            Step {step + 1} / {TOTAL_STEPS}
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-6">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-colors"
              style={{ backgroundColor: i <= step ? "var(--signal)" : "var(--border)" }}
            />
          ))}
        </div>

        {/* Back button */}
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-1 text-sm mb-4 transition-colors hover:text-[var(--text-primary)]"
            style={{ color: "var(--text-muted)" }}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            上一步
          </button>
        )}

        {/* Step 0: Invite Code */}
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
                <a href="https://sniffingclock.club/#waitlist-form" target="_blank" rel="noopener noreferrer" className="hover:underline ml-1" style={{ color: "var(--text-secondary)" }}>
                  {t("onboard_apply")}
                </a>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Trading Methods + Capital Range + Trade Goal */}
        {step === 1 && (
          <Card className="rounded-2xl shadow-sm animate-page-enter" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-subtle)" }}>
            <CardHeader>
              <CardTitle className="text-xl" style={{ color: "var(--text-primary)" }}>{t("onboard_trade_title")}</CardTitle>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{t("onboard_trade_desc")}</p>
            </CardHeader>
            <CardContent className="space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Trading Methods (multi-select) */}
              <div className="space-y-2">
                {TRADE_METHODS.map(r => {
                  const sel = profitSource.includes(r.value);
                  return (
                    <button key={r.value} type="button"
                      onClick={() => toggleMulti(r.value, profitSource, setProfitSource)}
                      aria-pressed={sel}
                      className={multiBtnClass(sel)}
                      style={sel ? selectedStyle : unselectedStyle}
                    >
                      <span className="shrink-0 w-6 h-6">{TRADE_ICONS[r.value] ? TRADE_ICONS[r.value]() : null}</span>
                      <span>{r.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Capital Range (single-select) */}
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>{t("capital_title")}</p>
                <div className="space-y-2">
                  {CAPITAL_RANGES.map(r => {
                    const sel = capitalRange === r.value;
                    const Icon = CAPITAL_ICONS[r.value];
                    return (
                      <button key={r.value} type="button"
                        onClick={() => setCapitalRange(r.value)}
                        aria-pressed={sel}
                        className={singleBtnClass(sel)}
                        style={sel ? selectedStyle : unselectedStyle}
                      >
                        <span className="text-base shrink-0">{sel ? "◉" : "○"}</span>
                        {Icon && <span className="shrink-0 w-6 h-6">{Icon()}</span>}
                        <span>{t(r.tKey)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Trade Goal (single-select) */}
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>{t("goal_title")}</p>
                <div className="space-y-2">
                  {TRADE_GOALS.map(r => {
                    const sel = tradeGoal === r.value;
                    const Icon = GOAL_ICONS[r.value];
                    return (
                      <button key={r.value} type="button"
                        onClick={() => setTradeGoal(r.value)}
                        aria-pressed={sel}
                        className={singleBtnClass(sel)}
                        style={sel ? selectedStyle : unselectedStyle}
                      >
                        <span className="text-base shrink-0">{sel ? "◉" : "○"}</span>
                        {Icon && <span className="shrink-0 w-6 h-6">{Icon()}</span>}
                        <span>{t(r.tKey)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div title={!step1Complete ? "請完成所有選項" : undefined}>
                <Button
                  onClick={() => { track("onboarding_step_complete", { step: 1 }); setStep(2); }}
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

        {/* Step 2: Risk Preference + Time Budget */}
        {step === 2 && (
          <Card className="rounded-2xl shadow-sm animate-page-enter" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-subtle)" }}>
            <CardHeader>
              <CardTitle className="text-xl" style={{ color: "var(--text-primary)" }}>{t("onboard_risk_time_title")}</CardTitle>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{t("onboard_risk_time_desc")}</p>
            </CardHeader>
            <CardContent className="space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Risk Level */}
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

              {/* Time Budget */}
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

              <div title={!step2Complete ? "請完成所有選項" : undefined}>
                <Button
                  onClick={() => { track("onboarding_step_complete", { step: 2 }); setStep(3); }}
                  disabled={!step2Complete}
                  className="w-full rounded-xl mt-2"
                  style={step2Complete ? { backgroundColor: "var(--signal)", color: "var(--bg)" } : {}}
                >
                  {t("onboard_next")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Telegram */}
        {step === 3 && (
          <div className="space-y-4 animate-page-enter">
            <div>
              <h3 className="text-xl font-semibold mb-1" style={{ color: "var(--text-primary)" }}>{t("onboard_tg_title")}</h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{t("onboard_tg_desc")}</p>
            </div>

            <div className="rounded-xl p-4 text-sm space-y-3 border" style={{ borderColor: "var(--border)", backgroundColor: "color-mix(in srgb, var(--signal) 5%, transparent)" }}>
              <p className="font-medium" style={{ color: "var(--text-primary)" }}>{t("onboard_tg_howto")}</p>
              <ol className="space-y-2 list-decimal list-inside" style={{ color: "var(--text-secondary)" }}>
                <li>{t("onboard_tg_step1_pre")} <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="font-mono underline" style={{ color: "var(--signal)" }}>@userinfobot</a></li>
                <li>{t("onboard_tg_step2")}</li>
                <li>{t("onboard_tg_step3_pre")} <span className="font-mono font-medium" style={{ color: "var(--text-primary)" }}>Id:</span> {t("onboard_tg_step3_post")}</li>
              </ol>
            </div>

            <Input
              value={telegramId}
              onChange={e => setTelegramId(e.target.value)}
              placeholder={t("onboard_tg_example")}
              className="input-focus-ring rounded-xl font-mono"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
            />

            <Button
              onClick={finishWithTelegram}
              disabled={saving || !telegramId}
              className="w-full rounded-xl"
              style={!saving && telegramId ? { backgroundColor: "var(--signal)", color: "var(--bg)" } : {}}
            >
              {saving ? t("onboard_tg_saving") : t("onboard_tg_done")}
            </Button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
