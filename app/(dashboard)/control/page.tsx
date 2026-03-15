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
        toast(`✅ ${t("ctrl_scan_done")} ${newSignals} ${t("ctrl_scan_done_unit")}`);
        setScanResult(t("ctrl_scan_started"));
        let elapsed = 0;
        const statsRefreshId = setInterval(() => {
          elapsed += 10;
          loadStats();
          if (elapsed >= 60) clearInterval(statsRefreshId);
        }, 10000);
      }
    } catch (err) {
      toast("❌ " + t("ctrl_scan_fail"), "error");
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
        toast("✅ " + t("ctrl_opp_done"));
        setOppResult(t("ctrl_opp_started"));
        let elapsed = 0;
        const oppRefreshId = setInterval(() => {
          elapsed += 10;
          loadStats();
          if (elapsed >= 60) clearInterval(oppRefreshId);
        }, 10000);
      }
    } catch (err) {
      toast("❌ " + t("ctrl_opp_fail"), "error");
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
    todo: "bg-blue-600 text-blue-100",
    bias: "bg-orange-600 text-orange-100",
    action: "bg-green-600 text-green-100",
    missed: "bg-gray-600 text-gray-100",
    done: "bg-emerald-600 text-emerald-100",
    cancel: "bg-red-600 text-red-100",
    cancelled: "bg-red-600 text-red-100",
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 p-6">
      <h1 className="text-xl font-bold text-slate-100 mb-4">{t("ctrl_title")}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Manual Scan */}
        <Card className="bg-slate-800 border-slate-700 p-5">
          <h3 className="text-slate-100 font-semibold mb-3">{t("ctrl_scan_title")}</h3>
          <p className="text-sm text-slate-400 mb-4">
            {t("ctrl_scan_desc")}
          </p>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white w-full"
            onClick={handleScan}
            disabled={scanLoading || scanCooldown > 0}
          >
            {scanLoading ? t("ctrl_scan_running") : scanCooldown > 0 ? `${t("ctrl_scan_cooldown")} ${formatCooldown(scanCooldown)}` : t("ctrl_scan_btn")}
          </Button>
          {scanResult && (
            <pre className="mt-3 text-xs text-slate-400 bg-slate-900 rounded p-3 overflow-auto max-h-40">
              {scanResult}
            </pre>
          )}
        </Card>

        {/* Manual Opportunity */}
        <Card className="bg-slate-800 border-slate-700 p-5">
          <h3 className="text-slate-100 font-semibold mb-3">{t("ctrl_opp_title")}</h3>
          <p className="text-sm text-slate-400 mb-4">
            {t("ctrl_opp_desc")}
          </p>
          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white w-full"
            onClick={handleOpportunity}
            disabled={oppLoading || oppCooldown > 0}
          >
            {oppLoading ? t("ctrl_opp_running") : oppCooldown > 0 ? `${t("ctrl_opp_cooldown")} ${formatCooldown(oppCooldown)}` : t("ctrl_opp_btn")}
          </Button>
          {oppResult && (
            <pre className="mt-3 text-xs text-slate-400 bg-slate-900 rounded p-3 overflow-auto max-h-40">
              {oppResult}
            </pre>
          )}
        </Card>

        {/* Signal Stats */}
        <Card className="bg-slate-800 border-slate-700 p-5">
          <h3 className="text-slate-100 font-semibold mb-3">{t("ctrl_stats_title")}</h3>
          {statsLoading ? (
            <p className="text-sm text-slate-400">{t("ctrl_loading")}</p>
          ) : stats ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">{t("ctrl_today")}</span>
                <span className="text-2xl font-bold text-slate-100">
                  {stats.todaySignals}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">{t("ctrl_total")}</span>
                <span className="text-2xl font-bold text-slate-100">
                  {stats.totalSignals}
                </span>
              </div>
              <Separator className="bg-slate-700" />
              <h4 className="text-sm font-medium text-slate-300">{t("ctrl_by_source")}</h4>
              <div className="grid grid-cols-2 gap-2">
                {stats.signalsBySource &&
                  Object.entries(stats.signalsBySource).map(([source, count]) => (
                    <div
                      key={source}
                      className="flex justify-between items-center bg-slate-900 rounded px-3 py-1.5"
                    >
                      <span className="text-xs text-slate-400">{source}</span>
                      <span className="text-sm font-medium text-slate-200">
                        {count}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">{t("ctrl_stats_error")}</p>
          )}
        </Card>

        {/* Opportunity Status */}
        <Card className="bg-slate-800 border-slate-700 p-5">
          <h3 className="text-slate-100 font-semibold mb-3">{t("ctrl_opp_status")}</h3>
          {statsLoading ? (
            <p className="text-sm text-slate-400">{t("ctrl_loading")}</p>
          ) : stats?.opportunityStatusCounts ? (
            <div className="space-y-2">
              {Object.entries(stats.opportunityStatusCounts).map(
                ([status, count]) => (
                  <div
                    key={status}
                    className="flex justify-between items-center"
                  >
                    <Badge
                      className={`${STATUS_COLORS[status] || "bg-slate-600 text-slate-100"} text-xs`}
                    >
                      {STATUS_LABELS[status] || status}
                    </Badge>
                    <span className="text-lg font-semibold text-slate-200">
                      {count}
                    </span>
                  </div>
                )
              )}
              <Separator className="bg-slate-700" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">{t("ctrl_subtotal")}</span>
                <span className="text-lg font-bold text-slate-100">
                  {Object.values(stats.opportunityStatusCounts).reduce(
                    (a, b) => a + b,
                    0
                  )}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">{t("ctrl_status_error")}</p>
          )}
        </Card>
      </div>

      {/* Language Setting — bottom */}
      <Card className="bg-slate-800 border-slate-700 p-5 mt-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-slate-100 font-semibold">{t("ctrl_lang_title")}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {t("ctrl_lang_current")}<span className="text-slate-300 font-medium">{lang === "zh" ? t("ctrl_lang_desc_zh") : t("ctrl_lang_desc_en")}</span>
            </p>
          </div>
          <div className="flex gap-2">
            {(["zh", "en"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                  lang === l
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-slate-700 border-slate-600 text-slate-400 hover:text-slate-200"
                }`}
              >
                {l === "zh" ? "🇹🇼 繁體中文" : "🇺🇸 English"}
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
