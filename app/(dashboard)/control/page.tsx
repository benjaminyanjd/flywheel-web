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
        toast(`${t("ctrl_scan_done")} ${newSignals} ${t("ctrl_scan_done_unit")}`);
        setScanResult(t("ctrl_scan_started"));
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
    todo: "bg-blue-50 text-blue-600 border border-blue-200",
    bias: "bg-orange-50 text-orange-600 border border-orange-200",
    action: "bg-green-50 text-green-600 border border-green-200",
    missed: "bg-gray-100 text-gray-500 border border-gray-200",
    done: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    cancel: "bg-red-50 text-red-500 border border-red-200",
    cancelled: "bg-red-50 text-red-500 border border-red-200",
  };

  return (
    <div className="flex flex-col h-full bg-white p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{t("ctrl_title")}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Manual Scan */}
        <Card className="bg-white border border-gray-100 rounded-2xl p-5">
          <h3 className="text-gray-900 font-semibold mb-3">{t("ctrl_scan_title")}</h3>
          <p className="text-sm text-gray-500 mb-4">
            {t("ctrl_scan_desc")}
          </p>
          <Button
            className="bg-black hover:bg-gray-800 text-white w-full rounded-xl"
            onClick={handleScan}
            disabled={scanLoading || scanCooldown > 0}
          >
            {scanLoading ? t("ctrl_scan_running") : scanCooldown > 0 ? `${t("ctrl_scan_cooldown")} ${formatCooldown(scanCooldown)}` : t("ctrl_scan_btn")}
          </Button>
          {scanResult && (
            <pre className="mt-3 text-xs text-gray-500 bg-gray-50 rounded-xl p-3 overflow-auto max-h-40">
              {scanResult}
            </pre>
          )}
        </Card>

        {/* Manual Opportunity */}
        <Card className="bg-white border border-gray-100 rounded-2xl p-5">
          <h3 className="text-gray-900 font-semibold mb-3">{t("ctrl_opp_title")}</h3>
          <p className="text-sm text-gray-500 mb-4">
            {t("ctrl_opp_desc")}
          </p>
          <Button
            className="bg-black hover:bg-gray-800 text-white w-full rounded-xl"
            onClick={handleOpportunity}
            disabled={oppLoading || oppCooldown > 0}
          >
            {oppLoading ? t("ctrl_opp_running") : oppCooldown > 0 ? `${t("ctrl_opp_cooldown")} ${formatCooldown(oppCooldown)}` : t("ctrl_opp_btn")}
          </Button>
          {oppResult && (
            <pre className="mt-3 text-xs text-gray-500 bg-gray-50 rounded-xl p-3 overflow-auto max-h-40">
              {oppResult}
            </pre>
          )}
        </Card>

        {/* Signal Stats */}
        <Card className="bg-white border border-gray-100 rounded-2xl p-5">
          <h3 className="text-gray-900 font-semibold mb-3">{t("ctrl_stats_title")}</h3>
          {statsLoading ? (
            <p className="text-sm text-gray-400">{t("ctrl_loading")}</p>
          ) : stats ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{t("ctrl_today")}</span>
                <span className="text-2xl font-bold text-gray-900">
                  {stats.todaySignals}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{t("ctrl_total")}</span>
                <span className="text-2xl font-bold text-gray-900">
                  {stats.totalSignals}
                </span>
              </div>
              <Separator className="bg-gray-100" />
              <h4 className="text-sm font-medium text-gray-700">{t("ctrl_by_source")}</h4>
              <div className="grid grid-cols-2 gap-2">
                {stats.signalsBySource &&
                  Object.entries(stats.signalsBySource).map(([source, count]) => (
                    <div
                      key={source}
                      className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-1.5"
                    >
                      <span className="text-xs text-gray-500">{source}</span>
                      <span className="text-sm font-medium text-gray-700">
                        {count}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">{t("ctrl_stats_error")}</p>
          )}
        </Card>

        {/* Opportunity Status */}
        <Card className="bg-white border border-gray-100 rounded-2xl p-5">
          <h3 className="text-gray-900 font-semibold mb-3">{t("ctrl_opp_status")}</h3>
          {statsLoading ? (
            <p className="text-sm text-gray-400">{t("ctrl_loading")}</p>
          ) : stats?.opportunityStatusCounts ? (
            <div className="space-y-2">
              {Object.entries(stats.opportunityStatusCounts).map(
                ([status, count]) => (
                  <div
                    key={status}
                    className="flex justify-between items-center"
                  >
                    <Badge
                      className={`${STATUS_COLORS[status] || "bg-gray-100 text-gray-500"} text-xs`}
                    >
                      {STATUS_LABELS[status] || status}
                    </Badge>
                    <span className="text-lg font-semibold text-gray-700">
                      {count}
                    </span>
                  </div>
                )
              )}
              <Separator className="bg-gray-100" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{t("ctrl_subtotal")}</span>
                <span className="text-lg font-bold text-gray-900">
                  {Object.values(stats.opportunityStatusCounts).reduce(
                    (a, b) => a + b,
                    0
                  )}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">{t("ctrl_status_error")}</p>
          )}
        </Card>
      </div>

      {/* Language Setting — bottom */}
      <Card className="bg-white border border-gray-100 rounded-2xl p-5 mt-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-gray-900 font-semibold">{t("ctrl_lang_title")}</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {t("ctrl_lang_current")}<span className="text-gray-700 font-medium">{lang === "zh" ? t("ctrl_lang_desc_zh") : t("ctrl_lang_desc_en")}</span>
            </p>
          </div>
          <div className="flex gap-2">
            {(["zh", "en"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                  lang === l
                    ? "bg-black border-black text-white"
                    : "bg-white border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-400"
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
