"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FlywheelLogo } from "@/components/flywheel-logo";
import { useT, type TKey } from "@/lib/i18n";
import { AVATAR_MAP, AVATAR_META } from "@/components/trading-avatars";

// ── Label maps ────────────────────────────────────────────────────
const PROFILE_LABELS: Record<string, Record<string, string>> = {
  profit_source: {
    contract: "合約交易",
    spot: "現貨交易",
    onchain: "鏈上交易",
    meme: "Meme 幣",
    arbitrage: "套利",
    airdrop: "空投擼毛",
    alpha: "Alpha 打新",
  },
  capital_range: {
    tiny: "< $1K",
    small: "$1K – $10K",
    medium: "$10K – $100K",
    large: "$100K+",
  },
  trade_goal: {
    grow_fast: "快速增長",
    steady_income: "穩定收益",
    preserve_grow: "保值增值",
    learn_explore: "學習探索",
  },
  risk_level: {
    conservative: "保守",
    balanced: "平衡",
    aggressive: "激進",
  },
  time_budget: {
    under_1h: "< 1 小時",
    "1_3h": "1–3 小時",
    unlimited: "不設限",
  },
};

// ── Types ─────────────────────────────────────────────────────────
interface UserSettings {
  profit_source: string | null;
  capital_range: string | null;
  trade_goal: string | null;
  risk_level: string | null;
  time_budget: string | null;
}

interface ParsedAnalysis {
  styleLabel: string;
  avatarStyle: string;
  riskWarning: string;
  riskRules: string[];
  weeklyTips: string[];
  rawSections: { title: string; content: string }[];
}

