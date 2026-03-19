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

  const extractBold = (text: string): string => {
    const m = text.match(/\*\*([^*]+)\*\*/);
    return m ? m[1].trim() : text.replace(/[#*`]/g, "").trim();
  };

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
/* ── Original animations ── */
@keyframes carve-reveal {
  0%   { clip-path: circle(0% at 50% 50%); filter: blur(20px); opacity: 0; transform: scale(0.8); }
  40%  { clip-path: circle(35% at 50% 50%); filter: blur(8px); opacity: 0.6; transform: scale(0.92); }
  100% { clip-path: circle(75% at 50% 50%); filter: blur(0px); opacity: 1; transform: scale(1); }
}
@keyframes fade-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes pulse-ring {
  0%   { transform: scale(0.95); opacity: 0.7; }
  50%  { transform: scale(1.05); opacity: 0.3; }
  100% { transform: scale(0.95); opacity: 0.7; }
}
.animate-carve     { animation: carve-reveal 1.4s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
.animate-fade-up   { animation: fade-up 0.6s ease-out forwards; }
.pulse-ring        { animation: pulse-ring 2s ease-in-out infinite; }

/* ── Hacker overlay animations ── */
@keyframes matrix-fall {
  0%   { transform: translateY(-120%); opacity: 0; }
  8%   { opacity: 0.85; }
  92%  { opacity: 0.85; }
  100% { transform: translateY(120vh); opacity: 0; }
}
@keyframes scan-sweep {
  0%   { top: -4px; opacity: 0; }
  5%   { opacity: 1; }
  95%  { opacity: 0.8; }
  100% { top: 100%; opacity: 0; }
}
@keyframes terminal-cursor-blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}
@keyframes hack-fadeout {
  from { opacity: 1; pointer-events: all; }
  to   { opacity: 0; pointer-events: none; }
}
@keyframes card-fadein {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes logo-spin-glow {
  0%   { transform: rotate(0deg); filter: drop-shadow(0 0 6px #3CB371); }
  50%  { filter: drop-shadow(0 0 14px #3CB371) drop-shadow(0 0 28px #3CB371); }
  100% { transform: rotate(360deg); filter: drop-shadow(0 0 6px #3CB371); }
}
@keyframes hex-pulse {
  0%, 100% { transform: scale(1); opacity: 0.15; }
  50%       { transform: scale(1.12); opacity: 0.3; }
}
@keyframes data-flicker {
  0%, 100% { opacity: 0.6; }
  30%       { opacity: 0.15; }
  60%       { opacity: 0.8; }
}
@keyframes progress-glow {
  0%, 100% { box-shadow: 0 0 6px #3CB371, 0 0 12px #3CB371; }
  50%       { box-shadow: 0 0 12px #3CB371, 0 0 24px #3CB371, 0 0 40px #3CB371; }
}
.hack-overlay-out {
  animation: hack-fadeout 0.7s ease-in-out forwards;
}
.card-reveal {
  animation: card-fadein 0.6s ease-out forwards;
}
`;

// ── Matrix rain column ────────────────────────────────────────────
const MATRIX_CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF<>[]{}\\|/$#@!%^&*";

function randomChar() {
  return MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
}

interface MatrixColumn {
  id: number;
  chars: string;
  left: string;
  duration: string;
  delay: string;
  opacity: number;
  fontSize: number;
}

function generateMatrixColumns(count: number): MatrixColumn[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    chars: Array.from({ length: 22 }, () => randomChar()).join("\n"),
    left: `${(i / count) * 100}%`,
    duration: `${2.5 + Math.random() * 2.5}s`,
    delay: `${Math.random() * 4}s`,
    opacity: 0.3 + Math.random() * 0.55,
    fontSize: 10 + Math.floor(Math.random() * 4),
  }));
}

// ── Terminal messages ─────────────────────────────────────────────
const TERMINAL_MESSAGES = [
  "> Initializing scan sequence...",
  "> Scanning trading profile...",
  "> Analyzing risk tolerance...",
  "> Mapping behavioral patterns...",
  "> Computing volatility index...",
  "> Detecting market instincts...",
  "> Building trader avatar...",
  "> Synthesizing risk model...",
  "> Generating insights...",
  "> Finalizing report...",
];

// ── Hacking Overlay Component ─────────────────────────────────────
function HackingOverlay({ onSkip, isLeaving, isComplete }: { onSkip: () => void; isLeaving: boolean; isComplete: boolean }) {
  const [displayedMsgs, setDisplayedMsgs] = useState<string[]>([TERMINAL_MESSAGES[0]]);
  const [progress, setProgress] = useState(3);
  const [dataBlocks, setDataBlocks] = useState<string[][]>([]);
  const msgIdxRef = useRef(0);

  // Generate matrix columns once
  const matrixCols = useRef<MatrixColumn[]>([]);
  if (matrixCols.current.length === 0) {
    matrixCols.current = generateMatrixColumns(28);
  }

  // Cycle terminal messages
  useEffect(() => {
    const interval = setInterval(() => {
      msgIdxRef.current += 1;
      if (msgIdxRef.current < TERMINAL_MESSAGES.length) {
        const next = TERMINAL_MESSAGES[msgIdxRef.current];
        setDisplayedMsgs(prev => [...prev.slice(-5), next]);
      }
    }, 1100);
    return () => clearInterval(interval);
  }, []);

  // Animate progress bar — caps at 90% during hacking, jumps to 100% when complete
  useEffect(() => {
    if (isComplete) {
      setProgress(100);
      return;
    }
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return 95;
        // Slow down progressively — never stops, just crawls
        const speed = prev < 30 ? (Math.random() * 3 + 1.5)
                    : prev < 55 ? (Math.random() * 1.9 + 1.1)
                    : prev < 75 ? (Math.random() * 1.4 + 0.5)
                    : (Math.random() * 0.7 + 0.5);
        return Math.min(prev + speed, 98);
      });
    }, 500);
    return () => clearInterval(interval);
  }, [isComplete]);

  // Random data blocks (flickering hex data)
  useEffect(() => {
    const hexChars = "0123456789ABCDEF";
    const genBlock = () =>
      Array.from({ length: 4 }, () =>
        Array.from({ length: 4 }, () => hexChars[Math.floor(Math.random() * 16)]).join("")
      );
    setDataBlocks(Array.from({ length: 8 }, genBlock));
    const interval = setInterval(() => {
      setDataBlocks(Array.from({ length: 8 }, genBlock));
    }, 180);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={isLeaving ? "hack-overlay-out" : ""}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        backgroundColor: "#0a0e08",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* ── Matrix rain ── */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {matrixCols.current.map(col => (
          <div
            key={col.id}
            style={{
              position: "absolute",
              left: col.left,
              top: 0,
              width: "3.8%",
              fontFamily: "monospace",
              fontSize: `${col.fontSize}px`,
              color: "#3CB371",
              opacity: col.opacity,
              lineHeight: "1.5",
              whiteSpace: "pre",
              animation: `matrix-fall ${col.duration} linear ${col.delay} infinite`,
            }}
          >
            {col.chars}
          </div>
        ))}
      </div>

      {/* ── Scan line ── */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: "2px",
          background: "linear-gradient(90deg, transparent 0%, #3CB371 30%, #7fffc4 50%, #3CB371 70%, transparent 100%)",
          boxShadow: "0 0 20px #3CB371, 0 0 40px #3CB371",
          animation: "scan-sweep 3s ease-in-out 0.5s infinite",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      {/* ── Center logo (2x size) ── */}
      <div
        style={{
          position: "relative",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        <div style={{ animation: "logo-spin-glow 3s linear infinite" }}>
          <FlywheelLogo size={112} style={{ color: "#3CB371" }} />
        </div>

        <div
          style={{
            fontFamily: "monospace",
            fontSize: 16,
            color: "#3CB371",
            letterSpacing: "0.25em",
            opacity: 0.8,
          }}
        >
          ANALYZING TRADER PROFILE
        </div>

        {/* Progress bar */}
        <div
          style={{
            width: 360,
            height: 6,
            backgroundColor: "rgba(60,179,113,0.15)",
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid rgba(60,179,113,0.3)",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.min(progress, 100)}%`,
              backgroundColor: "#3CB371",
              borderRadius: 3,
              transition: "width 0.8s ease-out",
              animation: "progress-glow 1.5s ease-in-out infinite",
            }}
          />
        </div>
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 16,
            color: "#3CB371",
            opacity: 0.6,
          }}
        >
          {Math.min(Math.floor(progress), 100)}%
        </div>
      </div>

      {/* ── Terminal output ── */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(480px, 90vw)",
          zIndex: 3,
          fontFamily: "monospace",
          fontSize: 12,
          color: "#3CB371",
          lineHeight: "1.8",
        }}
      >
        {displayedMsgs.map((msg, i) => (
          <div
            key={`${i}-${msg}`}
            style={{
              opacity: i === displayedMsgs.length - 1 ? 1 : 0.4 - (displayedMsgs.length - 1 - i) * 0.08,
            }}
          >
            {msg}
            {i === displayedMsgs.length - 1 && (
              <span style={{ animation: "terminal-cursor-blink 1s step-end infinite" }}>█</span>
            )}
          </div>
        ))}
      </div>

      {/* ── Flickering data blocks (corners) ── */}
      {dataBlocks.length > 0 && (
        <>
          <div
            style={{
              position: "absolute",
              top: 24,
              left: 24,
              fontFamily: "monospace",
              fontSize: 9,
              color: "#3CB371",
              opacity: 0.35,
              lineHeight: "1.6",
              animation: "data-flicker 0.3s linear infinite",
              pointerEvents: "none",
              zIndex: 3,
            }}
          >
            {dataBlocks.slice(0, 4).map((b, i) => (
              <div key={i}>{b.join(" ")}</div>
            ))}
          </div>
          <div
            style={{
              position: "absolute",
              top: 24,
              right: 24,
              fontFamily: "monospace",
              fontSize: 9,
              color: "#3CB371",
              opacity: 0.35,
              lineHeight: "1.6",
              textAlign: "right",
              animation: "data-flicker 0.4s linear 0.15s infinite",
              pointerEvents: "none",
              zIndex: 3,
            }}
          >
            {dataBlocks.slice(4, 8).map((b, i) => (
              <div key={i}>{b.join(" ")}</div>
            ))}
          </div>
        </>
      )}

      {/* ── Skip button ── */}
      <button
        onClick={onSkip}
        style={{
          position: "absolute",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          fontFamily: "monospace",
          fontSize: 13,
          color: "rgba(60,179,113,0.5)",
          background: "none",
          border: "none",
          cursor: "pointer",
          letterSpacing: "0.05em",
          transition: "color 0.2s",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={e => ((e.target as HTMLButtonElement).style.color = "#3CB371")}
        onMouseLeave={e => ((e.target as HTMLButtonElement).style.color = "rgba(60,179,113,0.5)")}
      >
        跳過，直接進入控制台 →
      </button>
    </div>
  );
}

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
  // phases: "hacking" → "revealing" → "done"
  const [phase, setPhase] = useState<"hacking" | "revealing" | "done">("hacking");
  const [overlayLeaving, setOverlayLeaving] = useState(false);
  const [streamComplete, setStreamComplete] = useState(false);
  const hasStartedStream = useRef(false);
  const finalParsedRef = useRef<ParsedAnalysis | null>(null);

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

  // Transition from hacking → revealing → done
  // Step 1: signal complete → progress bar animates to 100% (0.5s)
  // Step 2: after 0.6s, start overlay fade-out
  // Step 3: after fade-out (0.7s), show done
  const triggerReveal = useCallback((finalAnalysis: string) => {
    const finalParsed = parseAnalysis(finalAnalysis);
    finalParsedRef.current = finalParsed;
    setParsed(finalParsed);
    setStreamComplete(true); // progress bar → 100%
    // Wait for progress bar to reach 100%, then fade out
    setTimeout(() => {
      setOverlayLeaving(true);
      setPhase("revealing");
      setTimeout(() => {
        setPhase("done");
        setOverlayLeaving(false);
      }, 750);
    }, 600);
  }, []);

  // Stream analysis — accumulate in background, don't render incrementally
  const startStream = useCallback(async () => {
    if (hasStartedStream.current) return;
    hasStartedStream.current = true;
    setIsStreaming(true);

    try {
      const res = await fetch("/api/welcome-analysis");
      if (!res.ok || !res.body) {
        setStreamError(true);
        setIsStreaming(false);
        triggerReveal("");
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
            setAnalysis(accum);
            triggerReveal(accum);
            return;
          }
          if (trimmed.startsWith("data: ")) {
            try {
              const json = JSON.parse(trimmed.slice(6));
              if (json.content) {
                accum += json.content;
                // Accumulate in background only — no incremental UI update
              }
            } catch {
              // skip
            }
          }
        }
      }
      setIsStreaming(false);
      setAnalysis(accum);
      triggerReveal(accum);
    } catch {
      setStreamError(true);
      setIsStreaming(false);
      triggerReveal("");
    }
  }, [triggerReveal]);

  useEffect(() => {
    if (settingsLoaded) startStream();
  }, [settingsLoaded, startStream]);

  const handleSkip = useCallback(() => {
    router.push("/radar");
  }, [router]);

  // Determine avatar
  const avatarStyle = parsed?.avatarStyle || "";
  const AvatarComponent = AVATAR_MAP[avatarStyle] || null;
  const avatarMeta = AVATAR_META[avatarStyle] || null;
  const styleLabel = parsed?.styleLabel || avatarMeta?.label || "";

  const isDone = phase === "done";
  const isRevealing = phase === "revealing";
  const showCard = isDone || isRevealing;
  const hasContent = !!analysis;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <style>{CARVE_STYLE}</style>

      {/* ── Hacking overlay ── */}
      {(phase === "hacking" || overlayLeaving) && (
        <HackingOverlay onSkip={handleSkip} isLeaving={overlayLeaving} isComplete={streamComplete} />
      )}

      {/* ── Card content (visible when revealing or done) ── */}
      {showCard && (
        <div
          className="card-reveal"
          style={{ display: "flex", flexDirection: "column", flex: 1 }}
        >
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

          {/* Main container */}
          <div className="flex-1 flex items-start justify-center p-4 pt-2 pb-12">
            <div className="w-full max-w-md md:max-w-3xl space-y-5">

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

                {/* ── Top section: avatar + style info ── */}
                <CardContent className="py-8 px-5">
                  <div className="flex flex-col items-center text-center md:flex-row md:items-start md:text-left md:gap-8">

                    {/* Avatar */}
                    <div className="relative shrink-0 mb-5 md:mb-0">
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
                        <div>
                          <AvatarComponent size={160} className="md:hidden" />
                          <AvatarComponent size={200} className="hidden md:block" />
                        </div>
                      ) : (
                        <div
                          className="w-40 h-40 md:w-[200px] md:h-[200px] rounded-full flex items-center justify-center"
                          style={{ backgroundColor: "var(--bg-panel)" }}
                        />
                      )}
                    </div>

                    {/* Style info */}
                    <div className="flex-1 flex flex-col items-center md:items-start">
                      {/* Style label badge */}
                      {styleLabel ? (
                        <div className="mb-2">
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
                      ) : null}

                      {/* Sub-description */}
                      {avatarMeta && (
                        <p className="text-sm mt-1 mb-3" style={{ color: "var(--text-muted)" }}>
                          {avatarMeta.desc}
                        </p>
                      )}

                      {/* Page title */}
                      {t("welcome_title") && (
                        <h1 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                          {t("welcome_title")}
                        </h1>
                      )}

                      {/* Profile tags */}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
                          {t("welcome_profile_title")}
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
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
                                  <span className="inline-block w-14 h-3 rounded" style={{ backgroundColor: "var(--bg-card-hover)" }} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>

                {/* ── Error fallback ── */}
                {streamError && !hasContent && (
                  <>
                    <div className="mx-5" style={{ borderTop: "1px solid var(--border-subtle)" }} />
                    <CardContent className="py-5 px-5 text-center">
                      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                        無法載入分析，請稍後再試。
                      </p>
                    </CardContent>
                  </>
                )}

                {/* ── Risk + Rules ── */}
                {(parsed?.riskWarning || (parsed?.riskRules && parsed.riskRules.length > 0)) && (
                  <>
                    <div className="mx-5" style={{ borderTop: "1px solid var(--border-subtle)" }} />
                    <CardContent className="py-4 px-5">
                      <div className="flex flex-col md:flex-row md:gap-6">
                        {parsed?.riskWarning && (
                          <div className="flex-1 mb-4 md:mb-0">
                            <div className="flex items-start gap-3">
                              <span className="text-lg mt-0.5">⚠️</span>
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "var(--signal-amber)" }}>
                                  最大風險提醒
                                </p>
                                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                  {parsed.riskWarning}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        {parsed?.riskWarning && parsed?.riskRules && parsed.riskRules.length > 0 && (
                          <div className="hidden md:block w-px self-stretch" style={{ backgroundColor: "var(--border-subtle)" }} />
                        )}
                        {parsed?.riskRules && parsed.riskRules.length > 0 && (
                          <div className="flex-1">
                            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
                              🛡️ 風控規則
                            </p>
                            <div className="space-y-2">
                              {parsed.riskRules.map((rule, i) => (
                                <div key={i} className="flex items-start gap-2.5 text-sm">
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
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </>
                )}

                {/* ── Raw sections ── */}
                {parsed?.rawSections && parsed.rawSections.length > 0 && parsed.rawSections.map((sec, i) => (
                  <React.Fragment key={i}>
                    <div className="mx-5" style={{ borderTop: "1px solid var(--border-subtle)" }} />
                    <CardContent className="py-4 px-5">
                      <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
                        {sec.title}
                      </p>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>
                        {sec.content}
                      </p>
                    </CardContent>
                  </React.Fragment>
                ))}
              </Card>

              {/* ── Action buttons ── */}
              {isDone && hasContent && (
                <div className="space-y-3">
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

              {/* Skip button when card showing but not fully done */}
              {isRevealing && (
                <Button
                  onClick={handleSkip}
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
      )}
    </div>
  );
}
