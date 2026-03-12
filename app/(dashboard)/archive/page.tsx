"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useT } from "@/lib/i18n";
import { Separator } from "@/components/ui/separator";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ArchiveItem {
  id: number;
  opp_rank: number;
  opp_title: string;
  opp_window: string;
  opp_embed: string;
  action: string;
  created_at: string;
  advisor_notes?: string | null;
}

interface EmbedData {
  why_now?: string;
  profit_logic?: string;
  actions?: string[];
  risks?: string[];
  confidence?: number;
}

type StatusFilter = "all" | "todo" | "bias" | "action" | "missed" | "done" | "cancel";

const STATUS_STYLES: Record<string, { pill: string; accent: string }> = {
  todo:   { pill: "bg-blue-600/20 text-blue-300 border border-blue-600/40",   accent: "bg-blue-500" },
  bias:   { pill: "bg-orange-600/20 text-orange-300 border border-orange-600/40", accent: "bg-orange-500" },
  action: { pill: "bg-green-600/20 text-green-300 border border-green-600/40",  accent: "bg-green-500" },
  missed: { pill: "bg-slate-600/30 text-slate-400 border border-slate-600/40",  accent: "bg-slate-500" },
  done:   { pill: "bg-emerald-600/20 text-emerald-300 border border-emerald-600/40", accent: "bg-emerald-500" },
  cancel: { pill: "bg-red-600/20 text-red-400 border border-red-600/40",       accent: "bg-red-500" },
};

const WINDOW_ICON: Record<string, string> = {
  morning: "🌅",
  afternoon: "☀️",
  evening: "🌆",
  night: "🌙",
};

// TABS generated inside component for i18n support

