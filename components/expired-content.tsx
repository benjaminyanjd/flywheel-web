"use client";

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

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        <div className="flex justify-center mb-4">
          <FlywheelLogo size={52} className="text-amber-400/60 animate-[spin_8s_linear_infinite]" />
        </div>
        {isActuallyExpired ? (
          <>
            <h1 className="text-2xl font-bold text-slate-100 mb-2">{t("expired_title")}</h1>
            <p className="text-slate-400 mb-6">{t("expired_desc")}</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-slate-100 mb-2">{t("expired_upgrade_title")}</h1>
            <p className="text-slate-400 mb-6">
              {t("sidebar_trial_left")} <span className="text-amber-400 font-semibold">{daysLeft} {t("sidebar_trial_days")}</span>
            </p>
          </>
        )}

        {/* Trial report */}
        <div className="bg-slate-800 rounded-xl p-5 mb-6 text-left border border-slate-700">
          <p className="text-sm text-slate-400 mb-3">{t("expired_report")}</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400">{totalOpps}</div>
              <div className="text-xs text-slate-500 mt-1">{t("expired_total")}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400">{actionedOpps}</div>
              <div className="text-xs text-slate-500 mt-1">{t("expired_actioned")}</div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-slate-800 rounded-xl p-5 mb-6 border border-amber-500/30 text-left">
          <p className="text-sm font-semibold text-amber-400 mb-3">{t("expired_plan_title")}</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-slate-200 font-medium">{t("expired_monthly")}</p>
                <p className="text-xs text-slate-500">{t("expired_monthly_desc")}</p>
              </div>
              <span className="text-xl font-bold text-slate-100">$19.9<span className="text-sm text-slate-400">/月</span></span>
            </div>
            <hr className="border-slate-700" />
            <div className="flex justify-between items-center">
              <div>
                <p className="text-slate-200 font-medium">{t("expired_yearly")} <span className="text-xs bg-emerald-700 text-emerald-200 px-1.5 py-0.5 rounded ml-1">{t("expired_save")}</span></p>
                <p className="text-xs text-slate-500">{t("expired_yearly_desc")}</p>
              </div>
              <span className="text-xl font-bold text-slate-100">$199<span className="text-sm text-slate-400">/年</span></span>
            </div>
          </div>
        </div>

        {/* Primary CTA — crypto payment coming soon; redirect to contact for now */}
        <a
          href="https://t.me/BJMYan"
          className="inline-block w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-6 py-3 rounded-lg transition-colors mb-3 text-center"
        >
          {t("expired_subscribe")}
        </a>
        {/* Secondary CTA */}
        <a
          href="https://t.me/BJMYan"
          className="inline-block w-full border border-slate-600 hover:border-slate-400 text-slate-400 hover:text-slate-200 px-6 py-3 rounded-lg transition-colors mb-3 text-center text-sm"
        >
          {t("expired_contact")}
        </a>
        <p className="text-xs text-slate-600">{t("expired_referral")}</p>
      </div>
    </div>
  );
}
