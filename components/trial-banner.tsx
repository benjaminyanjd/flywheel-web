"use client";
import { useT } from "@/lib/i18n";

export function TrialBanner({ daysLeft }: { daysLeft: number }) {
  const { t } = useT();
  return (
    <div className={`flex items-center justify-between px-4 py-2.5 text-sm border-b ${
      daysLeft <= 2
        ? "bg-red-900/30 border-red-700/50 text-red-300"
        : "bg-amber-900/30 border-amber-700/50 text-amber-300"
    }`}>
      <span>{t("trial_banner_pre")} {daysLeft} {t("trial_banner_days")} {t("trial_banner_post")}</span>
      <a href="/expired" className="hover:underline font-medium shrink-0">{t("trial_banner_link")}</a>
    </div>
  );
}
