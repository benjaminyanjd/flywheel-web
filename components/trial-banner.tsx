"use client";
import Link from "next/link";
import { useT } from "@/lib/i18n";

export function TrialBanner({ daysLeft }: { daysLeft: number }) {
  const { t } = useT();
  return (
    <div className={`flex items-center justify-between px-4 py-2.5 text-sm border-b ${
      daysLeft <= 2
        ? "bg-red-50 border-red-200 text-red-600"
        : "bg-amber-50 border-amber-200 text-amber-600"
    }`}>
      <span>{t("trial_banner_pre")} {daysLeft} {t("trial_banner_days")} {t("trial_banner_post")}</span>
      <Link href="/expired" className="hover:underline font-medium shrink-0">{t("trial_banner_link")}</Link>
    </div>
  );
}
