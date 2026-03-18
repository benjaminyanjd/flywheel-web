"use client";

import { FlywheelLogo } from "@/components/flywheel-logo";

interface ProfileClientProps {
  label: string;
  labelFirstChar: string;
  tradeMethods: string[];
  capitalLabel: string;
  goalLabel: string;
  riskLabel: string;
  riskRules: string[];
}

export function ProfileClient({
  label,
  labelFirstChar,
  tradeMethods,
  capitalLabel,
  goalLabel,
  riskLabel,
  riskRules,
}: ProfileClientProps) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#0A0E08" }}>
      {/* Header */}
      <div className="flex items-center justify-center gap-2 pt-8 pb-4">
        <FlywheelLogo size={28} className="animate-[spin_8s_linear_infinite]" style={{ color: "#3CB371" }} />
        <span className="font-semibold text-lg" style={{ color: "#FAFAF7" }}>嗅鐘</span>
      </div>

      <div className="flex-1 flex items-start justify-center p-4 pt-2">
        <div className="w-full max-w-md space-y-5">
          {/* Avatar + Label */}
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #3CB371, #2E8B57)",
                boxShadow: "0 0 30px rgba(60,179,113,0.25)",
              }}
            >
              <span className="text-4xl font-bold" style={{ color: "#0A0E08" }}>{labelFirstChar}</span>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "#FAFAF7" }}>{label}</h1>
          </div>

          {/* Trade methods */}
          <div className="flex flex-wrap justify-center gap-2">
            {tradeMethods.length > 0 ? tradeMethods.map((method, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full text-sm"
                style={{
                  background: "rgba(60,179,113,0.12)",
                  border: "1px solid rgba(60,179,113,0.25)",
                  color: "#3CB371",
                }}
              >
                {method}
              </span>
            )) : (
              <span className="text-sm" style={{ color: "rgba(250,250,247,0.4)" }}>未設定交易方式</span>
            )}
          </div>

          {/* Stats */}
          <div
            className="rounded-2xl p-5 space-y-4"
            style={{ backgroundColor: "rgba(250,250,247,0.03)", border: "1px solid rgba(250,250,247,0.06)" }}
          >
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs" style={{ color: "rgba(250,250,247,0.4)" }}>資金量級</p>
                <p className="text-sm font-semibold mt-1" style={{ color: "#FAFAF7" }}>{capitalLabel}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: "rgba(250,250,247,0.4)" }}>交易目標</p>
                <p className="text-sm font-semibold mt-1" style={{ color: "#FAFAF7" }}>{goalLabel}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: "rgba(250,250,247,0.4)" }}>風險偏好</p>
                <p className="text-sm font-semibold mt-1" style={{ color: "#FAFAF7" }}>{riskLabel}</p>
              </div>
            </div>

            {/* Risk rules */}
            <div className="pt-3" style={{ borderTop: "1px solid rgba(250,250,247,0.06)" }}>
              <p className="text-xs mb-2" style={{ color: "rgba(250,250,247,0.4)" }}>風控規則</p>
              <div className="space-y-1.5">
                {riskRules.map((rule, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#FF6B35" }} />
                    <span className="text-sm" style={{ color: "rgba(250,250,247,0.65)" }}>{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA for non-logged-in users */}
          <a
            href="/sign-up"
            className="block w-full text-center rounded-xl text-base py-4 font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#3CB371", color: "#0A0E08" }}
          >
            查看你的交易畫像 → 免費試用 7 天
          </a>

          {/* Footer */}
          <div className="text-center pt-2 pb-8">
            <span className="text-xs" style={{ color: "rgba(250,250,247,0.25)" }}>
              sniffingclock.club
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
