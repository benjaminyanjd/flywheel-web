import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#0A0E08",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "72px 88px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Decorative green glow */}
        <div
          style={{
            position: "absolute",
            top: "-200px",
            right: "-150px",
            width: "600px",
            height: "800px",
            background: "radial-gradient(ellipse, rgba(60,179,113,0.06) 0%, transparent 65%)",
          }}
        />

        {/* Logo + Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "40px" }}>
          {/* Radar clock icon */}
          <svg
            width="52"
            height="52"
            viewBox="0 0 60 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="30" cy="30" r="27" stroke="#3CB371" strokeWidth="2" fill="none"/>
            <circle cx="30" cy="30" r="20" stroke="#3CB371" strokeWidth="1" opacity="0.3" fill="none"/>
            <circle cx="30" cy="30" r="12" stroke="#3CB371" strokeWidth="1" opacity="0.2" fill="none"/>
            <line x1="30" y1="30" x2="30" y2="8" stroke="#3CB371" strokeWidth="1.5" opacity="0.5"/>
            <line x1="30" y1="30" x2="48" y2="22" stroke="#3CB371" strokeWidth="2"/>
            <circle cx="30" cy="30" r="3" fill="#3CB371"/>
            <circle cx="44" cy="16" r="2.5" fill="#FF6B35" opacity="0.9"/>
            <circle cx="22" cy="14" r="2" fill="#FF6B35" opacity="0.55"/>
          </svg>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ fontSize: "26px", fontWeight: "700", color: "#3CB371", letterSpacing: "3px" }}>
              SNIFFING CLOCK
            </span>
          </div>
        </div>

        {/* Slogan */}
        <div
          style={{
            fontSize: "50px",
            fontWeight: "700",
            lineHeight: "1.3",
            marginBottom: "20px",
            display: "flex",
            flexWrap: "wrap",
            gap: "0",
          }}
        >
          <span style={{ color: "#FF6B35" }}>Skip the Noise</span>
          <span style={{ color: "#FAFAF7" }}>,&nbsp;</span>
          <span style={{ color: "#3CB371" }}>Act Now</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "22px",
            color: "rgba(250,250,247,0.55)",
            lineHeight: "1.6",
            marginBottom: "44px",
          }}
        >
          AI-powered signal radar — tells you why now and what to do first
        </div>

        {/* Pills */}
        <div style={{ display: "flex", gap: "14px" }}>
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "24px",
              padding: "8px 22px",
              fontSize: "16px",
              color: "#f87171",
              display: "flex",
              alignItems: "center",
              gap: "7px",
            }}
          >
            <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#ef4444" }} />
            Confidence Score
          </div>
          <div
            style={{
              background: "rgba(60,179,113,0.1)",
              border: "1px solid rgba(60,179,113,0.2)",
              borderRadius: "24px",
              padding: "8px 22px",
              fontSize: "16px",
              color: "#3CB371",
              display: "flex",
              alignItems: "center",
              gap: "7px",
            }}
          >
            <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#3CB371" }} />
            Instant Push
          </div>
          <div
            style={{
              background: "rgba(255,107,53,0.1)",
              border: "1px solid rgba(255,107,53,0.2)",
              borderRadius: "24px",
              padding: "8px 22px",
              fontSize: "16px",
              color: "#FF6B35",
              display: "flex",
              alignItems: "center",
              gap: "7px",
            }}
          >
            <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#FF6B35" }} />
            Personalized Filter
          </div>
          <div
            style={{
              background: "rgba(96,165,250,0.1)",
              border: "1px solid rgba(96,165,250,0.2)",
              borderRadius: "24px",
              padding: "8px 22px",
              fontSize: "16px",
              color: "#60a5fa",
              display: "flex",
              alignItems: "center",
              gap: "7px",
            }}
          >
            <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#60a5fa" }} />
            Action Plan
          </div>
        </div>

        {/* Domain */}
        <div
          style={{
            position: "absolute",
            bottom: "36px",
            right: "56px",
            fontSize: "16px",
            color: "rgba(250,250,247,0.25)",
          }}
        >
          sniffingclock.club
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
