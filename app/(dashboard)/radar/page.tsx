"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Signal {
  id: number;
  source: string;
  title: string;
  url: string;
  description: string;
  category: string;
  heat_score: number;
  monetize_score: number;
  window: string;
  created_at: string;
}

type FilterTab = "All" | "AI Tech" | "Crypto" | "New Tools" | "Overseas" | "KOL";

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "刚刚";
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  return `${days}天前`;
}

function heatEmoji(score: number): string {
  if (score >= 5) return "🔥";
  if (score >= 3) return "⚡";
  return "💤";
}

function sourceBadgeColor(source: string): string {
  const colors: Record<string, string> = {
    HackerNews: "bg-orange-600 text-orange-100",
    ProductHunt: "bg-red-600 text-red-100",
    GitHub: "bg-purple-600 text-purple-100",
    Reddit: "bg-blue-600 text-blue-100",
    RSS: "bg-gray-600 text-gray-100",
    KOL: "bg-yellow-600 text-yellow-100",
  };
  return colors[source] || "bg-slate-600 text-slate-100";
}

function heatScoreBg(score: number): string {
  if (score >= 5) return "bg-green-900/50 text-green-300";
  if (score >= 3) return "bg-yellow-900/50 text-yellow-300";
  return "bg-slate-700 text-slate-400";
}

function matchesFilter(signal: Signal, tab: FilterTab): boolean {
  if (tab === "All") return true;
  if (tab === "AI Tech") return true;
  if (tab === "Crypto") {
    const text = `${signal.title} ${signal.description} ${signal.category}`.toLowerCase();
    return /crypto|web3|btc|eth|bitcoin|ethereum|blockchain/.test(text);
  }
  if (tab === "New Tools") return ["ProductHunt", "GitHub"].includes(signal.source);
  if (tab === "Overseas") return ["HackerNews", "Reddit", "RSS"].includes(signal.source);
  if (tab === "KOL") return signal.source === "KOL";
  return true;
}

export default function RadarPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const [newIds, setNewIds] = useState<Set<number>>(new Set());
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    fetch("/api/signals?limit=50")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setSignals(data);
        else if (data.signals) setSignals(data.signals);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const es = new EventSource("/api/signals/stream");
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const newSignal: Signal = JSON.parse(event.data);
        setSignals((prev) => {
          if (prev.some((s) => s.id === newSignal.id)) return prev;
          return [newSignal, ...prev];
        });
        setNewIds((prev) => new Set(prev).add(newSignal.id));
        setTimeout(() => {
          setNewIds((prev) => {
            const next = new Set(prev);
            next.delete(newSignal.id);
            return next;
          });
        }, 2000);
      } catch {
        // ignore parse errors
      }
    };

    return () => {
      es.close();
    };
  }, []);

  const filtered = signals.filter((s) => matchesFilter(s, activeTab));

  return (
    <div className="flex flex-col h-full bg-slate-900 p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-slate-100">信号雷达</h1>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as FilterTab)}
        className="mb-4"
      >
        <TabsList className="bg-slate-800 border border-slate-700">
          <TabsTrigger value="All">All</TabsTrigger>
          <TabsTrigger value="AI Tech">AI Tech</TabsTrigger>
          <TabsTrigger value="Crypto">Crypto</TabsTrigger>
          <TabsTrigger value="New Tools">New Tools</TabsTrigger>
          <TabsTrigger value="Overseas">Overseas</TabsTrigger>
          <TabsTrigger value="KOL">KOL</TabsTrigger>
        </TabsList>
      </Tabs>

      <ScrollArea className="flex-1">
        <div className="space-y-4 pr-4">
          {filtered.map((signal) => (
            <Card
              key={signal.id}
              className={`bg-slate-800 border-slate-700 p-5 transition-all duration-500 ${
                newIds.has(signal.id)
                  ? "ring-2 ring-blue-500/50 animate-in fade-in slide-in-from-top-2"
                  : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg">{heatEmoji(signal.heat_score)}</span>
                    <Badge className={`${sourceBadgeColor(signal.source)} text-xs shrink-0`}>
                      {signal.source}
                    </Badge>
                    <a
                      href={signal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-100 font-medium hover:text-blue-400 truncate"
                    >
                      {signal.title}
                    </a>
                  </div>
                  <p className="text-slate-400 text-sm line-clamp-2 mt-1.5">
                    {signal.description}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <Badge className={`${heatScoreBg(signal.heat_score)} text-xs`}>
                    {signal.heat_score}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {relativeTime(signal.created_at)}
                  </span>
                </div>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="text-center text-slate-500 py-12">暂无信号</div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
