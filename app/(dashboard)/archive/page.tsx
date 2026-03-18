"use client";

import React, { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useT } from "@/lib/i18n";
import { Separator } from "@/components/ui/separator";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { parseEmbed, type EmbedData } from "@/lib/parse-embed";
import { ArchiveIcon } from "@/components/icons";

interface ArchiveItem {
  id: number;
  opp_rank: number;
  opp_title: string;
  opp_window: string;
  opp_embed: string;
  action: string;
  created_at: string;
  advisor_notes?: string | null;
  outcome_amount?: number | null;
  outcome_note?: string | null;
  outcome_at?: string | null;
}

type StatusFilter = "all" | "todo" | "bias" | "action" | "missed" | "done" | "cancel";

const STATUS_STYLES: Record<string, { pill: string; accent: string }> = {
  todo:   { pill: "bg-blue-500/10 text-blue-500 border border-blue-500/30",   accent: "bg-blue-500" },
  bias:   { pill: "bg-orange-500/10 text-orange-500 border border-orange-500/30", accent: "bg-orange-500" },
  action: { pill: "bg-green-500/10 text-green-500 border border-green-500/30",  accent: "bg-green-500" },
  missed: { pill: "border text-[var(--text-muted)] bg-[var(--bg-panel)]",  accent: "bg-[var(--text-muted)]" },
  done:   { pill: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30", accent: "bg-emerald-500" },
  cancel: { pill: "bg-red-500/10 text-red-500 border border-red-500/30",       accent: "bg-red-500" },
};

function IconMorning() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
    </svg>
  );
}

function IconAfternoon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function IconEvening() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
    </svg>
  );
}

function IconNight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
      <circle cx="15" cy="10" r="1.2" fill="currentColor" stroke="none"/>
    </svg>
  );
}

const WINDOW_ICON: Record<string, React.ReactNode> = {
  morning: <IconMorning />,
  afternoon: <IconAfternoon />,
  evening: <IconEvening />,
  night: <IconNight />,
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("zh-TW", { month: "2-digit", day: "2-digit" });
}

