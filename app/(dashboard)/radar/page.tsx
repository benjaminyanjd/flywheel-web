"use client";

import { useEffect, useRef, useState, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useT } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FlywheelLogo } from "@/components/flywheel-logo";

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

function relativeTime(dateStr: string, lang: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (lang === "zh") {
    if (mins < 1) return "刚刚";
    if (mins < 60) return `${mins}分钟前`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}小时前`;
    const days = Math.floor(hours / 24);
    return `${days}天前`;
  } else {
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }
}

function heatEmoji(score: number): string {
  if (score >= 5) return "🔥";
  if (score >= 3) return "⚡";
  return "💤";
}

function sourceBadgeStyle(source: string): { cls: string; label: string } {
  const map: Record<string, { cls: string; label: string }> = {
    reddit:          { cls: "bg-orange-500/15 text-orange-400 border border-orange-500/30", label: "R Reddit" },
    hacker_news:     { cls: "bg-red-500/15 text-red-400 border border-red-500/30",          label: "Y HN" },
    rss:             { cls: "bg-blue-500/15 text-blue-400 border border-blue-500/30",        label: "◉ RSS" },
    kol_tweet:       { cls: "bg-slate-400/15 text-slate-300 border border-slate-400/30",     label: "✕ KOL" },
    github_trending: { cls: "bg-purple-500/15 text-purple-400 border border-purple-500/30", label: "⬡ GitHub" },
  }
  return map[source] || { cls: "bg-slate-600/20 text-slate-400 border border-slate-600/30", label: source }
}

function heatScoreBg(score: number): string {
  if (score >= 5) return "bg-green-900/50 text-green-300";
  if (score >= 3) return "bg-yellow-900/50 text-yellow-300";
  return "bg-slate-700 text-slate-400";
}

const CATEGORY_LABELS: Record<string, { zh: string; en: string }> = {
  ai_tech:         { zh: "AI 科技",  en: "AI Tech" },
  crypto_policy:   { zh: "加密政策", en: "Crypto" },
  new_tools:       { zh: "新工具",   en: "New Tools" },
  overseas_trends: { zh: "海外趋势", en: "Overseas" },
  x_kol:           { zh: "KOL",      en: "KOL" },
};

function RadarContent() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") ?? "all";
  const [signals, setSignals] = useState<Signal[]>([]);
  const [newIds, setNewIds] = useState<Set<number>>(new Set());
  const [heatFilter, setHeatFilter] = useState<"all" | "high" | "mid" | "low">("all");
  const { t, lang } = useT();
  const [translations, setTranslations] = useState<Record<number, { title: string; description: string }>>({});
  const [translating, setTranslating] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const scrollKey = "scroll_radar";

  // Load from localStorage cache on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem("flywheel-tr-cache");
      if (cached) setTranslations(JSON.parse(cached));
    } catch {}
  }, []);

  // lang is managed by useT() hook above

  const translateSignals = useCallback(async (toTranslate: Signal[]) => {
    if (!toTranslate.length) return;
    setTranslating(true);
    try {
      // Translate titles + descriptions in a single batched request
      const BATCH = 20;
      const allTranslated: Record<number, { title: string; description: string }> = {};
      for (let i = 0; i < toTranslate.length; i += BATCH) {
        const batch = toTranslate.slice(i, i + BATCH);
        const titles = batch.map((s) => s.title);
        const descriptions = batch.map((s) => s.description || "");
        // Combine titles and descriptions into one array to save API calls
        const allTexts = [...titles, ...descriptions];
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texts: allTexts }),
        }).then((r) => r.json());
        batch.forEach((s, j) => {
          allTranslated[s.id] = {
            title: res.translations?.[j] || s.title,
            description: res.translations?.[j + batch.length] || s.description,
          };
        });
        // Update state progressively so user sees results sooner
        setTranslations((prev) => {
          const next = { ...prev, ...allTranslated };
          try { localStorage.setItem("flywheel-tr-cache", JSON.stringify(next)); } catch {}
          return next;
        });
      }
    } catch (e) {
      console.error("translateSignals error:", e);
    } finally {
      setTranslating(false);
    }
  }, []);

  // Restore scroll position on mount
  useEffect(() => {
    const saved = sessionStorage.getItem(scrollKey)
    if (saved) {
      setTimeout(() => window.scrollTo({ top: parseInt(saved), behavior: "instant" }), 100)
      sessionStorage.removeItem(scrollKey)
    }
  }, [])

  // Save scroll position on scroll
  useEffect(() => {
    const handleScroll = () => sessionStorage.setItem(scrollKey, String(window.scrollY))
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    // Load global recent signals (all categories)
    fetch("/api/signals?limit=100")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setSignals(data);
        else if (data.signals) setSignals(data.signals);
      })
      .catch(console.error);
    // Load bookmarks
    fetch("/api/signals/bookmarks").then(r => r.json()).then((ids: number[]) => setBookmarks(new Set(ids))).catch(() => {});
  }, []);

  // When switching to a specific category, also fetch that category's latest signals
  useEffect(() => {
    if (activeCategory === "all") return;
    fetch(`/api/signals?limit=50&category=${activeCategory}`)
      .then((res) => res.json())
      .then((data) => {
        const catSignals: Signal[] = Array.isArray(data) ? data : (data.signals ?? []);
        setSignals((prev) => {
          const existingIds = new Set(prev.map((s) => s.id));
          const newOnes = catSignals.filter((s) => !existingIds.has(s.id));
          return newOnes.length > 0 ? [...newOnes, ...prev] : prev;
        });
      })
      .catch(console.error);
  }, [activeCategory]);

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

  // Auto-translate when lang=zh and there are untranslated visible signals
  useEffect(() => {
    if (lang !== "zh" || !signals.length) return;
    const toTranslate = signals.filter((s) => !translations[s.id]);
    if (toTranslate.length > 0) translateSignals(toTranslate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, signals]);

  const filtered = signals.filter((s) => {
    // Filter out signals with null/empty title
    if (!s.title || s.title === "null") return false;
    if (activeCategory !== "all" && s.category !== activeCategory) return false;
    if (heatFilter === "high") return s.heat_score >= 5;
    if (heatFilter === "mid") return s.heat_score >= 3 && s.heat_score < 5;
    if (heatFilter === "low") return s.heat_score < 3;
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-slate-900 p-6">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h1 className="text-xl font-bold text-slate-100">{t("radar_title")}</h1>
        <span className="bg-emerald-600/20 text-emerald-400 border border-emerald-600/40 text-xs font-bold px-2 py-0.5 rounded-full">
          {filtered.length}
        </span>
        {activeCategory !== "all" && CATEGORY_LABELS[activeCategory] && (
          <span className="text-xs text-slate-500 border border-slate-700 px-2 py-0.5 rounded">
            {lang === "zh" ? CATEGORY_LABELS[activeCategory].zh : CATEGORY_LABELS[activeCategory].en}
          </span>
        )}
        {/* Heat score filter tabs */}
        <div className="flex items-center gap-1 ml-2 bg-slate-800 border border-slate-700 rounded-lg p-1 overflow-x-auto">
          {([
            { key: "all", label: lang === "zh" ? "全部" : "All" },
            { key: "high", label: "🔥 ≥5" },
            { key: "mid",  label: "⚡ 3-5" },
            { key: "low",  label: "💤 <3" },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setHeatFilter(tab.key)}
              className={`text-xs px-3 py-1 rounded transition-colors ${
                heatFilter === tab.key
                  ? "bg-slate-600 text-slate-100 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {translating && (
          <span className="text-xs text-slate-500 ml-auto flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />{t("radar_translating")}
          </span>
        )}
      </div>

      {/* Today's summary */}
      {(() => {
        const today = new Date().toLocaleDateString("zh-CN");
        const todayCount = signals.filter(s => new Date(s.created_at).toLocaleDateString("zh-CN") === today).length;
        const hotCount = signals.filter(s => s.heat_score >= 3).length;
        if (todayCount === 0 && hotCount === 0) return null;
        return (
          <div className="flex items-center gap-3 mb-3 text-sm text-slate-400">
            {todayCount > 0 && <span>📥 今日新增 <span className="text-slate-200 font-medium">{todayCount}</span> 條</span>}
            {hotCount > 0 && (
              <button
                onClick={() => {
                  setHeatFilter("high");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="text-orange-400 hover:text-orange-300 transition-colors"
              >
                🔥 <span className="font-medium">{hotCount}</span> 條值得關注 →
              </button>
            )}
          </div>
        );
      })()}

      <ScrollArea className="flex-1">
        <div className="space-y-4 pr-4">
          {filtered.map((signal) => (
            <Card
              key={signal.id}
              className={`bg-slate-800 border-slate-700 p-5 transition-all duration-500 ${
                newIds.has(signal.id)
                  ? "ring-2 ring-blue-500/50 animate-in fade-in slide-in-from-top-2"
                  : ""
              } ${bookmarks.has(signal.id) ? "border-l-2 border-l-amber-400" : "border-l-2 border-l-transparent"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg">{heatEmoji(signal.heat_score)}</span>
                    {(() => {
                      const { cls, label } = sourceBadgeStyle(signal.source)
                      return (
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium shrink-0 ${cls}`}>
                          {label}
                        </span>
                      )
                    })()}
                    <a
                      href={signal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-100 font-medium hover:text-blue-400 truncate"
                    >
                      {lang === "zh" && translations[signal.id]
                        ? translations[signal.id].title
                        : signal.title}
                    </a>
                  </div>
                  <p className="text-slate-400 text-sm line-clamp-2 mt-1.5">
                    {lang === "zh" && translations[signal.id]
                      ? translations[signal.id].description
                      : signal.description}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="flex items-center gap-1">
                    <Badge className={`${heatScoreBg(signal.heat_score)} text-xs`}>
                      <span
                        title={`熱度 ${signal.heat_score.toFixed(1)} / 5.0（基於傳播速度 + 關鍵詞密度，≥3 值得關注）`}
                        className="cursor-help"
                      >
                        {signal.heat_score.toFixed(1)}
                      </span>
                    </Badge>
                    {signal.url && (
                      <a
                        href={signal.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="text-slate-500 hover:text-slate-300 text-xs ml-1 shrink-0"
                        title="查看原文"
                      >↗</a>
                    )}
                    <button
                      onClick={async (e) => {
                        e.stopPropagation()
                        const isBookmarked = bookmarks.has(signal.id)
                        if (isBookmarked) {
                          await fetch(`/api/signals/${signal.id}/bookmark`, { method: "DELETE" })
                          setBookmarks(prev => { const s = new Set(prev); s.delete(signal.id); return s })
                        } else {
                          await fetch(`/api/signals/${signal.id}/bookmark`, { method: "POST" })
                          setBookmarks(prev => new Set(prev).add(signal.id))
                        }
                      }}
                      className={`text-base transition-colors ml-1 shrink-0 ${bookmarks.has(signal.id) ? "text-amber-400" : "text-slate-600 hover:text-slate-400"}`}
                      title={bookmarks.has(signal.id) ? "取消收藏" : "收藏"}
                    >
                      🔖
                    </button>
                  </div>
                  <span className="text-xs text-slate-500">
                    {relativeTime(signal.created_at, lang)}
                  </span>
                </div>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <FlywheelLogo size={48} className="text-amber-400/40 animate-[spin_8s_linear_infinite] mb-4" />
              <p className="text-lg font-medium text-slate-400">信號採集中</p>
              <p className="text-sm mt-1">每 30 分鐘掃描一次，早 8 點見</p>
              <button
                onClick={() => { fetch("/api/scan", { method: "POST" }); }}
                className="text-xs text-amber-400/60 hover:text-amber-400 underline mt-4"
              >
                手動觸發掃描
              </button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export default function RadarPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full bg-slate-900"><span className="text-slate-400">...</span></div>}>
      <RadarContent />
    </Suspense>
  );
}