// ── Parse markdown from SSE stream ───────────────────────────────
function parseAnalysis(markdown: string): ParsedAnalysis {
  const result: ParsedAnalysis = {
    styleLabel: "",
    avatarStyle: "",
    riskWarning: "",
    riskRules: [],
    weeklyTips: [],
    rawSections: [],
  };

  if (!markdown.trim()) return result;

  // Extract bold values from sections
  const extractBold = (text: string): string => {
    const m = text.match(/\*\*([^*]+)\*\*/);
    return m ? m[1].trim() : text.replace(/[#*`]/g, "").trim();
  };

  // Split by H2 sections
  const sections = markdown.split(/^## /m).filter(Boolean);

  for (const section of sections) {
    const lines = section.split("\n").filter(l => l.trim());
    if (!lines.length) continue;
    const title = lines[0].replace(/^#+\s*/, "").trim();
    const body = lines.slice(1).join("\n").trim();

    if (/交易風格標籤|交易风格标签/i.test(title)) {
      result.styleLabel = extractBold(body) || body.replace(/[#*`\n]/g, "").trim();
    } else if (/avatar.?style/i.test(title)) {
      const rawStyle = extractBold(body) || body.replace(/[#*`\n]/g, "").trim().toLowerCase();
      result.avatarStyle = rawStyle.toLowerCase();
    } else if (/風險提醒|风险提醒|最大.*風險|最大.*风险/i.test(title)) {
      result.riskWarning = body.replace(/\*\*/g, "").replace(/^[-•]\s*/mg, "").trim();
    } else if (/風控規則|风控规则/i.test(title)) {
      const rules = body.split("\n")
        .filter(l => l.trim())
        .map(l => l.replace(/^[-•*\d.]\s*/, "").replace(/\*\*/g, "").trim())
        .filter(Boolean);
      result.riskRules = rules;
    } else if (/本週建議|本周建议|建議|建议/i.test(title)) {
      const tips = body.split("\n")
        .filter(l => l.trim())
        .map(l => l.replace(/^[-•*\d.]\s*/, "").replace(/\*\*/g, "").trim())
        .filter(Boolean);
      result.weeklyTips = tips;
    } else if (title && body && !/^(1|嗅鐘交易分析)/.test(title)) {
      result.rawSections.push({ title, content: body.replace(/\*\*/g, "") });
    }
  }

  return result;
}

// ── Profile tags ──────────────────────────────────────────────────
const PROFILE_FIELD_KEYS: { key: keyof UserSettings; tKey: TKey; icon: string }[] = [
  { key: "profit_source", tKey: "welcome_label_profit_source", icon: "⚡" },
  { key: "capital_range", tKey: "welcome_label_capital_range", icon: "💰" },
  { key: "trade_goal", tKey: "welcome_label_trade_goal", icon: "🎯" },
  { key: "risk_level", tKey: "welcome_label_risk_level", icon: "🛡️" },
  { key: "time_budget", tKey: "welcome_label_time_budget", icon: "⏱️" },
];

function formatProfileValue(key: string, value: string | null): string {
  if (!value) return "未設定";
  if (key === "profit_source") {
    return value.split(",").map(v => PROFILE_LABELS[key]?.[v] || v).join("、");
  }
  return PROFILE_LABELS[key]?.[value] || value;
}

// ── Animation CSS injected once ───────────────────────────────────
const CARVE_STYLE = `
@keyframes carve-reveal {
  0%   { clip-path: circle(0% at 50% 50%); filter: blur(20px); opacity: 0; transform: scale(0.8); }
  40%  { clip-path: circle(35% at 50% 50%); filter: blur(8px); opacity: 0.6; transform: scale(0.92); }
  100% { clip-path: circle(75% at 50% 50%); filter: blur(0px); opacity: 1; transform: scale(1); }
}
@keyframes fade-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes slide-in {
  from { opacity: 0; transform: translateX(-12px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes badge-pop {
  0%   { transform: scale(0.7); opacity: 0; }
  70%  { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes pulse-ring {
  0%   { transform: scale(0.95); opacity: 0.7; }
  50%  { transform: scale(1.05); opacity: 0.3; }
  100% { transform: scale(0.95); opacity: 0.7; }
}
.animate-carve     { animation: carve-reveal 1.4s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
.animate-fade-up   { animation: fade-up 0.6s ease-out forwards; }
.animate-slide-in  { animation: slide-in 0.5s ease-out forwards; }
.animate-badge-pop { animation: badge-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
.pulse-ring        { animation: pulse-ring 2s ease-in-out infinite; }
`;

// ── Main Page ─────────────────────────────────────────────────────
export default function WelcomePage() {
  const { t } = useT();
  const router = useRouter();
  const { user } = useUser();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [analysis, setAnalysis] = useState("");
  const [parsed, setParsed] = useState<ParsedAnalysis | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied">("idle");
  const [phase, setPhase] = useState<"loading" | "carving" | "done">("loading");
  const hasStartedStream = useRef(false);

  // Fetch user settings
  useEffect(() => {
    fetch("/api/user/settings")
      .then(r => r.json())
      .then(data => {
        if (data && !data.error) {
          setSettings({
            profit_source: data.profit_source,
            capital_range: data.capital_range,
            trade_goal: data.trade_goal,
            risk_level: data.risk_level,
            time_budget: data.time_budget,
          });
        }
        setSettingsLoaded(true);
      })
      .catch(() => setSettingsLoaded(true));
  }, []);

  // Stream analysis
  const startStream = useCallback(async () => {
    if (hasStartedStream.current) return;
    hasStartedStream.current = true;
    setIsStreaming(true);
    setPhase("carving");

    try {
      const res = await fetch("/api/welcome-analysis");
      if (!res.ok || !res.body) {
        setStreamError(true);
        setIsStreaming(false);
        setPhase("done");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accum = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed === "data: [DONE]") {
            setIsStreaming(false);
            setPhase("done");
            return;
          }
          if (trimmed.startsWith("data: ")) {
            try {
              const json = JSON.parse(trimmed.slice(6));
              if (json.content) {
                accum += json.content;
                setAnalysis(accum);
                // Parse incrementally so avatar appears early
                setParsed(parseAnalysis(accum));
              }
            } catch {
              // skip
            }
          }
        }
      }
      setIsStreaming(false);
      setPhase("done");
    } catch {
      setStreamError(true);
      setIsStreaming(false);
      setPhase("done");
    }
  }, []);

  useEffect(() => {
    if (settingsLoaded) startStream();
  }, [settingsLoaded, startStream]);

  // Determine avatar
  const avatarStyle = parsed?.avatarStyle || "";
  const AvatarComponent = AVATAR_MAP[avatarStyle] || null;
  const avatarMeta = AVATAR_META[avatarStyle] || null;
  const styleLabel = parsed?.styleLabel || avatarMeta?.label || "";

  const isDone = phase === "done";
  const hasContent = !!analysis;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <style>{CARVE_STYLE}</style>

      {/* Header */}
      <div className="flex items-center justify-center gap-2 pt-8 pb-4">
        <FlywheelLogo
          size={28}
          className="animate-[spin_8s_linear_infinite]"
          style={{ color: "var(--signal)" }}
        />
        <span className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>
          嗅鐘
        </span>
      </div>

      <div className="flex-1 flex items-start justify-center p-4 pt-2 pb-12">
        <div className="w-full max-w-md space-y-5">

          {/* ── Hero card ─────────────────────────────────── */}
          <Card
            className="rounded-2xl overflow-hidden relative"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-subtle)" }}
          >
            {/* Background glow */}
            {avatarMeta && (
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at 50% 30%, ${avatarMeta.color} 0%, transparent 70%)`,
                }}
              />
            )}

            <CardContent className="py-8 px-5 flex flex-col items-center text-center">
              {/* Avatar area */}
              <div className="relative mb-5">
                {/* Pulse ring behind avatar */}
                {!!AvatarComponent && isDone && (
                  <div
                    className="pulse-ring absolute inset-0 rounded-full"
                    style={{
                      border: `2px solid ${avatarMeta?.color || "var(--signal)"}`,
                      borderRadius: "50%",
                    }}
                  />
                )}

                {AvatarComponent ? (
                  <div
                    className={phase === "carving" || isDone ? "animate-carve" : "opacity-0"}
                    key={avatarStyle}
                  >
                    <AvatarComponent size={160} />
                  </div>
                ) : (
                  // Placeholder skeleton during loading
                  <div
                    className="w-40 h-40 rounded-full animate-pulse flex items-center justify-center"
                    style={{ backgroundColor: "var(--bg-panel)" }}
                  >
                    {isStreaming && (
                      <span
                        className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                        style={{ borderColor: "var(--signal)" }}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Style label badge */}
              {styleLabel ? (
                <div
                  className="animate-badge-pop mb-2"
                  key={styleLabel}
                  style={{ opacity: 0, animationDelay: "0.8s", animationFillMode: "forwards" }}
                >
                  <span
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide"
                    style={{
                      backgroundColor: avatarMeta?.color
                        ? `color-mix(in srgb, ${avatarMeta.color} 20%, transparent)`
                        : "var(--bg-panel)",
                      color: avatarMeta?.color || "var(--signal)",
                      border: `1.5px solid ${avatarMeta?.color || "var(--signal)"}`,
                    }}
                  >
                    {styleLabel}
                  </span>
                </div>
              ) : isStreaming ? (
                <div
                  className="h-8 w-32 rounded-full animate-pulse mb-2"
                  style={{ backgroundColor: "var(--bg-panel)" }}
                />
              ) : null}

              {/* Sub-description */}
              {avatarMeta && (
                <p
                  className="text-sm mt-1"
                  style={{ color: "var(--text-muted)", opacity: 0, animation: "fade-up 0.5s ease-out 1.1s forwards" }}
                >
                  {avatarMeta.desc}
                </p>
              )}

              {/* Page title - hidden when empty */}
              {t("welcome_title") && (
                <h1
                  className="text-xl font-bold mt-4"
                  style={{ color: "var(--text-primary)", opacity: 0, animation: "fade-up 0.5s ease-out 0.3s forwards" }}
                >
                  {t("welcome_title")}
                </h1>
              )}
            </CardContent>

            {/* ── Divider ─── */}
            <div className="mx-5" style={{ borderTop: "1px solid var(--border-subtle)" }} />

            {/* ── Profile tags section ─────────────────────────── */}
            <CardContent className="py-4 px-5" style={{ opacity: 0, animation: "fade-up 0.6s ease-out 0.5s forwards" }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
                {t("welcome_profile_title")}
              </p>
              <div className="flex flex-wrap gap-2">
                {PROFILE_FIELD_KEYS.map(({ key, tKey, icon }) => {
                  const value = settings ? formatProfileValue(key, settings[key]) : null;
                  return (
                    <div
                      key={key}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
                      style={{
                        backgroundColor: "var(--bg-panel)",
                        color: "var(--text-secondary)",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      <span>{icon}</span>
                      <span style={{ color: "var(--text-muted)" }}>{t(tKey)}：</span>
                      {value ? (
                        <span style={{ color: "var(--text-primary)" }}>{value}</span>
                      ) : (
                        <span
                          className="inline-block w-14 h-3 rounded animate-pulse"
                          style={{ backgroundColor: "var(--bg-card-hover)" }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>

            {/* ── Analysis content ─────────────────────────── */}
            {/* Loading skeleton */}
            {!hasContent && isStreaming && (
              <>
                <div className="mx-5" style={{ borderTop: "1px solid var(--border-subtle)" }} />
                <CardContent className="py-5 px-5 space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin shrink-0"
                      style={{ borderColor: "var(--signal)" }}
                    />
                    <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                      {t("welcome_generating")}
                    </span>
                  </div>
                  {[90, 75, 85, 60, 80, 70].map((w, i) => (
                    <div
                      key={i}
                      className="h-3.5 rounded animate-pulse"
                      style={{
                        backgroundColor: "var(--bg-panel)",
                        width: `${w}%`,
                        animationDelay: `${i * 0.12}s`,
                      }}
                    />
                  ))}
                </CardContent>
              </>
            )}

            {/* Risk warning section */}
            {parsed?.riskWarning && (
              <>
                <div className="mx-5" style={{ borderTop: "1px solid var(--border-subtle)" }} />
                <CardContent className="py-4 px-5" style={{ opacity: 0, animation: "fade-up 0.6s ease-out 0.7s forwards" }}>
                  <div className="flex items-start gap-3">
                    <span className="text-lg mt-0.5">⚠️</span>
                    <div>
                      <p
                        className="text-xs font-semibold uppercase tracking-widest mb-1.5"
                        style={{ color: "var(--signal-amber)" }}
                      >
                        最大風險提醒
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        {parsed.riskWarning}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </>
            )}

            {/* Risk rules section */}
            {parsed?.riskRules && parsed.riskRules.length > 0 && (
              <>
                <div className="mx-5" style={{ borderTop: "1px solid var(--border-subtle)" }} />
                <CardContent className="py-4 px-5" style={{ opacity: 0, animation: "fade-up 0.6s ease-out 0.85s forwards" }}>
                  <p
                    className="text-xs font-semibold uppercase tracking-widest mb-3"
                    style={{ color: "var(--text-muted)" }}
                  >
                    🛡️ 風控規則
                  </p>
                  <div className="space-y-2">
                    {parsed.riskRules.map((rule, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 text-sm"
                        style={{
                          opacity: 0,
                          animation: `slide-in 0.4s ease-out ${0.9 + i * 0.08}s forwards`,
                        }}
                      >
                        <span
                          className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                          style={{ backgroundColor: "var(--bg-panel)", color: "var(--signal)" }}
                        >
                          {i + 1}
                        </span>
                        <span style={{ color: "var(--text-secondary)" }}>{rule}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </>
            )}

            {/* Extra raw sections */}
            {parsed?.rawSections && parsed.rawSections.length > 0 && parsed.rawSections.map((sec, i) => (
              <React.Fragment key={i}>
                <div className="mx-5" style={{ borderTop: "1px solid var(--border-subtle)" }} />
                <CardContent className="py-4 px-5" style={{ opacity: 0, animation: `fade-up 0.6s ease-out ${1.1 + i * 0.1}s forwards` }}>
                  <p
                    className="text-xs font-semibold uppercase tracking-widest mb-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {sec.title}
                  </p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>
                    {sec.content}
                  </p>
                </CardContent>
              </React.Fragment>
            ))}

            {/* Streaming indicator */}
            {isStreaming && hasContent && (
              <CardContent className="py-3 px-5">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin shrink-0"
                    style={{ borderColor: "var(--signal)" }}
                  />
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    分析進行中...
                  </span>
                </div>
              </CardContent>
            )}

            {/* Error fallback */}
            {streamError && !hasContent && (
              <CardContent className="py-5 px-5 text-center">
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  無法載入分析，請稍後再試。
                </p>
              </CardContent>
            )}
          </Card>

          {/* ── Action buttons ────────────────────────────── */}
          {isDone && hasContent && (
            <div
              className="space-y-3"
              style={{ opacity: 0, animation: "fade-up 0.6s ease-out 1.2s forwards" }}
            >
              <Button
                onClick={async () => {
                  const shareUrl = `${window.location.origin}/profile/${user?.id || ""}`;
                  const shareData = {
                    title: "我的交易畫像 | 嗅鐘",
                    text: `我是「${styleLabel || "交易者"}」，查看我的專屬交易畫像`,
                    url: shareUrl,
                  };
                  if (navigator.share && navigator.canShare?.(shareData)) {
                    try {
                      await navigator.share(shareData);
                    } catch {
                      // User cancelled
                    }
                  } else {
                    await navigator.clipboard.writeText(shareUrl);
                    setShareStatus("copied");
                    setTimeout(() => setShareStatus("idle"), 2000);
                  }
                }}
                variant="outline"
                className="w-full rounded-xl text-sm py-5"
                style={{
                  borderColor: "var(--signal)",
                  color: "var(--signal)",
                  backgroundColor: "transparent",
                }}
              >
                {shareStatus === "copied" ? "✅ 已複製連結" : "🔗 分享我的交易畫像"}
              </Button>

              <Button
                onClick={() => router.push("/radar")}
                className="w-full rounded-xl text-sm py-5 font-semibold"
                style={{ backgroundColor: "var(--signal)", color: "var(--bg)" }}
              >
                {t("welcome_cta")}
              </Button>
            </div>
          )}

          {/* CTA always visible even before done */}
          {!isDone && (
            <Button
              onClick={() => router.push("/radar")}
              variant="ghost"
              className="w-full rounded-xl text-sm py-5"
              style={{ color: "var(--text-muted)" }}
            >
              跳過，直接進入控制台 →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
