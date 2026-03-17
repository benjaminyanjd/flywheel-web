"use client";

interface ShareCardProps {
  title: string;
  whyNow: string;
  profitLogic: string;
  confidence: number;
  risks?: string[];
  actions?: string[];
  userInviteCode?: string;
  lang?: string;
  theme?: "dark" | "light";
}

const LABELS = {
  zh: {
    subtitle: "AI 市場情報助理",
    confHigh: "高置信",
    confMid: "中置信",
    confLow: "低置信",
    whyNow: "◆ 為什麼現在",
    profitLogic: "◆ 盈利邏輯",
    risks: "◆ 主要風險",
    actions: "◆ 行動清單",
    footer: "每天早 8 點，全球信號提煉成行動清單",
    inviteLabel: "邀請碼",
  },
  en: {
    subtitle: "AI Market Intelligence",
    confHigh: "High Confidence",
    confMid: "Med Confidence",
    confLow: "Low Confidence",
    whyNow: "◆ WHY NOW",
    profitLogic: "◆ PROFIT LOGIC",
    risks: "◆ KEY RISKS",
    actions: "◆ ACTION PLAN",
    footer: "Daily at 8 AM · Global signals → actionable opportunities",
    inviteLabel: "Invite Code",
  },
};

// Brand colors — Hunter Radar
const DARK = {
  bg:        "#0A0E08",
  bgCard:    "#141A12",
  border:    "#1E2A1A",
  text:      "#E8EDE6",
  textSec:   "#8A9A80",
  textMuted: "#556650",
  signal:    "#3CB371",
  amber:     "#FF6B35",
  green:     "#4ADE80",
  red:       "#FF6B6B",
};

const LIGHT = {
  bg:        "#FAFAF7",
  bgCard:    "#F0F2ED",
  border:    "#D8DDD3",
  text:      "#1A2218",
  textSec:   "#4A5A44",
  textMuted: "#8A9A80",
  signal:    "#2D5A27",
  amber:     "#D4572A",
  green:     "#1A7A3C",
  red:       "#CC3333",
};

export function ShareCard({ title, whyNow, profitLogic, confidence, risks = [], actions = [], userInviteCode, lang = "zh", theme = "dark" }: ShareCardProps) {
  const C = theme === "light" ? LIGHT : DARK;
  const L = LABELS[lang as "zh" | "en"] ?? LABELS.zh;
  const confColor = confidence >= 70 ? C.signal : confidence >= 50 ? C.amber : C.red;
  const confLabel = confidence >= 70 ? L.confHigh : confidence >= 50 ? L.confMid : L.confLow;

  return (
    <div
      id="flywheel-share-card"
      style={{
        width: 600,
        background: C.bg,
        borderRadius: 16,
        padding: 32,
        fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif",
        color: C.text,
        border: `1px solid ${C.border}`,
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{ width: 26, height: 26, color: C.signal }}>
          <svg viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="30" cy="30" r="27"/>
            <circle cx="30" cy="30" r="18" opacity="0.4"/>
            <path d="M30 30 L30 3 A27 27 0 0 1 48 12 Z" fill="currentColor" opacity="0.2"/>
            <line x1="30" y1="3" x2="30" y2="7" strokeWidth="3" strokeLinecap="round"/>
            <line x1="30" y1="30" x2="30" y2="10" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="30" y1="30" x2="44" y2="22" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="30" cy="30" r="2.5" fill="currentColor"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.text }}>嗅鐘</div>
          <div style={{ fontSize: 11, color: C.textMuted }}>{L.subtitle}</div>
        </div>
        <div style={{
          marginLeft: "auto",
          background: confColor + "22",
          border: `1px solid ${confColor}55`,
          borderRadius: 20,
          padding: "3px 12px",
          fontSize: 12,
          color: confColor,
          fontWeight: 600,
        }}>
          {confLabel} {confidence}%
        </div>
      </div>

      {/* Title */}
      <div style={{
        fontSize: 19, fontWeight: 700, color: C.text, marginBottom: 18, lineHeight: 1.4,
        borderLeft: `3px solid ${C.signal}`,
        paddingLeft: 12,
      }}>
        {title}
      </div>

      {/* Why Now */}
      <div style={{ marginBottom: 14, background: C.bgCard, borderRadius: 8, padding: "10px 14px" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.amber, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>{L.whyNow}</div>
        <div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.6 }}>
          {whyNow.length > 160 ? whyNow.slice(0, 160) + "…" : whyNow}
        </div>
      </div>

      {/* Profit Logic */}
      <div style={{ marginBottom: 14, background: C.bgCard, borderRadius: 8, padding: "10px 14px" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.green, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>{L.profitLogic}</div>
        <div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.6 }}>
          {profitLogic.length > 160 ? profitLogic.slice(0, 160) + "…" : profitLogic}
        </div>
      </div>

      {/* Risks */}
      {risks.length > 0 && (
        <div style={{ marginBottom: 14, background: C.bgCard, borderRadius: 8, padding: "10px 14px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.red, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>{L.risks}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {risks.slice(0, 3).map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ color: C.red, fontSize: 12, flexShrink: 0, marginTop: 2 }}>•</span>
                <span style={{ fontSize: 13, color: C.textSec, lineHeight: 1.5 }}>
                  {r.length > 80 ? r.slice(0, 80) + "…" : r}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {actions.length > 0 && (
        <div style={{ marginBottom: 20, background: C.bgCard, borderRadius: 8, padding: "10px 14px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.signal, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>{L.actions}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {actions.slice(0, 3).map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{
                  color: C.bg, fontSize: 11, fontWeight: 700, flexShrink: 0,
                  background: C.signal, borderRadius: "50%",
                  width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center",
                  marginTop: 1,
                }}>{i + 1}</span>
                <span style={{ fontSize: 13, color: C.textSec, lineHeight: 1.5 }}>
                  {a.length > 80 ? a.slice(0, 80) + "…" : a}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      <div style={{ borderTop: `1px solid ${C.border}`, marginBottom: 16 }} />

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 12, color: C.textMuted }}>{L.footer}</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.signal, marginTop: 2 }}>sniffingclock.club</div>
        </div>
        {userInviteCode && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: C.textMuted }}>{L.inviteLabel}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.amber, letterSpacing: "0.1em" }}>{userInviteCode}</div>
          </div>
        )}
      </div>
    </div>
  );
}
