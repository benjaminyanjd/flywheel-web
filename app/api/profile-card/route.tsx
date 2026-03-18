import { ImageResponse } from "next/og";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

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
    conservative: "保守型",
    balanced: "平衡型",
    aggressive: "激進型",
  },
};

// Simple risk rules based on profile
function getRiskRules(settings: Record<string, string | null>): string[] {
  const rules: string[] = [];
  if (settings.risk_level === "conservative") {
    rules.push("單筆倉位 ≤ 5%");
    rules.push("止損設定 -8%");
    rules.push("避開高波動 Meme 幣");
  } else if (settings.risk_level === "aggressive") {
    rules.push("單筆倉位 ≤ 15%");
    rules.push("止損設定 -15%");
    rules.push("追蹤止盈 +30%");
  } else {
    rules.push("單筆倉位 ≤ 10%");
    rules.push("止損設定 -10%");
    rules.push("分批建倉降低風險");
  }
  return rules;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return new Response("Missing userId", { status: 400 });
  }

  const db = getDb();
  const settings = db.prepare(
    "SELECT profit_source, capital_range, trade_goal, risk_level, time_budget FROM user_settings WHERE user_id = ?"
  ).get(userId) as Record<string, string | null> | undefined;

  if (!settings) {
    return new Response("User not found", { status: 404 });
  }

  const label = settings.trade_goal
    ? (settings.risk_level === "aggressive" ? "高波動獵手" :
       settings.risk_level === "conservative" ? "穩健守護者" :
       settings.trade_goal === "grow_fast" ? "小資衝浪手" :
       settings.trade_goal === "steady_income" ? "收益農夫" :
       settings.trade_goal === "learn_explore" ? "探索先鋒" : "平衡行者")
    : "交易新手";

  const labelFirstChar = label[0];

  const tradeMethods = (settings.profit_source || "")
    .split(",")
    .filter(Boolean)
    .map(v => PROFILE_LABELS.profit_source[v] || v);

  const capitalLabel = PROFILE_LABELS.capital_range[settings.capital_range || ""] || "未設定";
  const goalLabel = PROFILE_LABELS.trade_goal[settings.trade_goal || ""] || "未設定";
  const riskRules = getRiskRules(settings);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#0A0E08",
          display: "flex",
          flexDirection: "column",
          fontFamily: "sans-serif",
          position: "relative",
          padding: "48px 56px",
        }}
      >
        {/* Green glow */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "-100px",
            width: "500px",
            height: "500px",
            background: "radial-gradient(ellipse, rgba(60,179,113,0.08) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Main content area */}
        <div style={{ display: "flex", flex: 1, gap: "48px" }}>
          {/* Left: Avatar */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "260px" }}>
            <div
              style={{
                width: "180px",
                height: "180px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #3CB371, #2E8B57)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 40px rgba(60,179,113,0.3)",
              }}
            >
              <span style={{ fontSize: "72px", fontWeight: "700", color: "#0A0E08" }}>
                {labelFirstChar}
              </span>
            </div>
            <span style={{ fontSize: "14px", color: "rgba(250,250,247,0.3)", marginTop: "16px" }}>
              交易畫像
            </span>
          </div>

          {/* Right: Info */}
          <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", gap: "20px" }}>
            {/* Label name */}
            <div style={{ fontSize: "42px", fontWeight: "700", color: "#FAFAF7", lineHeight: "1.2", display: "flex" }}>
              {label}
            </div>

            {/* Trade method pills */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {tradeMethods.length > 0 ? tradeMethods.map((method, i) => (
                <div
                  key={i}
                  style={{
                    background: "rgba(60,179,113,0.15)",
                    border: "1px solid rgba(60,179,113,0.3)",
                    borderRadius: "20px",
                    padding: "6px 18px",
                    fontSize: "16px",
                    color: "#3CB371",
                    display: "flex",
                  }}
                >
                  {method}
                </div>
              )) : (
                <div
                  style={{
                    background: "rgba(60,179,113,0.15)",
                    border: "1px solid rgba(60,179,113,0.3)",
                    borderRadius: "20px",
                    padding: "6px 18px",
                    fontSize: "16px",
                    color: "#3CB371",
                    display: "flex",
                  }}
                >
                  未設定交易方式
                </div>
              )}
            </div>

            {/* Capital + Goal */}
            <div style={{ display: "flex", gap: "32px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "13px", color: "rgba(250,250,247,0.4)" }}>資金量級</span>
                <span style={{ fontSize: "20px", color: "#FAFAF7", fontWeight: "600" }}>{capitalLabel}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "13px", color: "rgba(250,250,247,0.4)" }}>交易目標</span>
                <span style={{ fontSize: "20px", color: "#FAFAF7", fontWeight: "600" }}>{goalLabel}</span>
              </div>
            </div>

            {/* Risk rules */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "13px", color: "rgba(250,250,247,0.4)" }}>風控規則</span>
              {riskRules.map((rule, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#FF6B35", display: "flex" }} />
                  <span style={{ fontSize: "16px", color: "rgba(250,250,247,0.7)" }}>{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "20px", borderTop: "1px solid rgba(250,250,247,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Radar logo */}
            <svg
              width="28"
              height="28"
              viewBox="0 0 60 60"
              fill="none"
            >
              <circle cx="30" cy="30" r="27" stroke="#3CB371" strokeWidth="2" fill="none"/>
              <circle cx="30" cy="30" r="20" stroke="#3CB371" strokeWidth="1" opacity="0.3" fill="none"/>
              <line x1="30" y1="30" x2="30" y2="8" stroke="#3CB371" strokeWidth="1.5" opacity="0.5"/>
              <line x1="30" y1="30" x2="48" y2="22" stroke="#3CB371" strokeWidth="2"/>
              <circle cx="30" cy="30" r="3" fill="#3CB371"/>
            </svg>
            <span style={{ fontSize: "18px", fontWeight: "600", color: "#3CB371" }}>嗅鐘</span>
            <span style={{ fontSize: "14px", color: "rgba(250,250,247,0.3)", marginLeft: "4px" }}>sniffingclock.club</span>
          </div>
          <span style={{ fontSize: "14px", color: "rgba(250,250,247,0.35)" }}>掃碼查看你的交易畫像</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
