"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLang, type Lang } from "@/lib/lang";
import { useT } from "@/lib/i18n";
import { useToast } from "@/components/toast";

interface Stats {
  todaySignals: number;
  totalSignals: number;
  signalsBySource: Record<string, number>;
  opportunityStatusCounts: Record<string, number>;
}

export default function ControlPage() {
  const [, setLang] = useLang();
  const { t, lang } = useT();
  const toast = useToast();
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanCooldown, setScanCooldown] = useState(0);
  const scanTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [oppLoading, setOppLoading] = useState(false);
  const [oppResult, setOppResult] = useState<string | null>(null);
  const [oppCooldown, setOppCooldown] = useState(0);
  const oppTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // IX23: new signals delta animation
  const [newSignalsDelta, setNewSignalsDelta] = useState<number | null>(null);
  const deltaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  function loadStats() {
    setStatsLoading(true);
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {/* loading failed, UI shows error state */})
      .finally(() => setStatsLoading(false));
  }

  const startCooldown = useCallback((seconds: number, setter: React.Dispatch<React.SetStateAction<number>>, timerRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>) => {
    setter(seconds);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setter((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  function formatCooldown(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return lang === "zh" ? `${m} 分 ${s.toString().padStart(2, "0")} 秒` : `${m}m ${s.toString().padStart(2, "0")}s`;
  }

  async function handleScan() {
    setScanLoading(true);
    setScanResult(null);
    try {
      const res = await fetch("/api/scan", { method: "POST" });
      const data = await res.json();
      if (res.status === 429) {
        startCooldown(data.cooldown, setScanCooldown, scanTimerRef);
        setScanResult(null);
      } else {
        const newSignals = data.newSignals ?? 0;
        toast(`${t("ctrl_scan_done")} ${newSignals} ${t("ctrl_scan_done_unit")}`);
        setScanResult(t("ctrl_scan_started"));
        // IX23: show +N animation on signal count
        if (newSignals > 0) {
          if (deltaTimerRef.current) clearTimeout(deltaTimerRef.current);
          setNewSignalsDelta(newSignals);
          deltaTimerRef.current = setTimeout(() => setNewSignalsDelta(null), 2000);
        }
        let elapsed = 0;
        const statsRefreshId = setInterval(() => {
          elapsed += 10;
          loadStats();
          if (elapsed >= 60) clearInterval(statsRefreshId);
        }, 10000);
      }
    } catch (err) {
      toast(t("ctrl_scan_fail"), "error");
      setScanResult(`${t("common_error_prefix")}${(err as Error).message}`);
    } finally {
      setScanLoading(false);
    }
  }

  async function handleOpportunity() {
    setOppLoading(true);
    setOppResult(null);
    try {
      const res = await fetch("/api/opportunity", { method: "POST" });
      const data = await res.json();
      if (res.status === 429) {
        startCooldown(data.cooldown, setOppCooldown, oppTimerRef);
        setOppResult(null);
      } else {
        toast(t("ctrl_opp_done"));
        setOppResult(t("ctrl_opp_started"));
        let elapsed = 0;
        const oppRefreshId = setInterval(() => {
          elapsed += 10;
          loadStats();
          if (elapsed >= 60) clearInterval(oppRefreshId);
        }, 10000);
      }
    } catch (err) {
      toast(t("ctrl_opp_fail"), "error");
      setOppResult(`${t("common_error_prefix")}${(err as Error).message}`);
    } finally {
      setOppLoading(false);
    }
  }

  const STATUS_LABELS: Record<string, string> = {
    todo:   t("archive_status_todo"),
    bias:   t("archive_status_bias"),
    action: t("archive_status_action"),
    missed: t("archive_status_missed"),
    done:   t("archive_status_done"),
    cancel: t("archive_status_cancel"),
    cancelled: t("archive_status_cancel"),
  };

  const STATUS_COLORS: Record<string, string> = {
    todo: "bg-blue-500/10 text-blue-500 border border-blue-500/30",
    bias: "bg-orange-500/10 text-orange-500 border border-orange-500/30",
    action: "bg-green-500/10 text-green-500 border border-green-500/30",
    missed: "bg-gray-500/10 text-gray-400 border border-gray-500/30",
    done: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30",
    cancel: "bg-red-500/10 text-red-500 border border-red-500/30",
    cancelled: "bg-red-500/10 text-red-500 border border-red-500/30",
  };

  const SOURCE_LABELS: Record<string, string> = {
    blockbeats_telegram: "BlockBeats",
    kol_tweet: t("source_kol_tweet"),
    x_kol: t("source_kol_tweet"),
    hl_whale: t("source_hl_whale"),
    reddit: "Reddit",
    hacker_news: "Hacker News",
    rss: t("source_rss"),
    github_trending: "GitHub",
    coingecko_trending: "CoinGecko",
    aicoin_newsflash: t("source_aicoin"),
    messari: "Messari",
    leakmealpha: "LeakMeAlpha",
    bwe_telegram: "BWE Telegram",
    cointelegraph: "CoinTelegraph",
    decrypt: "Decrypt",
    theblock: "The Block",
  };

  return (
    <div className="flex flex-col h-full p-6 animate-page-enter" style={{ backgroundColor: "var(--bg)" }}>
      {/* Admin-only notice */}
      <div className="flex items-center gap-2 rounded-xl px-4 py-2.5 mb-4 text-sm" style={{ backgroundColor: "var(--bg-panel)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}>
        <span>🔒</span>
        <span>{lang === "zh" ? "此功能僅供管理員使用。系統會自動執行掃描，你無需手動操作。" : "This feature is for admins only. The system runs scans automatically — no manual action needed."}</span>
      </div>
      <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>{t("ctrl_title")}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Manual Scan */}
        <Card className="rounded-2xl p-5" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
          <h3 className="font-semibold mb-3" style={{ color: "var(--text-primary)" }}>{t("ctrl_scan_title")}</h3>
          <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
            {t("ctrl_scan_desc")}
          </p>
          <Button
            className="w-full rounded-xl" style={{ backgroundColor: "var(--signal)", color: "var(--bg)" }}
            onClick={handleScan}
            disabled={scanLoading || scanCooldown > 0}
          >
            {scanLoading ? t("ctrl_scan_running") : scanCooldown > 0 ? `${t("ctrl_scan_cooldown")} ${formatCooldown(scanCooldown)}` : t("ctrl_scan_btn")}
          </Button>
          <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>從 Reddit、HN、KOL 等來源抓取最新信號</p>
          {/* IX22: indeterminate progress bar when scanning */}
          {scanLoading && (
            <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border-subtle)" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: "40%",
                  background: "var(--signal)",
                  animation: "ix-scan-progress 1.4s ease-in-out infinite",
                }}
              />
            </div>
          )}
          {scanResult && (
            <pre className="mt-3 text-xs rounded-xl p-3 overflow-auto max-h-40" style={{ color: "var(--text-secondary)", backgroundColor: "var(--bg-panel)" }}>
              {scanResult}
            </pre>
          )}
        </Card>

        {/* Manual Opportunity */}
        <Card className="rounded-2xl p-5" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
          <h3 className="font-semibold mb-3" style={{ color: "var(--text-primary)" }}>{t("ctrl_opp_title")}</h3>
          <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
            {t("ctrl_opp_desc")}
          </p>
          <Button
            className="w-full rounded-xl" style={{ backgroundColor: "var(--signal)", color: "var(--bg)" }}
            onClick={handleOpportunity}
            disabled={oppLoading || oppCooldown > 0}
          >
            {oppLoading ? t("ctrl_opp_running") : oppCooldown > 0 ? `${t("ctrl_opp_cooldown")} ${formatCooldown(oppCooldown)}` : t("ctrl_opp_btn")}
          </Button>
          <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>AI 分析信號，生成個人化行動方案</p>
          {oppResult && (
            <pre className="mt-3 text-xs rounded-xl p-3 overflow-auto max-h-40" style={{ color: "var(--text-secondary)", backgroundColor: "var(--bg-panel)" }}>
              {oppResult}
            </pre>
          )}
        </Card>

        {/* Signal Stats */}
        <Card className="rounded-2xl p-5" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
          <h3 className="font-semibold mb-3" style={{ color: "var(--text-primary)" }}>{t("ctrl_stats_title")}</h3>
          {statsLoading ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("ctrl_loading")}</p>
          ) : stats ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{t("ctrl_today")}</span>
                <div className="flex items-center gap-2">
                  {newSignalsDelta !== null && (
                    <span
                      className="text-sm font-semibold text-green-500"
                      style={{ animation: "ix-delta-fade 2s ease-out forwards" }}
                    >
                      +{newSignalsDelta}
                    </span>
                  )}
                  <span className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                    {stats.todaySignals}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{t("ctrl_total")}</span>
                <span className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {stats.totalSignals}
                </span>
              </div>
              <Separator style={{ backgroundColor: "var(--border-subtle)" }} />
              <h4 className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{t("ctrl_by_source")}</h4>
              <div className="grid grid-cols-2 gap-2">
                {stats.signalsBySource &&
                  Object.entries(stats.signalsBySource).map(([source, count]) => (
                    <div
                      key={source}
                      className="flex justify-between items-center rounded-lg px-3 py-1.5" style={{ backgroundColor: "var(--bg-panel)" }}
                    >
                      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{SOURCE_LABELS[source] || source}</span>
                      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {count}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("ctrl_stats_error")}</p>
          )}
        </Card>

        {/* Opportunity Status */}
        <Card className="rounded-2xl p-5" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
          <h3 className="font-semibold mb-3" style={{ color: "var(--text-primary)" }}>{t("ctrl_opp_status")}<span className="text-xs font-normal ml-2" style={{ color: "var(--text-muted)" }}>（{lang === "zh" ? "累計" : "Total"}）</span></h3>
          {statsLoading ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("ctrl_loading")}</p>
          ) : stats?.opportunityStatusCounts ? (
            <div className="space-y-2">
              {Object.entries(stats.opportunityStatusCounts).map(
                ([status, count]) => (
                  <div
                    key={status}
                    className="flex justify-between items-center"
                  >
                    <Badge
                      className={`${STATUS_COLORS[status] || "bg-gray-500/10 text-gray-400 border border-gray-500/30"} text-xs`}
                    >
                      {STATUS_LABELS[status] || status}
                    </Badge>
                    <span className="text-lg font-semibold" style={{ color: "var(--text-secondary)" }}>
                      {count}
                    </span>
                  </div>
                )
              )}
              <Separator style={{ backgroundColor: "var(--border-subtle)" }} />
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{t("ctrl_subtotal")}</span>
                <span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                  {Object.values(stats.opportunityStatusCounts).reduce(
                    (a, b) => a + b,
                    0
                  )}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("ctrl_status_error")}</p>
          )}
        </Card>
      </div>
    </div>
  );
}
