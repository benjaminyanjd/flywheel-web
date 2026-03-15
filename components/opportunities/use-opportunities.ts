"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useT } from "@/lib/i18n";
import { readSSEStream } from "@/lib/sse";
import type { Opportunity, AdvisorState } from "./types";

export function useOpportunities() {
  const { t, lang } = useT();
  const searchParams = useSearchParams();
  const isWelcome = searchParams.get("welcome") === "1";

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [confFilter, setConfFilter] = useState<"all" | "high" | "mid" | "low">("all");
  const [dateFilter, setDateFilter] = useState<"today" | "all">("today");
  const [advisorMap, setAdvisorMap] = useState<Record<number, AdvisorState>>({});
  const [todoSuccess, setTodoSuccess] = useState<Record<number, boolean>>({});
  const [signalSources, setSignalSources] = useState<Record<number, import("./types").SignalSource[]>>({});
  const [signalExpanded, setSignalExpanded] = useState<Record<number, boolean>>({});
  const [showWelcome, setShowWelcome] = useState(() => isWelcome);
  const [undoState, setUndoState] = useState<{ id: number; action: string; title: string; removedOpp?: Opportunity } | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRefs = useRef<Record<number, AbortController>>({});
  const finalTextRefs = useRef<Record<number, string>>({});
  const [shareModal, setShareModal] = useState<{
    isOpen: boolean;
    title: string;
    whyNow: string;
    profitLogic: string;
    confidence: number;
    risks: string[];
    actions: string[];
  } | null>(null);

  const top3Ids = useMemo(() => {
    if (!isWelcome) return new Set<number>();
    return new Set(opportunities.slice(0, 3).map((o) => o.id));
  }, [opportunities, isWelcome]);

  const effectiveDateFilter = useMemo(() => {
    if (dateFilter !== "today") return dateFilter;
    const today = new Date().toLocaleDateString("zh-TW");
    const hasToday = opportunities.some(o => new Date(o.created_at).toLocaleDateString("zh-TW") === today);
    return hasToday ? "today" : "all";
  }, [dateFilter, opportunities]);

  // Scroll position restore
  const scrollKey = "scroll_opportunities";
  useEffect(() => {
    const saved = sessionStorage.getItem(scrollKey);
    if (saved) {
      setTimeout(() => window.scrollTo({ top: parseInt(saved), behavior: "instant" }), 100);
      sessionStorage.removeItem(scrollKey);
    }
  }, []);
  useEffect(() => {
    const handleScroll = () => sessionStorage.setItem(scrollKey, String(window.scrollY));
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Welcome banner auto-dismiss
  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => setShowWelcome(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  // Fetch opportunities
  useEffect(() => {
    fetch("/api/opportunities")
      .then((r) => r.json())
      .then((d) => {
        const list: Opportunity[] = Array.isArray(d) ? d : (d.opportunities ?? []);
        const hidden = new Set(["bias", "todo", "action", "done", "cancel"]);
        setOpportunities(list.filter((o: Opportunity) => !hidden.has(o.action ?? "")));
        const initMap: Record<number, AdvisorState> = {};
        for (const opp of list) {
          if (opp.advisor_notes) {
            initMap[opp.id] = { text: opp.advisor_notes, loading: false, open: false };
            finalTextRefs.current[opp.id] = opp.advisor_notes;
          }
        }
        setAdvisorMap(initMap);
      })
      .catch((err) => console.error("opportunities/fetch:", err))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markAction = useCallback(async (id: number, action: string, extra?: Record<string, string>) => {
    await fetch(`/api/opportunities/${id}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
    setOpportunities((prev) => prev.map((o) => (o.id === id ? { ...o, action } : o)));
  }, []);

  const handleBtn = useCallback(async (id: number, action: string) => {
    const key = `${id}-${action}`;
    setActionLoading((p) => ({ ...p, [key]: true }));
    try {
      const opp = opportunities.find(o => o.id === id);
      await markAction(id, action);
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      setUndoState({ id, action, title: opp?.opp_title ?? "", removedOpp: opp });
      undoTimerRef.current = setTimeout(() => setUndoState(null), 3000);
      if (action === "bias" || action === "todo") {
        setOpportunities((prev) => prev.filter((o) => o.id !== id));
      }
    } catch (err) {
      console.error("opportunities/markAction:", err);
    } finally {
      setActionLoading((p) => ({ ...p, [key]: false }));
    }
  }, [opportunities, markAction]);

  const handleUndo = useCallback(() => {
    if (!undoState) return;
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    const { id, removedOpp } = undoState;
    setUndoState(null);
    if (removedOpp) {
      setOpportunities((prev) => {
        if (prev.some(o => o.id === id)) {
          return prev.map(o => o.id === id ? { ...o, action: removedOpp.action } : o);
        }
        return [{ ...removedOpp, action: removedOpp.action ?? "" }, ...prev];
      });
    }
  }, [undoState]);

  const setAdvisor = useCallback((id: number, patch: Partial<AdvisorState>) => {
    setAdvisorMap((p) => {
      const prev: AdvisorState = p[id] ?? { text: "", loading: false, open: false };
      return { ...p, [id]: { ...prev, ...patch } };
    });
  }, []);

  const handleAdvisor = useCallback(async (opp: Opportunity) => {
    const cur = advisorMap[opp.id];
    if (cur?.open && !cur?.loading) {
      setAdvisor(opp.id, { open: false });
      return;
    }
    if (cur?.text) {
      setAdvisor(opp.id, { open: true });
      return;
    }
    setAdvisor(opp.id, { open: true, loading: true, text: "" });
    finalTextRefs.current[opp.id] = "";
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
      if (acc) {
        markAction(opp.id, "action", { advisor_notes: acc }).catch((err) => console.error("opportunities/saveAdvisorNotes:", err));
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setAdvisor(opp.id, { loading: false });
      }
    }
  }, [advisorMap, setAdvisor, markAction]);

  const toggleSignalExpand = useCallback(async (oppId: number, signalIds: string) => {
    const wasExpanded = signalExpanded[oppId];
    setSignalExpanded((p) => ({ ...p, [oppId]: !wasExpanded }));
    if (!wasExpanded && !signalSources[oppId]) {
      try {
        const res = await fetch(`/api/opportunities/${oppId}/signals`);
        const data = await res.json();
        setSignalSources((p) => ({ ...p, [oppId]: data.signals ?? [] }));
      } catch (err) {
        console.error("opportunities/fetchSignals:", err);
      }
    }
  }, [signalExpanded, signalSources]);

  const handleAddTodo = useCallback(async (oppId: number) => {
    await fetch(`/api/opportunities/${oppId}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "todo", advisor_notes: finalTextRefs.current[oppId] }),
    });
    setTimeout(() => {
      setOpportunities((prev) => prev.filter((o) => o.id !== oppId));
    }, 800);
    setTodoSuccess((prev) => ({ ...prev, [oppId]: true }));
  }, []);

  return {
    opportunities,
    loading,
    actionLoading,
    confFilter,
    setConfFilter,
    dateFilter,
    setDateFilter,
    effectiveDateFilter,
    advisorMap,
    todoSuccess,
    signalSources,
    signalExpanded,
    showWelcome,
    setShowWelcome,
    undoState,
    shareModal,
    setShareModal,
    top3Ids,
    isWelcome,
    abortRefs,
    finalTextRefs,
    t,
    lang,
    handleBtn,
    handleUndo,
    handleAdvisor,
    toggleSignalExpand,
    handleAddTodo,
  };
}
