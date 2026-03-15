"use client";

import React from "react";
import type { TKey } from "@/lib/i18n";

interface OpportunityFiltersProps {
  dateFilter: "today" | "all";
  setDateFilter: (f: "today" | "all") => void;
  confFilter: "all" | "high" | "mid" | "low";
  setConfFilter: (f: "all" | "high" | "mid" | "low") => void;
  freshnessFilter: "all" | "fresh" | "expired";
  setFreshnessFilter: (f: "all" | "fresh" | "expired") => void;
  count: number;
  latestDate: string | undefined;
  t: (key: TKey) => string;
}

export function OpportunityFilters({
  dateFilter, setDateFilter, confFilter, setConfFilter,
  freshnessFilter, setFreshnessFilter,
  count, latestDate, t,
}: OpportunityFiltersProps) {
  return (
    <div className="flex flex-col gap-2 mb-4">
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-900">{t("opp_title")}</h1>
        {count > 0 && (
          <span className="bg-gray-100 text-gray-600 border border-gray-200 text-xs font-bold px-2 py-0.5 rounded-full">
            {count}
          </span>
        )}
        {count > 0 && latestDate && (() => {
          const d = new Date(latestDate + (latestDate.endsWith("Z") ? "" : "Z"));
          const now = new Date();
          const diffMs = now.getTime() - d.getTime();
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          const timeStr = d.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Shanghai" });
          let label: string;
          if (diffDays === 0) label = `${t("opp_time_today")} ${timeStr}`;
          else if (diffDays === 1) label = `${t("opp_time_yesterday")} ${timeStr}`;
          else label = `${diffDays} ${t("opp_time_days_ago")}`;
          return <span className="text-xs text-gray-400">{t("opp_last_updated")}{label}</span>;
        })()}
        <div className="flex gap-1 bg-gray-50 rounded-2xl p-1">
          <button onClick={() => setDateFilter("today")} className={dateFilter === "today" ? "bg-black text-white text-xs px-3 py-1 rounded-full" : "text-gray-500 text-xs px-3 py-1"}>{t("opp_date_today")}</button>
          <button onClick={() => setDateFilter("all")} className={dateFilter === "all" ? "bg-black text-white text-xs px-3 py-1 rounded-full" : "text-gray-500 text-xs px-3 py-1"}>{t("opp_date_all")}</button>
        </div>
        <div className="flex items-center gap-1 ml-2 bg-gray-50 rounded-2xl p-1 overflow-x-auto flex-nowrap">
          {([
            { key: "all", label: t("common_all") },
            { key: "high", label: t("opp_conf_high") + " ≥70%" },
            { key: "mid", label: t("opp_conf_mid") + " 50-70%" },
            { key: "low", label: t("opp_conf_low") + " <50%" },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setConfFilter(tab.key)}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${
                confFilter === tab.key
                  ? "bg-black text-white font-semibold"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 時效篩選 */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">{t("opp_filter_label")}：</span>
        <div className="flex items-center gap-1 bg-gray-50 rounded-2xl p-1">
          {([
            { key: "all", labelKey: "opp_filter_all" },
            { key: "fresh", labelKey: "opp_filter_fresh" },
            { key: "expired", labelKey: "opp_filter_expired" },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFreshnessFilter(tab.key)}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${
                freshnessFilter === tab.key
                  ? tab.key === "fresh"
                    ? "bg-green-50 text-green-700 border border-green-200 font-semibold"
                    : tab.key === "expired"
                    ? "bg-gray-100 text-gray-500 font-semibold"
                    : "bg-black text-white font-semibold"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t(tab.labelKey as Parameters<typeof t>[0])}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
