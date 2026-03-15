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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        <div className="flex justify-center mb-4">
          <FlywheelLogo size={52} className="text-gray-400 animate-[spin_8s_linear_infinite]" />
        </div>
        {isActuallyExpired ? (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t("expired_title")}</h1>
            <p className="text-gray-500 mb-6">{t("expired_desc")}</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t("expired_upgrade_title")}</h1>
            <p className="text-gray-500 mb-6">
              {t("sidebar_trial_left")} <span className="text-black font-semibold">{daysLeft} {t("sidebar_trial_days")}</span>
            </p>
          </>
        )}

        {/* Trial report */}
        <div className="bg-white rounded-2xl p-5 mb-6 text-left border border-gray-100">
          <p className="text-sm text-gray-500 mb-3">{t("expired_report")}</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{totalOpps}</div>
              <div className="text-xs text-gray-400 mt-1">{t("expired_total")}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{actionedOpps}</div>
              <div className="text-xs text-gray-400 mt-1">{t("expired_actioned")}</div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl p-5 mb-6 border border-gray-200 text-left">
          <p className="text-sm font-semibold text-gray-900 mb-3">{t("expired_plan_title")}</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-700 font-medium">{t("expired_monthly")}</p>
                <p className="text-xs text-gray-400">{t("expired_monthly_desc")}</p>
              </div>
              <span className="text-xl font-bold text-gray-900">$19.9<span className="text-sm text-gray-400">/月</span></span>
            </div>
            <hr className="border-gray-100" />
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-700 font-medium">{t("expired_yearly")} <span className="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded ml-1">{t("expired_save")}</span></p>
                <p className="text-xs text-gray-400">{t("expired_yearly_desc")}</p>
              </div>
              <span className="text-xl font-bold text-gray-900">$199<span className="text-sm text-gray-400">/年</span></span>
            </div>
          </div>
        </div>

        {/* Primary CTA */}
        <a
          href="https://t.me/BJMYan"
          className="inline-block w-full bg-black hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded-xl transition-colors mb-3 text-center"
        >
          {t("expired_subscribe")}
        </a>
        {/* Secondary CTA */}
        <a
          href="https://t.me/BJMYan"
          className="inline-block w-full border border-gray-200 hover:border-gray-400 text-gray-500 hover:text-gray-700 px-6 py-3 rounded-xl transition-colors mb-3 text-center text-sm"
        >
          {t("expired_contact")}
        </a>
        <p className="text-xs text-gray-400">{t("expired_referral")}</p>
      </div>
    </div>
  );
}