export default function ArchivePage() {
  const { t, lang } = useT();
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
  const [outcomeOpen, setOutcomeOpen] = useState<Set<number>>(new Set());
  const [outcomeAmount, setOutcomeAmount] = useState<Record<number, string>>({});
  const [outcomeNote, setOutcomeNote] = useState<Record<number, string>>({});
  const [outcomeSubmitting, setOutcomeSubmitting] = useState<Record<number, boolean>>({});
  const [outcomeSuccess, setOutcomeSuccess] = useState<Record<number, boolean>>({});
  const [visibleCount, setVisibleCount] = useState(10);

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

  const visibleItems = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // Reset visible count when filter/search changes
  useEffect(() => {
    setVisibleCount(10);
  }, [activeTab, search]);

  function toggleExpand(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleOutcome(id: number) {
    setOutcomeOpen((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function submitOutcome(id: number) {
    setOutcomeSubmitting(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch("/api/opportunity/outcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, outcome_amount: outcomeAmount[id] ? Number(outcomeAmount[id]) : null, outcome_note: outcomeNote[id] || null }),
      });
      if (res.ok) {
        setOutcomeSuccess(prev => ({ ...prev, [id]: true }));
        setItems(prev => prev.map(item =>
          item.id === id
            ? { ...item, outcome_amount: outcomeAmount[id] ? Number(outcomeAmount[id]) : null, outcome_note: outcomeNote[id] || null, outcome_at: new Date().toISOString() }
            : item
        ));
        setTimeout(() => setOutcomeOpen(prev => { const next = new Set(prev); next.delete(id); return next; }), 1500);
      }
    } finally {
      setOutcomeSubmitting(prev => ({ ...prev, [id]: false }));
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full p-6 animate-page-enter" style={{ backgroundColor: "var(--bg)" }}>
        <div className="h-7 skeleton-shimmer rounded w-32 mb-4" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-2xl p-4 border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-subtle)" }}>
              <div className="flex items-center gap-3">
                <div className="h-3 skeleton-shimmer rounded w-3/4" />
                <div className="h-5 w-16 skeleton-shimmer rounded-full ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 animate-page-enter" style={{ backgroundColor: "var(--bg)" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{t("archive_title")}</h1>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder={t("archive_search")}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="rounded-xl px-3 py-1.5 text-sm input-focus-ring focus:outline-none w-36 md:w-48 border" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)", color: "var(--text-primary)" }}
          />
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>{t("archive_total")} {items.length} {t("archive_records")}</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 btn-press border ${activeTab === "all" ? "ring-2 ring-black/10 shadow-sm" : "opacity-70 hover:opacity-100"}`}
          style={{ color: "var(--text-secondary)", borderColor: "var(--border)", backgroundColor: activeTab === "all" ? "var(--bg-panel)" : "transparent" }}
        >
          {t("archive_tab_all")} · {items.length}
        </button>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as StatusFilter)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 btn-press ${cfg.pill} ${activeTab === key ? "ring-2 ring-black/10 shadow-sm" : "opacity-70 hover:opacity-100"}`}
          >
            {cfg.label} · {statusCounts[key] || 0}
          </button>
        ))}
        {activeTab !== "all" && (
          <button
            onClick={() => setActiveTab("all")}
            className="px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 btn-press border hover:bg-[var(--bg-panel)]"
            style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}
          >
            × {lang === "zh" ? "清除篩選" : "Clear filter"}
          </button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as StatusFilter)} className="mb-4">
        <TabsList style={{ backgroundColor: "var(--bg-panel)", border: "1px solid var(--border-subtle)" }}>
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <ScrollArea className="flex-1">
        <div className="space-y-2 pr-4">
          {visibleItems.map((item, idx) => {
            const cfg = STATUS_CONFIG[item.action] ?? { label: item.action, pill: "border text-[var(--text-muted)] bg-[var(--bg-panel)]", accent: "bg-[var(--text-muted)]" };
            const isOpen = expanded.has(item.id);
            const embed = isOpen ? parseEmbed(item.opp_embed) : null;
            const confidence = embed?.confidence ?? 0;
            const confidencePct = confidence <= 1 ? Math.round(confidence * 100) : Math.round(confidence * 10);
            const winIcon = WINDOW_ICON[item.opp_window] ?? <span>⏱</span>;

            // Date group header
            const itemDate = new Date(item.created_at + (item.created_at.endsWith("Z") ? "" : "Z"));
            const today = new Date();
            const isToday = itemDate.toLocaleDateString("zh-TW") === today.toLocaleDateString("zh-TW");
            const dateLabel = isToday
              ? (lang === "zh" ? "今天" : "Today")
              : `${itemDate.getMonth() + 1}月${itemDate.getDate()}日`;
            const prevItem = visibleItems[idx - 1];
            const prevDate = prevItem ? new Date(prevItem.created_at + (prevItem.created_at.endsWith("Z") ? "" : "Z")) : null;
            const showDateHeader = idx === 0 || (prevDate && prevDate.toLocaleDateString("zh-TW") !== itemDate.toLocaleDateString("zh-TW"));

            return (
              <React.Fragment key={item.id}>
              {showDateHeader && (
                <div className="flex items-center gap-3 pt-2 pb-1">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--bg-panel)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>{dateLabel}</span>
                  <div className="flex-1 h-px" style={{ backgroundColor: "var(--border-subtle)" }} />
                </div>
              )}
              <div className="rounded-2xl overflow-hidden transition-all duration-200" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
                {/* Row */}
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--bg-panel)] transition-all duration-200 group"
                >
                  {/* Accent dot */}
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.accent}`} />

                  {/* Rank */}
                  <span className="font-mono text-xs w-4 shrink-0" style={{ color: "var(--border)" }}>{idx + 1}</span>

                  {/* Title */}
                  <span className="flex-1 text-sm font-medium truncate group-hover:text-[var(--text-primary)] transition-colors" style={{ color: "var(--text-secondary)" }}>
                    {item.opp_title}
                  </span>

                  {/* Meta */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{winIcon} {item.opp_window}</span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{formatDate(item.created_at)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.pill}`}>{cfg.label}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </div>
                </button>

                {/* Expanded detail */}
                {isOpen && embed && (
                  <div className="border-t expand-content" style={{ borderColor: "var(--border-subtle)" }}>
                    <div className={`h-0.5 w-full ${cfg.accent} opacity-60`} />
                    <div className="flex gap-0 p-5 text-sm">
                      {/* Left */}
                      <div className="flex-1 space-y-4 pr-5 min-w-0">
                        {embed.why_now && (
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-primary)" }}>{t("opp_section_whynow")}</p>
                            <p className="leading-relaxed" style={{ color: "var(--text-secondary)" }}>{embed.why_now}</p>
                          </div>
                        )}
                        {embed.profit_logic && (
                          <>
                            <Separator style={{ backgroundColor: "var(--border-subtle)" }} />
                            <div>
                              <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1.5">{t("opp_section_profit")}</p>
                              <p className="leading-relaxed" style={{ color: "var(--text-secondary)" }}>{embed.profit_logic}</p>
                            </div>
                          </>
                        )}
                        {(embed.risks?.length ?? 0) > 0 && (
                          <>
                            <Separator style={{ backgroundColor: "var(--border-subtle)" }} />
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
                        <div className="flex items-center gap-2 pt-1 border-t text-xs" style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}>
                          <span>{t("opp_confidence")}</span>
                          <span className={confidencePct >= 70 ? "text-green-600 font-semibold" : confidencePct >= 50 ? "text-yellow-600 font-semibold" : "text-red-500 font-semibold"}>
                            {confidencePct}%
                          </span>
                        </div>
                      </div>

                      {/* Right: actions */}
                      {(embed.actions?.length ?? 0) > 0 && (
                        <div className="w-96 shrink-0 rounded-xl border p-5 ml-2" style={{ backgroundColor: "var(--bg-panel)", borderColor: "var(--border-subtle)" }}>
                          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-primary)" }}>{t("opp_section_actions")}</p>
                          <ol className="space-y-3">
                            {embed.actions!.map((a, i) => (
                              <li key={i} className="flex gap-3" style={{ color: "var(--text-secondary)" }}>
                                <span className="shrink-0 w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold mt-0.5" style={{ backgroundColor: "var(--border)", color: "var(--text-muted)" }}>{i + 1}</span>
                                <span className="leading-relaxed">{a}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* #10 Outcome reporting for 'action' status items */}
                {item.action === "action" && (
                  <div className="border-t px-5 py-3" style={{ borderColor: "var(--border-subtle)" }}>
                    {item.outcome_at ? (
                      <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                        <span className="text-green-500 font-semibold">✓ 已回報</span>
                        {item.outcome_amount != null && <span>金額：{item.outcome_amount}</span>}
                        {item.outcome_note && <span>· {item.outcome_note}</span>}
                        <button
                          onClick={e => { e.stopPropagation(); toggleOutcome(item.id); }}
                          className="ml-auto text-xs underline hover:no-underline"
                        >修改</button>
                      </div>
                    ) : (
                      <button
                        onClick={e => { e.stopPropagation(); toggleOutcome(item.id); }}
                        className="text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all hover:bg-[var(--bg-panel)]"
                        style={{ color: "var(--signal)", borderColor: "var(--signal)" }}
                      >
                        回報結果
                      </button>
                    )}
                    {outcomeOpen.has(item.id) && (
                      <div className="mt-3 flex flex-col gap-2" onClick={e => e.stopPropagation()}>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="金額（選填）"
                            value={outcomeAmount[item.id] || ""}
                            onChange={e => setOutcomeAmount(prev => ({ ...prev, [item.id]: e.target.value }))}
                            className="w-32 rounded-xl px-3 py-1.5 text-sm border focus:outline-none"
                            style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)", color: "var(--text-primary)" }}
                          />
                          <input
                            type="text"
                            placeholder="備註（選填）"
                            value={outcomeNote[item.id] || ""}
                            onChange={e => setOutcomeNote(prev => ({ ...prev, [item.id]: e.target.value }))}
                            className="flex-1 rounded-xl px-3 py-1.5 text-sm border focus:outline-none"
                            style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)", color: "var(--text-primary)" }}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => submitOutcome(item.id)}
                            disabled={outcomeSubmitting[item.id]}
                            className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
                            style={{ backgroundColor: "var(--signal)", color: "var(--bg)" }}
                          >
                            {outcomeSuccess[item.id] ? "✓ 已儲存" : outcomeSubmitting[item.id] ? "儲存中..." : "提交"}
                          </button>
                          <button
                            onClick={() => toggleOutcome(item.id)}
                            className="text-xs px-3 py-1.5 rounded-xl border hover:bg-[var(--bg-panel)]"
                            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                          >取消</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Advisor notes section */}
                {item.advisor_notes && (
                  <div className="border-t px-5 py-3" style={{ borderColor: "var(--border-subtle)" }}>
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
                        className="flex items-center gap-2 flex-1 text-left group"
                      >
                        <p className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border" style={{ color: "var(--text-secondary)", backgroundColor: "var(--bg-panel)", borderColor: "var(--border)" }}>{t("opp_plan_title")}</p>
                        <span className="text-xs font-medium transition-colors group-hover:text-[var(--text-primary)]" style={{ color: "var(--text-muted)" }}>
                          {expandedNotes.has(item.id) ? "收合 ↑" : "查看落地方案 ↓"}
                        </span>
                      </button>
                      <button
                        className="text-xs transition-colors px-2 py-1 rounded border btn-press hover:text-[var(--text-primary)]" style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}
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
                      >↓ .md</button>
                    </div>
                    {expandedNotes.has(item.id) && (
                      <div className="mt-3 prose max-w-none text-sm leading-relaxed expand-content
                        [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-[var(--text-primary)] [&_h1]:mt-4 [&_h1]:mb-2
                        [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-[var(--text-primary)] [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:border-b [&_h2]:border-[var(--border)] [&_h2]:pb-1
                        [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-[var(--text-primary)] [&_h3]:mt-3 [&_h3]:mb-1
                        [&_p]:text-[var(--text-secondary)] [&_p]:leading-7 [&_p]:mb-2
                        [&_ul]:text-[var(--text-secondary)] [&_ul]:space-y-1 [&_ul]:pl-5 [&_ul]:mb-2
                        [&_ol]:text-[var(--text-secondary)] [&_ol]:space-y-1 [&_ol]:pl-5 [&_ol]:mb-2
                        [&_li]:leading-6
                        [&_strong]:text-[var(--text-primary)] [&_strong]:font-bold
                        [&_code]:bg-[var(--bg-panel)] [&_code]:text-[var(--text-secondary)] [&_code]:px-1 [&_code]:rounded [&_code]:text-xs
                        [&_hr]:border-gray-200 [&_hr]:my-3">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.advisor_notes}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                )}
              </div>
              </React.Fragment>
            );
          })}

          {hasMore && (
            <div className="flex justify-center pt-4 pb-2">
              <button
                onClick={() => setVisibleCount(prev => prev + 10)}
                className="px-6 py-2 rounded-xl text-sm font-medium border transition-all duration-200 hover:bg-[var(--bg-panel)] btn-press"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-card)" }}
              >
                載入更多（還有 {filtered.length - visibleCount} 條）
              </button>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 animate-page-enter">
              <div className="w-20 h-20 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mb-4 shadow-inner">
                <ArchiveIcon size={40} style={{ color: "var(--text-secondary)" }} />
              </div>
              <p className="text-lg font-semibold text-gray-600 mb-1">{t("archive_empty")}</p>
              <p className="text-sm text-gray-400 text-center max-w-xs">
                {activeTab !== "all" ? "此分類暫無記錄" : "標記機會後，記錄將在此保存"}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
