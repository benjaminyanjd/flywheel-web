"use client";

interface ShareCardProps {
  title: string;
  whyNow: string;
  profitLogic: string;
  confidence: number;
  risks?: string[];
  actions?: string[];
  userInviteCode?: string;
}

export function ShareCard({ title, whyNow, profitLogic, confidence, risks = [], actions = [], userInviteCode }: ShareCardProps) {
  const confColor = confidence >= 70 ? "#10b981" : confidence >= 50 ? "#f59e0b" : "#ef4444";
  const confLabel = confidence >= 70 ? "高置信" : confidence >= 50 ? "中置信" : "低置信";

  return (
    <div
      id="flywheel-share-card"
      style={{
        width: 600,
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        borderRadius: 16,
        padding: 32,
        fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif",
        color: "#f1f5f9",
        border: "1px solid #334155",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{ width: 26, height: 26, color: "#f59e0b" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.93 4.93l2.12 2.12m9.9 9.9l2.12 2.12M4.93 19.07l2.12-2.12m9.9-9.9l2.12-2.12"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#f1f5f9" }}>Flywheel</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>AI 市場情報助理</div>
        </div>
        <div style={{
          marginLeft: "auto",
          background: confColor + "20",
          border: `1px solid ${confColor}40`,
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
      <div style={{ fontSize: 19, fontWeight: 700, color: "#f1f5f9", marginBottom: 18, lineHeight: 1.4 }}>
        💡 {title}
      </div>

      {/* Why Now */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#f59e0b", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>📌 為什麼現在</div>
        <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.6 }}>
          {whyNow.length > 160 ? whyNow.slice(0, 160) + "…" : whyNow}
        </div>
      </div>

      {/* Profit Logic */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#34d399", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>💰 盈利邏輯</div>
        <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.6 }}>
          {profitLogic.length > 160 ? profitLogic.slice(0, 160) + "…" : profitLogic}
        </div>
      </div>

      {/* Risks */}
      {risks.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#f87171", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>⚠️ 主要風險</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {risks.slice(0, 3).map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ color: "#f87171", fontSize: 12, flexShrink: 0, marginTop: 2 }}>•</span>
                <span style={{ fontSize: 13, color: "#fca5a5", lineHeight: 1.5 }}>
                  {r.length > 80 ? r.slice(0, 80) + "…" : r}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {actions.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#818cf8", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>📋 行動清單</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {actions.slice(0, 3).map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ color: "#818cf8", fontSize: 12, fontWeight: 700, flexShrink: 0, minWidth: 16 }}>{i + 1}</span>
                <span style={{ fontSize: 13, color: "#c7d2fe", lineHeight: 1.5 }}>
                  {a.length > 80 ? a.slice(0, 80) + "…" : a}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      <div style={{ borderTop: "1px solid #334155", marginBottom: 16 }} />

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>每天早 8 點，全球信號提煉成行動清單</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#f59e0b", marginTop: 2 }}>flywheelsea.club</div>
        </div>
        {userInviteCode && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#64748b" }}>邀請碼</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#f59e0b", letterSpacing: "0.1em" }}>{userInviteCode}</div>
          </div>
        )}
      </div>
    </div>
  );
}
