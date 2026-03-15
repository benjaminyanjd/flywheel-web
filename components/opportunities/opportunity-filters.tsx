"use client";

import React from "react";
import type { TKey } from "@/lib/i18n";

interface OpportunityFiltersProps {
  dateFilter: "today" | "all";
  setDateFilter: (f: "today" | "all") => void;
  confFilter: "all" | "high" | "mid" | "low";
  setConfFilter: (f: "all" | "high" | "mid" | "low") => void;
  count: number;
  latestDate: string | undefined;
  t: (key: TKey) => string;
}

export function OpportunityFilters({
  dateFilter, setDateFilter, confFilter, setConfFilter, count, latestDate, t,
}: OpportunityFiltersProps) {
  return (
    <div className="flex items-center gap-3 mb-4 flex-wrap">
      <h1 className="text-xl font-bold text-slate-100">{t("opp_title")}</h1>
      {count > 0 && (
        <span className="bg-purple-600/20 text-purple-400 border border-purple-600/40 text-xs font-bold px-2 py-0.5 rounded-full">
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
        return <span className="text-xs text-slate-500">{t("opp_last_updated")}{label}</span>;
      })()}
      <div className="flex gap-1 border border-slate-700 rounded-lg p-1">
        <button onClick={() => setDateFilter("today")} className={dateFilter === "today" ? "bg-slate-600 text-slate-100 text-xs px-3 py-1 rounded" : "text-slate-400 text-xs px-3 py-1"}>{t("opp_date_today")}</button>
        <button onClick={() => setDateFilter("all")} className={dateFilter === "all" ? "bg-slate-600 text-slate-100 text-xs px-3 py-1 rounded" : "text-slate-400 text-xs px-3 py-1"}>{t("opp_date_all")}</button>
      </div>
      <div className="flex items-center gap-1 ml-2 bg-slate-800 border border-slate-700 rounded-lg p-1 overflow-x-auto flex-nowrap">
        {([
          { key: "all", label: t("common_all") },
          { key: "high", label: "🟢 " + t("opp_conf_high") + " ≥70%" },
          { key: "mid", label: "🟡 " + t("opp_conf_mid") + " 50-70%" },
          { key: "low", label: "🔴 " + t("opp_conf_low") + " <50%" },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setConfFilter(tab.key)}
            className={`text-xs px-3 py-1 rounded transition-colors ${
              confFilter === tab.key
                ? "bg-slate-600 text-slate-100 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
