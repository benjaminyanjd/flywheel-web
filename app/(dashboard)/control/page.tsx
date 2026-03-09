"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Stats {
  todaySignals: number;
  totalSignals: number;
  signalsBySource: Record<string, number>;
  opportunityStatusCounts: Record<string, number>;
}

export default function ControlPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [oppLoading, setOppLoading] = useState(false);
  const [oppResult, setOppResult] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  function loadStats() {
    setStatsLoading(true);
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(console.error)
      .finally(() => setStatsLoading(false));
  }

  async function handleScan() {
    setScanLoading(true);
    setScanResult(null);
    try {
      const res = await fetch("/api/scan", { method: "POST" });
      const data = await res.json();
      setScanResult(JSON.stringify(data, null, 2));
      loadStats();
    } catch (err) {
      setScanResult(`错误: ${(err as Error).message}`);
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
      setOppResult(JSON.stringify(data, null, 2));
      loadStats();
    } catch (err) {
      setOppResult(`错误: ${(err as Error).message}`);
    } finally {
      setOppLoading(false);
    }
  }

  const STATUS_LABELS: Record<string, string> = {
    todo: "待办",
    bias: "偏见",
    action: "行动",
    missed: "遗漏",
    done: "完成",
    cancel: "取消",
  };

  const STATUS_COLORS: Record<string, string> = {
    todo: "bg-blue-600 text-blue-100",
    bias: "bg-orange-600 text-orange-100",
    action: "bg-green-600 text-green-100",
    missed: "bg-gray-600 text-gray-100",
    done: "bg-emerald-600 text-emerald-100",
    cancel: "bg-red-600 text-red-100",
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 p-6">
      <h1 className="text-xl font-bold text-slate-100 mb-4">控制台</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Manual Scan */}
        <Card className="bg-slate-800 border-slate-700 p-5">
          <h3 className="text-slate-100 font-semibold mb-3">手动扫描</h3>
          <p className="text-sm text-slate-400 mb-4">
            手动触发信号源扫描，获取最新信号。
          </p>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white w-full"
            onClick={handleScan}
            disabled={scanLoading}
          >
            {scanLoading ? "扫描中..." : "开始扫描"}
          </Button>
          {scanResult && (
            <pre className="mt-3 text-xs text-slate-400 bg-slate-900 rounded p-3 overflow-auto max-h-40">
              {scanResult}
            </pre>
          )}
        </Card>

        {/* Manual Opportunity */}
        <Card className="bg-slate-800 border-slate-700 p-5">
          <h3 className="text-slate-100 font-semibold mb-3">生成机会</h3>
          <p className="text-sm text-slate-400 mb-4">
            手动触发机会分析，从最新信号中提取机会。
          </p>
          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white w-full"
            onClick={handleOpportunity}
            disabled={oppLoading}
          >
            {oppLoading ? "分析中..." : "生成机会"}
          </Button>
          {oppResult && (
            <pre className="mt-3 text-xs text-slate-400 bg-slate-900 rounded p-3 overflow-auto max-h-40">
              {oppResult}
            </pre>
          )}
        </Card>

        {/* Signal Stats */}
        <Card className="bg-slate-800 border-slate-700 p-5">
          <h3 className="text-slate-100 font-semibold mb-3">信号统计</h3>
          {statsLoading ? (
            <p className="text-sm text-slate-400">加载中...</p>
          ) : stats ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">今日信号</span>
                <span className="text-2xl font-bold text-slate-100">
                  {stats.todaySignals}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">总信号数</span>
                <span className="text-2xl font-bold text-slate-100">
                  {stats.totalSignals}
                </span>
              </div>
              <Separator className="bg-slate-700" />
              <h4 className="text-sm font-medium text-slate-300">按来源</h4>
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
            <p className="text-sm text-slate-500">无法加载统计数据</p>
          )}
        </Card>

        {/* Opportunity Status */}
        <Card className="bg-slate-800 border-slate-700 p-5">
          <h3 className="text-slate-100 font-semibold mb-3">机会状态</h3>
          {statsLoading ? (
            <p className="text-sm text-slate-400">加载中...</p>
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
                <span className="text-sm text-slate-400">总计</span>
                <span className="text-lg font-bold text-slate-100">
                  {Object.values(stats.opportunityStatusCounts).reduce(
                    (a, b) => a + b,
                    0
                  )}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">无法加载状态数据</p>
          )}
        </Card>
      </div>
    </div>
  );
}