function parseEmbed(raw: string): EmbedData | null {
  try {
    const d = typeof raw === "string" ? JSON.parse(raw) : raw;
    return {
      why_now: d.why_now || "",
      profit_logic: d.profit_logic || "",
      actions: Array.isArray(d.actions) ? d.actions : [],
      risks: Array.isArray(d.risks) ? d.risks : [],
      confidence: typeof d.confidence === "number" ? d.confidence : 0,
    };
  } catch {
    return null;
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
}

export default function ArchivePage() {
  const { t } = useT();
  const STATUS_CONFIG = {
    todo:   { label: t("archive_status_todo"),   ...STATUS_STYLES.todo },
    bias:   { label: t("archive_status_bias"),   ...STATUS_STYLES.bias },
    action: { label: t("archive_status_action"), ...STATUS_STYLES.action },
    missed: { label: t("archive_status_missed"), ...STATUS_STYLES.missed },
    done:   { label: t("archive_status_done"),   ...STATUS_STYLES.done },
    cancel: { label: t("archive_status_cancel"), ...STATUS_STYLES.cancel },
  } as Record<string, { label: string; pill: string; accent: string }>;
  const TABS: { value: StatusFilter; label: string }[] = [
    { value: "all",    label: t("archive_tab_all") },
    { value: "todo",   label: t("archive_status_todo") },
    { value: "bias",   label: t("archive_status_bias") },
    { value: "action", label: t("archive_status_action") },
    { value: "missed", label: t("archive_status_missed") },
    { value: "done",   label: t("archive_status_done") },
    { value: "cancel", label: t("archive_status_cancel") },
  ];
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetch("/api/archive")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
        else if (data.items) setItems(data.items);
        else if (data.archive) setItems(data.archive);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusCounts = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.action] = (acc[item.action] || 0) + 1;
    return acc;
  }, {});

  const filtered = (activeTab === "all" ? items : items.filter((i) => i.action === activeTab))
    .filter(i => !search || i.opp_title.toLowerCase().includes(search.toLowerCase()));

  function toggleExpand(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-900">
        <span className="text-slate-400">{t("common_loading")}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-slate-100">{t("archive_title")}</h1>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="搜索..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-36 md:w-48"
          />
          <span className="text-sm text-slate-500">{t("archive_total")} {items.length} {t("archive_records")}</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-2 mb-5">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as StatusFilter)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${cfg.pill} ${activeTab === key ? "ring-2 ring-white/20" : "opacity-70 hover:opacity-100"}`}
          >
            {cfg.label} · {statusCounts[key] || 0}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as StatusFilter)} className="mb-4">
        <TabsList className="bg-slate-800 border border-slate-700">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <ScrollArea className="flex-1">
        <div className="space-y-2 pr-4">
          {filtered.map((item, idx) => {
            const cfg = STATUS_CONFIG[item.action] ?? { label: item.action, pill: "bg-slate-600/20 text-slate-400 border border-slate-600/40", accent: "bg-slate-500" };
            const isOpen = expanded.has(item.id);
            const embed = isOpen ? parseEmbed(item.opp_embed) : null;
            const confidence = embed?.confidence ?? 0;
            const confidencePct = confidence <= 1 ? Math.round(confidence * 100) : Math.round(confidence * 10);
            const winIcon = WINDOW_ICON[item.opp_window] ?? "⏱";

            return (
              <div key={item.id} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                {/* Row */}
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-700/40 transition-colors group"
                >
                  {/* Accent dot */}
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.accent}`} />

                  {/* Rank */}
                  <span className="text-slate-600 font-mono text-xs w-4 shrink-0">{idx + 1}</span>

                  {/* Title */}
                  <span className="flex-1 text-slate-200 text-sm font-medium truncate group-hover:text-white transition-colors">
                    {item.opp_title}
                  </span>

                  {/* Meta */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-slate-500 text-xs">{winIcon} {item.opp_window}</span>
                    <span className="text-slate-500 text-xs">{formatDate(item.created_at)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.pill}`}>{cfg.label}</span>
                    <span className={`text-slate-500 text-xs transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>▾</span>
                  </div>
                </button>

                {/* Expanded detail */}
                {isOpen && embed && (
                  <div className="border-t border-slate-700">
                    <div className={`h-0.5 w-full ${cfg.accent} opacity-60`} />
                    <div className="flex gap-0 p-5 text-sm">
                      {/* Left */}
                      <div className="flex-1 space-y-4 pr-5 min-w-0">
                        {embed.why_now && (
                          <div>
                            <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1.5">{t("opp_section_whynow")}</p>
                            <p className="text-slate-300 leading-relaxed">{embed.why_now}</p>
                          </div>
                        )}
                        {embed.profit_logic && (
                          <>
                            <Separator className="bg-slate-700" />
                            <div>
                              <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1.5">{t("opp_section_profit")}</p>
                              <p className="text-slate-300 leading-relaxed">{embed.profit_logic}</p>
                            </div>
                          </>
                        )}
                        {(embed.risks?.length ?? 0) > 0 && (
                          <>
                            <Separator className="bg-slate-700" />
                            <div>
                              <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1.5">{t("opp_section_risks")}</p>
                              <ul className="space-y-1">
                                {embed.risks!.map((r, i) => (
                                  <li key={i} className="flex gap-2 text-red-400/80">
                                    <span className="shrink-0">•</span><span>{r}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </>
                        )}
                        <div className="flex items-center gap-2 pt-1 border-t border-slate-700/60 text-xs text-slate-500">
                          <span>{t("opp_confidence")}</span>
                          <span className={confidencePct >= 70 ? "text-emerald-400 font-semibold" : confidencePct >= 50 ? "text-amber-400 font-semibold" : "text-red-400 font-semibold"}>
                            {confidencePct}%
                          </span>
                        </div>
                      </div>

                      {/* Right: actions */}
                      {(embed.actions?.length ?? 0) > 0 && (
                        <div className="w-96 shrink-0 bg-slate-900/60 rounded-lg border border-slate-600/50 p-5 ml-2">
                          <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">{t("opp_section_actions")}</p>
                          <ol className="space-y-3">
                            {embed.actions!.map((a, i) => (
                              <li key={i} className="flex gap-3 text-slate-300">
                                <span className="shrink-0 w-6 h-6 rounded-full bg-slate-700 text-slate-400 text-xs flex items-center justify-center font-bold mt-0.5">{i + 1}</span>
                                <span className="leading-relaxed">{a}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Advisor notes section — show if exists */}
                {item.advisor_notes && (
                  <div className="border-t border-slate-700 px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedNotes((prev) => {
                            const next = new Set(prev);
                            next.has(item.id) ? next.delete(item.id) : next.add(item.id);
                            return next;
                          });
                        }}
                        className="flex items-center gap-2 flex-1 text-left"
                      >
                        <p className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">{t("opp_plan_title")}</p>
                        <span className={`text-purple-400 text-xs transition-transform duration-200 ${expandedNotes.has(item.id) ? "rotate-180" : ""}`}>▾</span>
                        <span className="text-xs text-slate-500">{expandedNotes.has(item.id) ? t("common_collapse") : t("common_expand")}</span>
                      </button>
                      <button
                        className="text-xs text-slate-400 hover:text-slate-200 transition-colors px-2 py-1 rounded border border-slate-600 hover:border-slate-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          const blob = new Blob([item.advisor_notes!], { type: "text/markdown" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `${item.opp_title.slice(0, 40).replace(/[^\w\u4e00-\u9fa5]/g, "_")}.md`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                      >⬇ .md</button>
                    </div>
                    {expandedNotes.has(item.id) && (
                      <div className="mt-3 prose prose-invert max-w-none text-sm leading-relaxed
                        [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-white [&_h1]:mt-4 [&_h1]:mb-2
                        [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-slate-100 [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:border-b [&_h2]:border-slate-600 [&_h2]:pb-1
                        [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-slate-200 [&_h3]:mt-3 [&_h3]:mb-1
                        [&_p]:text-slate-300 [&_p]:leading-7 [&_p]:mb-2
                        [&_ul]:text-slate-300 [&_ul]:space-y-1 [&_ul]:pl-5 [&_ul]:mb-2
                        [&_ol]:text-slate-300 [&_ol]:space-y-1 [&_ol]:pl-5 [&_ol]:mb-2
                        [&_li]:leading-6
                        [&_strong]:text-white [&_strong]:font-bold
                        [&_code]:bg-slate-700/80 [&_code]:text-amber-300 [&_code]:px-1 [&_code]:rounded [&_code]:text-xs
                        [&_hr]:border-slate-600 [&_hr]:my-3">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.advisor_notes}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center text-slate-500 py-16">{t("archive_empty")}</div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
