"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n";
import { FlywheelLogo } from "@/components/flywheel-logo";

interface ExpiredContentProps {
  isActuallyExpired: boolean;
  daysLeft: number;
  totalOpps: number;
  actionedOpps: number;
}

export function ExpiredContent({ isActuallyExpired, daysLeft, totalOpps, actionedOpps }: ExpiredContentProps) {
  const { t } = useT();
  const [loading, setLoading] = useState<"monthly" | "yearly" | null>(null);

  async function handleSubscribe(plan: "monthly" | "yearly") {
    if (loading) return;
    setLoading(plan);
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        console.error("No checkout_url in response", data);
        setLoading(null);
      }
    } catch (err) {
      console.error("Failed to create payment order", err);
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "var(--bg)" }}>
      <div className="text-center max-w-lg">
        <div className="flex justify-center mb-4">
          <FlywheelLogo size={52} className="animate-[spin_8s_linear_infinite]" style={{ color: "var(--signal)" }} />
        </div>
        {isActuallyExpired ? (
          <>
            <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>{t("expired_title")}</h1>
            <p className="mb-6" style={{ color: "var(--text-secondary)" }}>{t("expired_desc")}</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>{t("expired_upgrade_title")}</h1>
            <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
              {t("sidebar_trial_left")} <span className="font-semibold" style={{ color: "var(--signal)" }}>{daysLeft} {t("sidebar_trial_days")}</span>
            </p>
          </>
        )}

        {/* Trial report */}
        <div className="rounded-2xl p-5 mb-6 text-left border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-subtle)" }}>
          <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>{t("expired_report")}</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold font-mono" style={{ color: "var(--text-primary)" }}>{totalOpps}</div>
              <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{t("expired_total")}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold font-mono" style={{ color: "var(--signal)" }}>{actionedOpps}</div>
              <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{t("expired_actioned")}</div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="rounded-2xl p-5 mb-6 border text-left" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <p className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>{t("expired_plan_title")}</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium" style={{ color: "var(--text-primary)" }}>{t("expired_monthly")}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t("expired_monthly_desc")}</p>
              </div>
              <span className="text-xl font-bold font-mono" style={{ color: "var(--text-primary)" }}>$19.9<span className="text-sm" style={{ color: "var(--text-muted)" }}>/月</span></span>
            </div>
            <hr style={{ borderColor: "var(--border-subtle)" }} />
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                  {t("expired_yearly")}
                  <span className="text-xs px-1.5 py-0.5 rounded ml-1 font-mono" style={{ backgroundColor: "color-mix(in srgb, var(--signal) 10%, transparent)", color: "var(--signal)" }}>{t("expired_save")}</span>
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t("expired_yearly_desc")}</p>
              </div>
              <span className="text-xl font-bold font-mono" style={{ color: "var(--text-primary)" }}>$199<span className="text-sm" style={{ color: "var(--text-muted)" }}>/年</span></span>
            </div>
          </div>
        </div>

        {/* Primary CTA - Monthly */}
        <button
          onClick={() => handleSubscribe("monthly")}
          disabled={loading !== null}
          className="w-full disabled:opacity-60 disabled:cursor-not-allowed font-semibold px-6 py-3 rounded-xl transition-colors mb-3 text-center font-mono"
          style={{ backgroundColor: "var(--signal)", color: "var(--bg)" }}
        >
          {loading === "monthly" ? "跳轉中..." : t("expired_subscribe")}
        </button>
        {/* Secondary CTA - Yearly */}
        <button
          onClick={() => handleSubscribe("yearly")}
          disabled={loading !== null}
          className="w-full disabled:opacity-60 disabled:cursor-not-allowed px-6 py-3 rounded-xl transition-colors mb-3 text-center text-sm border hover:bg-[var(--bg-panel)]"
          style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
        >
          {loading === "yearly" ? "跳轉中..." : `${t("expired_yearly")} $199/年 →`}
        </button>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t("expired_referral")}</p>
      </div>
    </div>
  );
}
