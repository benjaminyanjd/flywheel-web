"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FlywheelLogo } from "@/components/flywheel-logo";
import { useT, type TKey } from "@/lib/i18n";

// Label maps for displaying user profile values
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
    tiny: "💵 < $1K",
    small: "💰 $1K – $10K",
    medium: "💎 $10K – $100K",
    large: "🏦 $100K+",
  },
  trade_goal: {
    grow_fast: "🚀 快速增長",
    steady_income: "📈 穩定收益",
    preserve_grow: "🛡 保值增值",
    learn_explore: "📚 學習探索",
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

interface UserSettings {
  profit_source: string | null;
  capital_range: string | null;
  trade_goal: string | null;
  risk_level: string | null;
  time_budget: string | null;
}

export default function WelcomePage() {
  const { t } = useT();
  const router = useRouter();
  const { user } = useUser();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [analysis, setAnalysis] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied">("idle");
  const analysisRef = useRef<HTMLDivElement>(null);
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

  // Start streaming analysis
  const startStream = useCallback(async () => {
    if (hasStartedStream.current) return;
    hasStartedStream.current = true;
    setIsStreaming(true);

    try {
      const res = await fetch("/api/welcome-analysis");
      if (!res.ok || !res.body) {
        setStreamError(true);
        setIsStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

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
            return;
          }
          if (trimmed.startsWith("data: ")) {
            try {
              const json = JSON.parse(trimmed.slice(6));
              if (json.content) {
                setAnalysis(prev => prev + json.content);
              }
            } catch {
              // skip
            }
          }
        }
      }
      setIsStreaming(false);
    } catch {
      setStreamError(true);
      setIsStreaming(false);
    }
  }, []);

  useEffect(() => {
    if (settingsLoaded) {
      startStream();
    }
  }, [settingsLoaded, startStream]);

  // Auto-scroll as text streams in
  useEffect(() => {
    if (analysisRef.current) {
      analysisRef.current.scrollTop = analysisRef.current.scrollHeight;
    }
  }, [analysis]);

  function formatProfileValue(key: string, value: string | null): string {
    if (!value) return "未設定";
    if (key === "profit_source") {
      return value.split(",").map(v => PROFILE_LABELS[key]?.[v] || v).join("、");
    }
    return PROFILE_LABELS[key]?.[value] || value;
  }

  const PROFILE_FIELDS: { key: keyof UserSettings; tKey: TKey }[] = [
    { key: "profit_source", tKey: "welcome_label_profit_source" },
    { key: "capital_range", tKey: "welcome_label_capital_range" },
    { key: "trade_goal", tKey: "welcome_label_trade_goal" },
    { key: "risk_level", tKey: "welcome_label_risk_level" },
    { key: "time_budget", tKey: "welcome_label_time_budget" },
  ];

  const fallbackContent = `## ${t("welcome_fallback_title")}

${t("welcome_fallback_desc")}

### 🎯 為你量身定制
- 信號將根據你的交易方式和風險偏好進行過濾
- 每日推送匹配你資金量級的機會
- 行動清單會考慮你的時間預算

### 📊 接下來
1. 前往信號雷達查看最新信號
2. 綁定 Telegram 接收即時推送
3. 開始你的第一筆交易`;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg)" }}>
      {/* Header */}
      <div className="flex items-center justify-center gap-2 pt-8 pb-4">
        <FlywheelLogo size={28} className="animate-[spin_8s_linear_infinite]" style={{ color: "var(--signal)" }} />
        <span className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>嗅鐘</span>
      </div>

      <div className="flex-1 flex items-start justify-center p-4 pt-2">
        <div className="w-full max-w-lg space-y-5">
          {/* Title */}
          <h1 className="text-2xl font-bold text-center" style={{ color: "var(--text-primary)" }}>
            {t("welcome_title")}
          </h1>

          {/* Profile Summary Card */}
          <Card className="rounded-2xl" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-subtle)" }}>
            <CardContent className="py-4 px-5">
              <p className="text-sm font-medium mb-3" style={{ color: "var(--text-primary)" }}>
                {t("welcome_profile_title")}
              </p>
              <div className="space-y-2">
                {PROFILE_FIELDS.map(({ key, tKey }) => (
                  <div key={key} className="flex items-start gap-2 text-sm">
                    <span className="shrink-0 font-medium" style={{ color: "var(--text-muted)", minWidth: "5rem" }}>
                      {t(tKey)}
                    </span>
                    <span style={{ color: "var(--text-secondary)" }}>
                      {settings ? formatProfileValue(key, settings[key]) : (
                        <span className="inline-block w-24 h-4 rounded animate-pulse" style={{ backgroundColor: "var(--bg-panel)" }} />
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis Card */}
          <Card className="rounded-2xl" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-subtle)" }}>
            <CardContent className="py-5 px-5">
              {/* Loading skeleton */}
              {!analysis && isStreaming && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-4 h-4 border-2 border-t-[var(--signal)] rounded-full animate-spin" style={{ borderColor: "var(--border)" }} />
                    <span className="text-sm" style={{ color: "var(--text-muted)" }}>{t("welcome_generating")}</span>
                  </div>
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-4 rounded animate-pulse"
                      style={{
                        backgroundColor: "var(--bg-panel)",
                        width: `${70 + Math.random() * 30}%`,
                        animationDelay: `${i * 0.15}s`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Streaming / completed content */}
              {analysis && (
                <div ref={analysisRef} className="max-h-[50vh] overflow-y-auto">
                  <div
                    className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {analysis}
                    {isStreaming && (
                      <span className="inline-block w-1.5 h-4 ml-0.5 animate-pulse rounded-sm" style={{ backgroundColor: "var(--signal)" }} />
                    )}
                  </div>
                </div>
              )}

              {/* Error fallback */}
              {streamError && !analysis && (
                <div
                  className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {fallbackContent}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Share Button */}
          {!isStreaming && analysis && (
            <Button
              onClick={async () => {
                const shareUrl = `${window.location.origin}/profile/${user?.id || ""}`;
                const shareData = {
                  title: "我的交易畫像 | 嗅鐘",
                  text: "查看我的交易畫像，發現你的交易風格",
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
              className="w-full rounded-xl text-base py-6"
              style={{
                borderColor: "var(--signal)",
                color: "var(--signal)",
                backgroundColor: "transparent",
              }}
            >
              {shareStatus === "copied" ? "✅ 已複製鏈接" : "📤 分享你的交易畫像"}
            </Button>
          )}

          {/* CTA Button */}
          <Button
            onClick={() => router.push("/radar")}
            className="w-full rounded-xl text-base py-6"
            style={{ backgroundColor: "var(--signal)", color: "var(--bg)" }}
          >
            {t("welcome_cta")}
          </Button>
        </div>
      </div>
    </div>
  );
}
