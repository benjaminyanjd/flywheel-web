import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "linear-gradient(135deg, #020617 0%, #0f172a 60%, #1e293b 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Decorative amber glow */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            background: "radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Logo + Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "40px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              background: "rgba(245,158,11,0.15)",
              border: "2px solid rgba(245,158,11,0.4)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
            }}
          >
            ⚙️
          </div>
          <span style={{ fontSize: "28px", fontWeight: "700", color: "#f1f5f9" }}>
            Flywheel
          </span>
        </div>

        {/* Main headline */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: "900",
            lineHeight: "1.1",
            color: "#f1f5f9",
            marginBottom: "24px",
            maxWidth: "900px",
          }}
        >
          你的 AI{" "}
          <span style={{ color: "#fbbf24" }}>市場情報助理</span>
        </div>

        {/* Sub-text */}
        <div
          style={{
            fontSize: "26px",
            color: "#94a3b8",
            lineHeight: "1.5",
            maxWidth: "800px",
            marginBottom: "48px",
          }}
        >
          每天早上 8 點，把全球信號提煉成可執行行動清單，直達 Telegram
        </div>

        {/* Tags */}
        <div style={{ display: "flex", gap: "12px" }}>
          {["🔴 高置信信號", "⚡ 即時掃描", "📱 Telegram 推送"].map((tag) => (
            <div
              key={tag}
              style={{
                background: "rgba(245,158,11,0.12)",
                border: "1px solid rgba(245,158,11,0.3)",
                borderRadius: "24px",
                padding: "8px 20px",
                fontSize: "18px",
                color: "#fbbf24",
              }}
            >
              {tag}
            </div>
          ))}
        </div>

        {/* Domain */}
        <div
          style={{
            position: "absolute",
            bottom: "48px",
            right: "80px",
            fontSize: "20px",
            color: "#475569",
          }}
        >
          flywheelsea.club
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
