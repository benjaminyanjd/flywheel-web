"use client";

import { useEffect, useState, useRef, useMemo, Suspense } from "react";
import { ShareCardModal } from "@/components/share-card-modal";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FlywheelLogo } from "@/components/flywheel-logo";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useT } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { PROSE_CLASS } from "@/lib/prose-class";
import { parseEmbed, type EmbedData } from "@/lib/parse-embed";
import { readSSEStream } from "@/lib/sse";

interface SignalSource {
  id: number;
  source: string;
  title: string;
  url: string;
  heat_score: number;
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

interface Opportunity {
  id: number;
  signal_ids: string;
  opp_window: string;
  opp_rank: number;
  opp_title: string;
  opp_url: string;
  opp_embed: string;
  opp_title_en: string | null;
  opp_embed_en: string | null;
  action: string;
  advisor_notes: string | null;
  cancel_reason: string | null;
  created_at: string;
  acted_at: string | null;
}

interface AdvisorState {
  text: string;
  loading: boolean;
  open: boolean;
}

const ACTION_BADGE_STYLES: Record<string, { cls: string }> = {
  todo:   { cls: "bg-blue-600/20 text-blue-300 border border-blue-600/40" },
  bias:   { cls: "bg-orange-600/20 text-orange-300 border border-orange-600/40" },
  action: { cls: "bg-green-600/20 text-green-300 border border-green-600/40" },
  done:   { cls: "bg-emerald-600/20 text-emerald-300 border border-emerald-600/40" },
  cancel: { cls: "bg-red-600/20 text-red-400 border border-red-600/40" },
};

const PROSE = PROSE_CLASS;

function OpportunitiesContent() {
  const { t, lang } = useT();
  const toast = useToast();
  const searchParams = useSearchParams();
  const isWelcome = searchParams.get("welcome") === "1"
  const [showWelcome, setShowWelcome] = useState(() => isWelcome);
  const [undoState, setUndoState] = useState<{id: number; action: string; title: string; removedOpp?: Opportunity} | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ACTION_BADGE: Record<string, { label: string; cls: string }> = {
    todo:   { label: t("archive_status_todo"),   ...ACTION_BADGE_STYLES.todo },
    bias:   { label: t("archive_status_bias"),   ...ACTION_BADGE_STYLES.bias },
    action: { label: t("archive_status_action"), ...ACTION_BADGE_STYLES.action },
    done:   { label: t("archive_status_done"),   ...ACTION_BADGE_STYLES.done },
    cancel: { label: t("archive_status_cancel"), ...ACTION_BADGE_STYLES.cancel },
  };
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  // Translation disabled: content stays in original language, UI labels are i18n'd
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [confFilter, setConfFilter] = useState<"all" | "high" | "mid" | "low">("all");
  const [dateFilter, setDateFilter] = useState<"today" | "all">("today");
  // Top 3 IDs for welcome mode — use existing array order (API returns by created_at DESC,
  // and the filter already excludes processed cards), no need to re-sort
  const top3Ids = useMemo(() => {
    if (!isWelcome) return new Set<number>()
    return new Set(opportunities.slice(0, 3).map((o) => o.id))
  }, [opportunities, isWelcome])

  // Auto-fallback: if "today" yields 0 results, switch to "all"
  const effectiveDateFilter = useMemo(() => {
    if (dateFilter !== "today") return dateFilter;
    const today = new Date().toLocaleDateString("zh-TW");
    const hasToday = opportunities.some(o => new Date(o.created_at).toLocaleDateString("zh-TW") === today);
    return hasToday ? "today" : "all";
  }, [dateFilter, opportunities]);
  // per-card advisor state
  const [advisorMap, setAdvisorMap] = useState<Record<number, AdvisorState>>({}); 
  const [todoSuccess, setTodoSuccess] = useState<Record<number, boolean>>({});
  const [signalSources, setSignalSources] = useState<Record<number, SignalSource[]>>({});
  const [signalExpanded, setSignalExpanded] = useState<Record<number, boolean>>({});
  const [shareModal, setShareModal] = useState<{
    isOpen: boolean;
    title: string;
    whyNow: string;
    profitLogic: string;
    confidence: number;
    risks: string[];
    actions: string[];
  } | null>(null);
  const abortRefs = useRef<Record<number, AbortController>>({});
  const finalTextRefs = useRef<Record<number, string>>({});
  const scrollKey = "scroll_opportunities";

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
    if (showWelcome) {
      const t = setTimeout(() => setShowWelcome(false), 6000);
      return () => clearTimeout(t);
    }
  }, [showWelcome]);

  useEffect(() => {
    fetch("/api/opportunities")
      .then((r) => r.json())
      .then((d) => {
        const list: Opportunity[] = Array.isArray(d) ? d : (d.opportunities ?? []);
        // Processed cards are moved out - never show them in opportunities view
        const hidden = new Set(["bias", "todo", "action", "done", "cancel"]);
        setOpportunities(list.filter((o: Opportunity) => !hidden.has(o.action ?? "")));
        // Pre-populate advisor panels for cards that already have saved notes
        const initMap: Record<number, AdvisorState> = {};
        for (const opp of list) {
          if (opp.advisor_notes) {
            initMap[opp.id] = { text: opp.advisor_notes, loading: false, open: false };
            finalTextRefs.current[opp.id] = opp.advisor_notes;
          }
        }
        setAdvisorMap(initMap);
      })
      .catch(() => {/* loading failed, UI shows empty state */})
      .finally(() => setLoading(false));
  }, []);

  // Detect if text is primarily English (needs translation for zh mode)
  function isEnglish(text: string): boolean {
    if (!text) return false;
    const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    return chineseChars / text.length < 0.1;
  }



  async function markAction(id: number, action: string, extra?: Record<string, string>) {
    await fetch(`/api/opportunities/${id}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
    setOpportunities((prev) => prev.map((o) => (o.id === id ? { ...o, action } : o)));
  }

  const ACTION_LABELS: Record<string, string> = {
    todo:   t("archive_status_todo"),
    bias:   t("archive_status_bias"),
    action: t("archive_status_action"),
    done:   t("archive_status_done"),
    cancel: t("archive_status_cancel"),
  };

  async function handleBtn(id: number, action: string) {
    const key = `${id}-${action}`;
    setActionLoading((p) => ({ ...p, [key]: true }));
    try {
      const opp = opportunities.find(o => o.id === id);
      await markAction(id, action);
      // Show undo snackbar
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      setUndoState({ id, action, title: opp?.opp_title ?? "", removedOpp: opp });
      undoTimerRef.current = setTimeout(() => setUndoState(null), 3000);
      // Bias / Todo → remove from opportunities view
      if (action === "bias" || action === "todo") {
        setOpportunities((prev) => prev.filter((o) => o.id !== id));
      }
    }
    catch { /* action failed silently */ }
    finally { setActionLoading((p) => ({ ...p, [key]: false })); }
  }

  function handleUndo() {
    if (!undoState) return;
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    const { id, removedOpp } = undoState;
    setUndoState(null);
    // Frontend-only restore — no API call needed
    if (removedOpp) {
      setOpportunities((prev) => {
        if (prev.some(o => o.id === id)) {
          // Card still visible, revert action state
          return prev.map(o => o.id === id ? { ...o, action: removedOpp.action } : o);
        }
        // Card was removed, restore it at original position (prepend)
        return [{ ...removedOpp, action: removedOpp.action ?? "" }, ...prev];
      });
    }
  }

  function setAdvisor(id: number, patch: Partial<AdvisorState>) {
    setAdvisorMap((p) => {
      const prev: AdvisorState = p[id] ?? { text: "", loading: false, open: false };
      return { ...p, [id]: { ...prev, ...patch } };
    });
  }

  async function handleAdvisor(opp: Opportunity) {
    const cur = advisorMap[opp.id];
    // Toggle close if already open and done
    if (cur?.open && !cur?.loading) {
      setAdvisor(opp.id, { open: false });
      return;
    }
    // If already has saved content, just show it
    if (cur?.text) {
      setAdvisor(opp.id, { open: true });
      return;
    }
    // Open panel and generate
    setAdvisor(opp.id, { open: true, loading: true, text: "" });
    finalTextRefs.current[opp.id] = "";

    // Cancel previous request if any
    abortRefs.current[opp.id]?.abort();
    const ctrl = new AbortController();
    abortRefs.current[opp.id] = ctrl;

    try {
      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: `請針對以下機會給出行動建議: ${opp.opp_title}` }),
        signal: ctrl.signal,
      });
      if (!res.body) return;
      const acc = await readSSEStream(res.body, (text) => {
        setAdvisor(opp.id, { text, loading: true });
      });
      finalTextRefs.current[opp.id] = acc;
      setAdvisor(opp.id, { text: acc, loading: false });
      // Save to DB only after plan is fully generated
      if (acc) {
        markAction(opp.id, "action", { advisor_notes: acc }).catch(() => {});
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setAdvisor(opp.id, { loading: false });
      }
    }
  }

  if (loading) return (
    <div className="flex flex-col h-full bg-slate-900 p-6">
      <div className="h-7 bg-slate-700 rounded w-40 mb-4 animate-pulse" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-5 animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-2/3 mb-3" />
            <div className="h-3 bg-slate-700 rounded w-full mb-2" />
            <div className="h-3 bg-slate-700 rounded w-4/5 mb-4" />
            <div className="flex gap-2">
              <div className="h-8 bg-slate-700 rounded w-20" />
              <div className="h-8 bg-slate-700 rounded w-20" />
              <div className="h-8 bg-slate-700 rounded w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-900 p-6">
      {showWelcome && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-4 flex items-start justify-between">
          <div>
            <p className="text-amber-400 font-medium">{t("opp_welcome_title")}</p>
            <p className="text-slate-400 text-sm mt-1">
              {t("opp_welcome_desc")}<br />
              {lang === "zh" ? "記得去 " : "Go to "}<a href="/settings" className="text-amber-400 underline">{lang === "zh" ? "設置頁面" : "Settings"}</a>{lang === "zh" ? " 綁定 Telegram，才能收到每日推送。" : " to bind Telegram for daily push."}
            </p>
          </div>
          <button onClick={() => setShowWelcome(false)} className="text-slate-500 hover:text-slate-300 ml-4">✕</button>
        </div>
      )}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <h1 className="text-xl font-bold text-slate-100">{t("opp_title")}</h1>
        {opportunities.length > 0 && (
          <span className="bg-purple-600/20 text-purple-400 border border-purple-600/40 text-xs font-bold px-2 py-0.5 rounded-full">
            {opportunities.length}
          </span>
        )}
        {opportunities.length > 0 && opportunities[0]?.created_at && (() => {
          const d = new Date(opportunities[0].created_at + (opportunities[0].created_at.endsWith("Z") ? "" : "Z"));
          const now = new Date();
          const diffMs = now.getTime() - d.getTime();
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          const timeStr = d.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Shanghai" });
          let label: string;
          if (diffDays === 0) label = `${t("opp_time_today")} ${timeStr}`;
          else if (diffDays === 1) label = `${t("opp_time_yesterday")} ${timeStr}`;
          else label = `${diffDays} ${t("opp_time_days_ago")}`;
          return <span className="text-xs text-slate-500">{t("opp_last_updated")}{label}</span>;
        })()}
        {/* Date filter toggle */}
        <div className="flex gap-1 border border-slate-700 rounded-lg p-1">
          <button onClick={() => setDateFilter("today")} className={dateFilter==="today" ? "bg-slate-600 text-slate-100 text-xs px-3 py-1 rounded" : "text-slate-400 text-xs px-3 py-1"}>{t("opp_date_today")}</button>
          <button onClick={() => setDateFilter("all")} className={dateFilter==="all" ? "bg-slate-600 text-slate-100 text-xs px-3 py-1 rounded" : "text-slate-400 text-xs px-3 py-1"}>{t("opp_date_all")}</button>
        </div>
        {/* Confidence filter tabs */}
        <div className="flex items-center gap-1 ml-2 bg-slate-800 border border-slate-700 rounded-lg p-1 overflow-x-auto flex-nowrap">
          {([
            { key: "all", label: t("common_all") },
            { key: "high", label: "🟢 " + t("opp_conf_high") + " ≥70%" },
            { key: "mid",  label: "🟡 " + t("opp_conf_mid") + " 50-70%" },
            { key: "low",  label: "🔴 " + t("opp_conf_low") + " <50%" },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setConfFilter(tab.key)}
              className={`text-xs px-3 py-1 rounded transition-colors ${
                confFilter === tab.key
                  ? "bg-slate-600 text-slate-100 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>

      {undoState && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50
          bg-slate-800 text-white px-4 py-3 rounded-lg shadow-xl
          flex items-center gap-3 text-sm whitespace-nowrap">
          <span>{t("opp_undo_marked")} {ACTION_LABELS[undoState.action] ?? undoState.action} · <button onClick={handleUndo} className="text-indigo-400 font-medium hover:text-indigo-300">{t("opp_undo")}</button></span>
        </div>
      )}
      <ScrollArea className="flex-1 h-[calc(100vh-8rem)] md:h-auto">
        <div className="space-y-5 pr-4">
          {opportunities.filter((opp) => {
            // Date filter (uses effectiveDateFilter which auto-falls back to "all" if no today results)
            if (effectiveDateFilter === "today") {
              const today = new Date().toLocaleDateString("zh-TW");
              if (new Date(opp.created_at).toLocaleDateString("zh-TW") !== today) return false;
            }
            // Confidence filter
            if (confFilter === "all") return true;
            const raw = (() => { try { return JSON.parse(opp.opp_embed); } catch { return {}; } })();
            const c = raw.confidence ?? 0;
            const pct = c <= 1 ? Math.round(c * 100) : Math.round(c * 10);
            if (confFilter === "high") return pct >= 70;
            if (confFilter === "mid") return pct >= 50 && pct < 70;
            if (confFilter === "low") return pct < 50;
            return true;
          }).map((opp) => {
            const rawEmbed = parseEmbed(opp.opp_embed);
            // Use English content when lang is "en" and English translation is available
            const useEn = lang === "en" && opp.opp_embed_en;
            const embed = useEn ? parseEmbed(opp.opp_embed_en!) ?? rawEmbed : rawEmbed;
            const displayTitle = useEn && opp.opp_title_en ? opp.opp_title_en : opp.opp_title;
            const confidence = rawEmbed?.confidence ?? 0;
            const pct = confidence <= 1 ? Math.round(confidence * 100) : Math.round(confidence * 10);
            const accent = pct >= 70 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";
            const pctColor = pct >= 70 ? "text-emerald-400" : pct >= 50 ? "text-amber-400" : "text-red-400";
            const badge = ACTION_BADGE[opp.action];
            const adv = advisorMap[opp.id];

            return (
              <Card key={opp.id} className="bg-slate-800 border-slate-700 overflow-hidden">
                <div className="flex">
                  <div className={`w-1 shrink-0 ${(Date.now() - new Date(opp.created_at).getTime()) > 24 * 60 * 60 * 1000 ? "bg-slate-600" : accent}`} />
                  <div className="flex-1 p-5">

                    {/* Welcome: recommended top-3 badge */}
                    {isWelcome && top3Ids.has(opp.id) && (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-amber-400 mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block"/>
                        {t("opp_recommend")}
                      </div>
                    )}

                    {/* Header */}
                    <div className="flex items-start justify-between mb-3 min-w-0">
                      <h3 className="text-slate-100 font-semibold text-base leading-snug pr-4 min-w-0 break-words">
                        💡 {displayTitle}
                      </h3>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-slate-500 border border-slate-600 px-2 py-0.5 rounded">
                          {new Date(opp.created_at).toLocaleDateString("zh-TW", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {(() => {
                          const hoursAgo = (Date.now() - new Date(opp.created_at).getTime()) / (1000 * 60 * 60);
                          if (hoursAgo > 48) return <span className="text-xs text-red-400 ml-2" title={t("opp_stale_48h")}>⏰ {t("opp_stale_48h")}</span>;
                          if (hoursAgo > 24) return <span className="text-xs text-amber-400 ml-2" title={t("opp_stale_24h")}>⚠️ {t("opp_stale_24h")}</span>;
                          return null;
                        })()}
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${accent} text-white`}>{pct}%</span>
                        {badge && opp.action !== "action" && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${badge.cls}`}>{badge.label}</span>
                        )}
                      </div>
                    </div>

                    {/* Body: left content + right action list */}
                    {embed && (
                      <div className="flex flex-col md:flex-row gap-0 text-sm">
                        <div className="flex-1 space-y-4 md:pr-5 min-w-0">
                          <div>
                            <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1.5">{t("opp_why_now")}</p>
                            <p className="text-slate-300 leading-relaxed">{embed.why_now}</p>
                          </div>
                          <Separator className="bg-slate-700" />
                          <div>
                            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1.5">{t("opp_profit")}</p>
                            <p className="text-slate-300 leading-relaxed">{embed.profit_logic}</p>
                          </div>
                          {embed.risks.length > 0 && (
                            <>
                              <Separator className="bg-slate-700" />
                              <div>
                                <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1.5">{t("opp_risks")}</p>
                                <ul className="space-y-1">
                                  {embed.risks.map((r, i) => (
                                    <li key={i} className="flex gap-2 text-red-400/80">
                                      <span className="shrink-0 mt-0.5">•</span><span>{r}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </>
                          )}
                          {(() => {
                            const { barColor, confLabel } = pct >= 70
                              ? { barColor: "bg-emerald-500", confLabel: t("opp_conf_high") }
                              : pct >= 50
                              ? { barColor: "bg-amber-500", confLabel: t("opp_conf_mid") }
                              : { barColor: "bg-slate-500", confLabel: t("opp_conf_low") }
                            return (
                              <div className="flex items-center gap-2 pt-1 border-t border-slate-700/60">
                                <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-xs text-slate-400 shrink-0">{confLabel} {pct}%</span>
                              </div>
                            )
                          })()}
                        </div>

                        <div className="w-full md:w-96 md:shrink-0 bg-slate-900/60 rounded-lg border border-slate-600/50 p-5 md:ml-2 mt-4 md:mt-0">
                          <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">{t("opp_actions")}</p>
                          <ol className="space-y-3.5">
                            {embed.actions.map((a, i) => (
                              <li key={i} className="flex gap-3 text-slate-300">
                                <span className="shrink-0 w-6 h-6 rounded-full bg-slate-700 text-slate-400 text-xs flex items-center justify-center font-bold mt-0.5">{i + 1}</span>
                                <span className="leading-relaxed">{a}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    )}

                    {/* Signal sources */}
                    {opp.signal_ids && (
                      <div className="mt-3 pt-3 border-t border-slate-700/60">
                        <button
                          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                          onClick={async () => {
                            const wasExpanded = signalExpanded[opp.id];
                            setSignalExpanded((p) => ({ ...p, [opp.id]: !wasExpanded }));
                            if (!wasExpanded && !signalSources[opp.id]) {
                              try {
                                const res = await fetch(`/api/opportunities/${opp.id}/signals`);
                                const data = await res.json();
                                setSignalSources((p) => ({ ...p, [opp.id]: data.signals ?? [] }));
                              } catch { /* signal fetch failed silently */ }
                            }
                          }}
                        >
                          <span>📡</span>
                          <span>{opp.signal_ids.split(",").filter(Boolean).length} {t("opp_signals")}</span>
                          <span className={`transition-transform duration-200 ${signalExpanded[opp.id] ? "rotate-180" : ""}`}>▾</span>
                        </button>
                        {signalExpanded[opp.id] && signalSources[opp.id] && (
                          <div className="mt-2 space-y-1.5">
                            {signalSources[opp.id].map((sig) => (
                              <div key={sig.id} className="flex items-center gap-2 text-xs">
                                <Badge className={`${sourceBadgeColor(sig.source)} text-xs shrink-0`}>{sig.source}</Badge>
                                <span className="text-slate-500">·</span>
                                {sig.url ? (
                                  <a href={sig.url} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-indigo-400 truncate max-w-[50ch] transition-colors">
                                    {sig.title?.length > 50 ? sig.title.slice(0, 50) + "…" : sig.title}
                                  </a>
                                ) : (
                                  <span className="text-slate-300 truncate max-w-[50ch]">{sig.title?.length > 50 ? sig.title.slice(0, 50) + "…" : sig.title}</span>
                                )}
                                <span className="text-slate-500">·</span>
                                <span className="text-orange-400 shrink-0">🔥{sig.heat_score}</span>
                              </div>
                            ))}
                            {signalSources[opp.id].length === 0 && (
                              <p className="text-xs text-slate-500">{t("opp_no_signal_data")}</p>
                            )}
                          </div>
                        )}
                        {signalExpanded[opp.id] && !signalSources[opp.id] && (
                          <p className="text-xs text-slate-500 mt-1">{t("common_loading")}</p>
                        )}
                      </div>
                    )}

                    {/* Action buttons - always visible */}
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-700">
                      <Button
                        variant="outline" size="sm"
                        className={`text-xs transition-colors ${opp.action === "todo" ? "border-blue-500 text-blue-300 bg-blue-900/20" : "border-slate-600 text-slate-300 hover:bg-slate-700"}`}
                        disabled={actionLoading[`${opp.id}-todo`]}
                        onClick={() => handleBtn(opp.id, "todo")}
                        title={t("opp_todo_title_prefix")}
                      >
                        {actionLoading[`${opp.id}-todo`] ? "..." : t("opp_btn_todo")}
                      </Button>
                      <Button
                        variant="outline" size="sm"
                        className={`text-xs transition-colors ${opp.action === "bias" ? "border-orange-500 text-orange-300 bg-orange-900/20" : "border-slate-600 text-slate-300 hover:bg-slate-700"}`}
                        disabled={actionLoading[`${opp.id}-bias`]}
                        onClick={() => handleBtn(opp.id, "bias")}
                        title={t("opp_bias_title_prefix")}
                      >
                        {actionLoading[`${opp.id}-bias`] ? "..." : t("opp_btn_bias")}
                      </Button>
                      <Button
                        size="sm"
                        className={`text-xs transition-colors ${adv?.open ? "bg-emerald-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}
                        disabled={adv?.loading}
                        onClick={() => handleAdvisor(opp)}
                        title={t("opp_action_title_prefix")}
                      >
                        {adv?.loading ? (
                          <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />{t("opp_generating")}
                          </span>
                        ) : adv?.open ? t("opp_btn_collapse") : adv?.text ? t("opp_btn_view") : t("opp_btn_action")}
                      </Button>
                      <button
                        onClick={() => setShareModal({
                          isOpen: true,
                          title: displayTitle,
                          whyNow: embed?.why_now ?? "",
                          profitLogic: embed?.profit_logic ?? "",
                          confidence: pct,
                          risks: embed?.risks ?? [],
                          actions: embed?.actions ?? [],
                        })}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-600 text-slate-400 hover:text-amber-400 hover:border-amber-500/50 transition-colors"
                      >
                        {t("opp_share")}
                      </button>
                    </div>

                  </div>
                </div>

                {/* Advisor panel - full width below card body */}
                {adv?.open && (
                  <div className="border-t border-slate-700/60">
                    <div className="flex items-center justify-between px-5 py-2.5 bg-slate-900/60">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">{t("opp_plan_title")}</span>
                      {!adv.loading && adv.text && (
                        <div className="flex items-center gap-2">
                          <button
                            className="text-xs text-slate-400 hover:text-slate-200 transition-colors px-2 py-1 rounded border border-slate-600 hover:border-slate-400"
                            onClick={() => {
                              const blob = new Blob([adv.text], { type: "text/markdown" });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = `${opp.opp_title.slice(0, 40).replace(/[^\w\u4e00-\u9fa5]/g, "_")}.md`;
                              a.click();
                              URL.revokeObjectURL(url);
                            }}
                          >{t("opp_download")}</button>
                          {todoSuccess[opp.id] ? (
                            <span className="text-xs text-emerald-400 font-semibold">{t("opp_added")}</span>
                          ) : (
                            <Button
                              size="sm"
                              className="h-6 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={async () => {
                                await fetch(`/api/opportunities/${opp.id}/action`, {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ action: "todo", advisor_notes: finalTextRefs.current[opp.id] }),
                                });
                                // Remove from view immediately after adding to todo
                                setTimeout(() => {
                                  setOpportunities((prev) => prev.filter((o) => o.id !== opp.id));
                                }, 800); // brief delay so user sees ✅ feedback
                                setTodoSuccess((prev) => ({ ...prev, [opp.id]: true }));
                              }}
                            >
                              {t("opp_add_todo")}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="px-5 py-4 max-h-[500px] overflow-y-auto">
                      {adv.loading && !adv.text && (
                        <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
                          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                          {t("opp_plan_loading")}
                        </div>
                      )}
                      <div className={PROSE}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{adv.text}</ReactMarkdown>
                        {adv.loading && adv.text && (
                          <span className="inline-block w-1.5 h-4 bg-purple-400 animate-pulse ml-0.5 align-middle" />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
          {opportunities.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <FlywheelLogo size={48} className="text-amber-400/40 animate-[spin_8s_linear_infinite] mb-4" />
              <p className="text-lg font-medium text-slate-400">{t("opp_empty_title")}</p>
              <p className="text-sm mt-1">{t("opp_empty_desc")}</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {shareModal?.isOpen && (
        <ShareCardModal
          isOpen={shareModal.isOpen}
          onClose={() => setShareModal(null)}
          title={shareModal.title}
          whyNow={shareModal.whyNow}
          profitLogic={shareModal.profitLogic}
          confidence={shareModal.confidence}
          risks={shareModal.risks}
          actions={shareModal.actions}
          userInviteCode={undefined}
        />
      )}
    </div>
  );
}

export default function OpportunitiesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full bg-slate-900"><span className="text-slate-400">...</span></div>}>
      <OpportunitiesContent />
    </Suspense>
  );
}
