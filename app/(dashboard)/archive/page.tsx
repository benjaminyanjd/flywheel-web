"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useT } from "@/lib/i18n";
import { Separator } from "@/components/ui/separator";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { parseEmbed, type EmbedData } from "@/lib/parse-embed";

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

type StatusFilter = "all" | "todo" | "bias" | "action" | "missed" | "done" | "cancel";

const STATUS_STYLES: Record<string, { pill: string; accent: string }> = {
  todo:   { pill: "bg-blue-50 text-blue-600 border border-blue-200",   accent: "bg-blue-500" },
  bias:   { pill: "bg-orange-50 text-orange-600 border border-orange-200", accent: "bg-orange-500" },
  action: { pill: "bg-green-50 text-green-600 border border-green-200",  accent: "bg-green-500" },
  missed: { pill: "bg-gray-100 text-gray-400 border border-gray-200",  accent: "bg-gray-400" },
  done:   { pill: "bg-emerald-50 text-emerald-600 border border-emerald-200", accent: "bg-emerald-500" },
  cancel: { pill: "bg-red-50 text-red-500 border border-red-200",       accent: "bg-red-500" },
};

const WINDOW_ICON: Record<string, string> = {
  morning: "🌅",
  afternoon: "☀️",
  evening: "🌆",
  night: "🌙",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("zh-TW", { month: "2-digit", day: "2-digit" });
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
      .catch(() => {/* loading failed, UI shows empty state */})
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
      <div className="flex items-center justify-center h-full bg-white">
        <span className="text-gray-400">{t("common_loading")}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-900">{t("archive_title")}</h1>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder={t("archive_search")}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-200 bg-white rounded-xl px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 w-36 md:w-48"
          />
          <span className="text-sm text-gray-400">{t("archive_total")} {items.length} {t("archive_records")}</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-2 mb-5">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as StatusFilter)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${cfg.pill} ${activeTab === key ? "ring-2 ring-black/10" : "opacity-70 hover:opacity-100"}`}
          >
            {cfg.label} · {statusCounts[key] || 0}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as StatusFilter)} className="mb-4">
        <TabsList className="bg-gray-50 border border-gray-100">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <ScrollArea className="flex-1">
        <div className="space-y-2 pr-4">
          {filtered.map((item, idx) => {
            const cfg = STATUS_CONFIG[item.action] ?? { label: item.action, pill: "bg-gray-100 text-gray-400 border border-gray-200", accent: "bg-gray-400" };
            const isOpen = expanded.has(item.id);
            const embed = isOpen ? parseEmbed(item.opp_embed) : null;
            const confidence = embed?.confidence ?? 0;
            const confidencePct = confidence <= 1 ? Math.round(confidence * 100) : Math.round(confidence * 10);
            const winIcon = WINDOW_ICON[item.opp_window] ?? "⏱";

            return (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {/* Row */}
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors group"
                >
                  {/* Accent dot */}
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.accent}`} />

                  {/* Rank */}
                  <span className="text-gray-300 font-mono text-xs w-4 shrink-0">{idx + 1}</span>

                  {/* Title */}
                  <span className="flex-1 text-gray-700 text-sm font-medium truncate group-hover:text-gray-900 transition-colors">
                    {item.opp_title}
                  </span>

                  {/* Meta */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-gray-400 text-xs">{winIcon} {item.opp_window}</span>
                    <span className="text-gray-400 text-xs">{formatDate(item.created_at)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.pill}`}>{cfg.label}</span>
                    <span className={`text-gray-400 text-xs transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>▾</span>
                  </div>
                </button>

                {/* Expanded detail */}
                {isOpen && embed && (
                  <div className="border-t border-gray-100">
                    <div className={`h-0.5 w-full ${cfg.accent} opacity-60`} />
                    <div className="flex gap-0 p-5 text-sm">
                      {/* Left */}
                      <div className="flex-1 space-y-4 pr-5 min-w-0">
                        {embed.why_now && (
                          <div>
                            <p className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-1.5">{t("opp_section_whynow")}</p>
                            <p className="text-gray-500 leading-relaxed">{embed.why_now}</p>
                          </div>
                        )}
                        {embed.profit_logic && (
                          <>
                            <Separator className="bg-gray-100" />
                            <div>
                              <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1.5">{t("opp_section_profit")}</p>
                              <p className="text-gray-500 leading-relaxed">{embed.profit_logic}</p>
                            </div>
                          </>
                        )}
                        {(embed.risks?.length ?? 0) > 0 && (
                          <>
                            <Separator className="bg-gray-100" />
                            <div>
                              <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1.5">{t("opp_section_risks")}</p>
                              <ul className="space-y-1">
                                {embed.risks!.map((r, i) => (
                                  <li key={i} className="flex gap-2 text-red-400">
                                    <span className="shrink-0">•</span><span>{r}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </>
                        )}
                        <div className="flex items-center gap-2 pt-1 border-t border-gray-100 text-xs text-gray-400">
                          <span>{t("opp_confidence")}</span>
                          <span className={confidencePct >= 70 ? "text-green-600 font-semibold" : confidencePct >= 50 ? "text-yellow-600 font-semibold" : "text-red-500 font-semibold"}>
                            {confidencePct}%
                          </span>
                        </div>
                      </div>

                      {/* Right: actions */}
                      {(embed.actions?.length ?? 0) > 0 && (
                        <div className="w-96 shrink-0 bg-gray-50 rounded-xl border border-gray-100 p-5 ml-2">
                          <p className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">{t("opp_section_actions")}</p>
                          <ol className="space-y-3">
                            {embed.actions!.map((a, i) => (
                              <li key={i} className="flex gap-3 text-gray-600">
                                <span className="shrink-0 w-6 h-6 rounded-full bg-gray-200 text-gray-500 text-xs flex items-center justify-center font-bold mt-0.5">{i + 1}</span>
                                <span className="leading-relaxed">{a}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Advisor notes section */}
                {item.advisor_notes && (
                  <div className="border-t border-gray-100 px-5 py-3">
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
                        <p className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">{t("opp_plan_title")}</p>
                        <span className={`text-gray-400 text-xs transition-transform duration-200 ${expandedNotes.has(item.id) ? "rotate-180" : ""}`}>▾</span>
                        <span className="text-xs text-gray-400">{expandedNotes.has(item.id) ? t("common_collapse") : t("common_expand")}</span>
                      </button>
                      <button
                        className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded border border-gray-200 hover:border-gray-400"
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
                      <div className="mt-3 prose max-w-none text-sm leading-relaxed
                        [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mt-4 [&_h1]:mb-2
                        [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:border-b [&_h2]:border-gray-200 [&_h2]:pb-1
                        [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-gray-700 [&_h3]:mt-3 [&_h3]:mb-1
                        [&_p]:text-gray-600 [&_p]:leading-7 [&_p]:mb-2
                        [&_ul]:text-gray-600 [&_ul]:space-y-1 [&_ul]:pl-5 [&_ul]:mb-2
                        [&_ol]:text-gray-600 [&_ol]:space-y-1 [&_ol]:pl-5 [&_ol]:mb-2
                        [&_li]:leading-6
                        [&_strong]:text-gray-900 [&_strong]:font-bold
                        [&_code]:bg-gray-100 [&_code]:text-gray-700 [&_code]:px-1 [&_code]:rounded [&_code]:text-xs
                        [&_hr]:border-gray-200 [&_hr]:my-3">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.advisor_notes}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center text-gray-400 py-16">{t("archive_empty")}</div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
