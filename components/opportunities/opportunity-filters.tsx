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
  lang: string;
  t: (key: TKey) => string;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function OpportunityFilters({
  dateFilter, setDateFilter, confFilter, setConfFilter,
  freshnessFilter, setFreshnessFilter,
  count, latestDate, lang, t, onRefresh, refreshing,
}: OpportunityFiltersProps) {
  const pillBase = "relative z-10 text-xs px-3 py-1 rounded-full transition-all duration-200";
  const pillActive = "font-semibold shadow-sm";
  const pillInactive = "hover:text-[var(--text-primary)]";

  return (
    <div className="flex flex-col gap-2 mb-4">
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{t("opp_title")}</h1>
        {count > 0 && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full border"
            style={{ backgroundColor: "var(--bg-panel)", color: "var(--text-secondary)", borderColor: "var(--border)" }}>
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
          const hoursAgo = Math.floor(diffMs / (1000 * 60 * 60));
          const relLabel = hoursAgo < 1 ? (lang === "zh" ? "剛剛" : "just now") : lang === "zh" ? `${hoursAgo} 小時前` : `${hoursAgo}h ago`;
          return (
            <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
              {t("opp_last_updated")}{label}（{relLabel}）
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  disabled={refreshing}
                  title={lang === "zh" ? "刷新" : "Refresh"}
                  className="ml-0.5 p-0.5 rounded-full transition-all hover:bg-[var(--border-subtle)] disabled:opacity-50"
                  style={{ color: "var(--text-muted)" }}
                >
                  {refreshing ? (
                    <span className="w-3.5 h-3.5 border-2 border-[var(--border)] border-t-[var(--text-secondary)] rounded-full animate-spin inline-block" />
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                    </svg>
                  )}
                </button>
              )}
            </span>
          );
        })()}
        <div className="flex gap-1 rounded-2xl p-1 relative" style={{ backgroundColor: "var(--bg-panel)" }}>
          <button
            onClick={() => setDateFilter("today")}
            className={`${pillBase} ${dateFilter === "today" ? pillActive : pillInactive}`}
            style={dateFilter === "today"
              ? { backgroundColor: "var(--signal)", color: "var(--bg)" }
              : { color: "var(--text-muted)" }
            }
          >{t("opp_date_today")}</button>
          <button
            onClick={() => setDateFilter("all")}
            className={`${pillBase} ${dateFilter === "all" ? pillActive : pillInactive}`}
            style={dateFilter === "all"
              ? { backgroundColor: "var(--signal)", color: "var(--bg)" }
              : { color: "var(--text-muted)" }
            }
          >{t("opp_date_all")}</button>
        </div>
        <div className="flex items-center gap-1 ml-2 rounded-2xl p-1 overflow-x-auto flex-nowrap" style={{ backgroundColor: "var(--bg-panel)" }}>
          {([
            { key: "all", label: t("common_all") },
            { key: "high", label: t("opp_conf_high") + " ≥70%" },
            { key: "mid", label: t("opp_conf_mid") + " 50-70%" },
            { key: "low", label: t("opp_conf_low") + " <50%" },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setConfFilter(tab.key)}
              className={`${pillBase} ${confFilter === tab.key ? pillActive : pillInactive}`}
              style={confFilter === tab.key
                ? { backgroundColor: "var(--signal)", color: "var(--bg)" }
                : { color: "var(--text-muted)" }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 時效篩選 */}
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>{t("opp_filter_label")}：</span>
        <div className="flex items-center gap-1 rounded-2xl p-1" style={{ backgroundColor: "var(--bg-panel)" }}>
          {([
            { key: "all", labelKey: "opp_filter_all" },
            { key: "fresh", labelKey: "opp_filter_fresh" },
            { key: "expired", labelKey: "opp_filter_expired" },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFreshnessFilter(tab.key)}
              className={`${pillBase} ${freshnessFilter === tab.key ? pillActive : pillInactive}`}
              style={freshnessFilter === tab.key
                ? tab.key === "fresh"
                  ? { backgroundColor: "color-mix(in srgb, var(--signal) 15%, transparent)", color: "var(--signal)", border: "1px solid color-mix(in srgb, var(--signal) 30%, transparent)" }
                  : tab.key === "expired"
                  ? { backgroundColor: "var(--border-subtle)", color: "var(--text-secondary)" }
                  : { backgroundColor: "var(--signal)", color: "var(--bg)" }
                : { color: "var(--text-muted)" }
              }
            >
              {t(tab.labelKey as Parameters<typeof t>[0])}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
