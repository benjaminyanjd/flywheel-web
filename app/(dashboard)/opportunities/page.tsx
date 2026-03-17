"use client";

import React, { Suspense, useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FlywheelLogo } from "@/components/flywheel-logo";
import { OpportunityIcon } from "@/components/icons";
import { ShareCardModal } from "@/components/share-card-modal";
import { useOpportunities } from "@/components/opportunities/use-opportunities";
import { OpportunityFilters } from "@/components/opportunities/opportunity-filters";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";

function OpportunitiesContent() {
  const h = useOpportunities();
  const [visibleCount, setVisibleCount] = useState(10);

  if (h.loading) return (
    <div className="flex flex-col h-full p-6 animate-page-enter" style={{ backgroundColor: "var(--bg)" }}>
      <div className="h-7 skeleton-shimmer rounded w-40 mb-4" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl p-5 border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-subtle)" }}>
            <div className="h-4 skeleton-shimmer rounded w-2/3 mb-3" />
            <div className="h-3 skeleton-shimmer rounded w-full mb-2" />
            <div className="h-3 skeleton-shimmer rounded w-4/5 mb-4" />
            <div className="flex gap-2">
              <div className="h-8 skeleton-shimmer rounded w-20" />
              <div className="h-8 skeleton-shimmer rounded w-20" />
              <div className="h-8 skeleton-shimmer rounded w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ACTION_LABELS: Record<string, string> = {
    todo: h.t("archive_status_todo"),
    bias: h.t("archive_status_bias"),
    action: h.t("archive_status_action"),
    done: h.t("archive_status_done"),
    cancel: h.t("archive_status_cancel"),
  };

  const filtered = h.opportunities.filter((opp) => {
    if (h.effectiveDateFilter === "today") {
      const today = new Date().toLocaleDateString("zh-TW");
      if (new Date(opp.created_at + " UTC").toLocaleDateString("zh-TW") !== today) return false;
    }
    if (h.freshnessFilter !== "all") {
      const hoursAgo = (Date.now() - new Date(opp.created_at + " UTC").getTime()) / (1000 * 60 * 60);
      if (h.freshnessFilter === "fresh" && hoursAgo > 24) return false;
      if (h.freshnessFilter === "expired" && hoursAgo <= 48) return false;
    }
    if (h.confFilter === "all") return true;
    const raw = (() => { try { return JSON.parse(opp.opp_embed ?? ""); } catch { return {}; } })();
    const c = raw.confidence ?? 0;
    const pct = c <= 1 ? Math.round(c * 100) : Math.round(c * 10);
    if (h.confFilter === "high") return pct >= 70;
    if (h.confFilter === "mid") return pct >= 50 && pct < 70;
    if (h.confFilter === "low") return pct < 50;
    return true;
  });

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(10);
  }, [h.dateFilter, h.confFilter, h.freshnessFilter]);

  const visibleItems = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="flex flex-col h-full p-6 animate-page-enter" style={{ backgroundColor: "var(--bg)" }}>
      {h.showWelcome && (
        <div className="rounded-2xl p-4 mb-4 flex items-start justify-between animate-fade-in"
          style={{ backgroundColor: "rgba(255,184,0,0.08)", border: "1px solid rgba(255,184,0,0.3)" }}>
          <div>
            <p className="font-medium" style={{ color: "var(--signal-amber)" }}>{h.t("opp_welcome_title")}</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              {h.t("opp_welcome_desc")}<br />
              {h.lang === "zh" ? "記得去 " : "Go to "}
              <a href="/settings" style={{ color: "var(--signal-amber)" }} className="underline">
                {h.lang === "zh" ? "設置頁面" : "Settings"}
              </a>
              {h.lang === "zh" ? " 綁定 Telegram，才能收到每日推送。" : " to bind Telegram for daily push."}
            </p>
          </div>
          <button onClick={() => h.setShowWelcome(false)} className="ml-4 transition-colors" style={{ color: "var(--text-muted)" }}>✕</button>
        </div>
      )}

      <OpportunityFilters
        dateFilter={h.dateFilter}
        setDateFilter={h.setDateFilter}
        confFilter={h.confFilter}
        setConfFilter={h.setConfFilter}
        freshnessFilter={h.freshnessFilter}
        setFreshnessFilter={h.setFreshnessFilter}
        count={h.opportunities.length}
        latestDate={h.opportunities[0]?.created_at}
        lang={h.lang}
        t={h.t}
        onRefresh={h.handleRefresh}
        refreshing={h.refreshing}
      />

      {h.undoState && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 shadow-lg px-4 py-3 rounded-xl flex items-center gap-3 text-sm whitespace-nowrap animate-slide-in-right"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
          <span>{h.t("opp_undo_marked")} {ACTION_LABELS[h.undoState.action] ?? h.undoState.action} · <button onClick={h.handleUndo} className="text-blue-500 font-medium hover:text-blue-400 transition-colors">{h.t("opp_undo")}</button></span>
        </div>
      )}

      <ScrollArea className="flex-1 h-[calc(100vh-8rem)] md:h-auto">
        <div className="space-y-5 pr-4">
          {visibleItems.map((opp, idx) => (
            <OpportunityCard
              key={opp.id}
              opp={opp}
              lang={h.lang}
              isWelcome={h.isWelcome}
              isTop3={h.top3Ids.has(opp.id)}
              defaultExpanded={idx === 0}
              actionLoading={h.actionLoading}
              actionSuccess={h.actionSuccess}
              adv={h.advisorMap[opp.id]}
              todoSuccess={h.todoSuccess[opp.id] ?? false}
              signalExpanded={h.signalExpanded[opp.id] ?? false}
              signalSources={h.signalSources[opp.id]}
              finalText={h.finalTextRefs.current[opp.id] ?? ""}
              onBtn={h.handleBtn}
              onAdvisor={h.handleAdvisor}
              onToggleSignal={h.toggleSignalExpand}
              onAddTodo={h.handleAddTodo}
              onShare={h.setShareModal}
              t={h.t}
            />
          ))}
          {hasMore && (
            <div className="flex justify-center pt-2 pb-4">
              <button
                onClick={() => setVisibleCount(prev => prev + 10)}
                className="text-sm px-5 py-2.5 rounded-xl border transition-all hover:border-[var(--signal)] hover:text-[var(--signal)] btn-press"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-card)" }}
              >
                載入更多（還有 {filtered.length - visibleCount} 條）
              </button>
            </div>
          )}
          {filtered.length === 0 && h.opportunities.length > 0 && (
            <div className="flex flex-col items-center justify-center py-20 animate-page-enter">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: "var(--bg-panel)", border: "1px solid var(--border)" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ color: "var(--text-secondary)" }}>
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <p className="text-lg font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>{h.t("opp_empty_title")}</p>
              <p className="text-sm text-center max-w-xs" style={{ color: "var(--text-muted)" }}>{h.t("opp_empty_desc")}</p>
            </div>
          )}
          {h.opportunities.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 animate-page-enter">
              <div className="relative w-24 h-24 mb-6">
                <div className="w-24 h-24 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "var(--bg-panel)", border: "1px solid var(--border)" }}>
                  <FlywheelLogo size={40} className="animate-[spin_8s_linear_infinite]" style={{ color: "var(--signal)" }} />
                </div>
                <span className="absolute -top-1 -right-1">
                  <OpportunityIcon size={16} style={{ color: "var(--signal-amber)" }} />
                </span>
              </div>
              <p className="text-lg font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>{h.t("opp_empty_title")}</p>
              <p className="text-sm text-center max-w-xs" style={{ color: "var(--text-muted)" }}>{h.t("opp_empty_desc")}</p>
              <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>雷達正在掃描市場信號，請稍後回來查看</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {h.shareModal?.isOpen && (
        <ShareCardModal
          isOpen={h.shareModal.isOpen}
          onClose={() => h.setShareModal(null)}
          title={h.shareModal.title}
          whyNow={h.shareModal.whyNow}
          profitLogic={h.shareModal.profitLogic}
          confidence={h.shareModal.confidence}
          risks={h.shareModal.risks}
          actions={h.shareModal.actions}
          userInviteCode={undefined}
        />
      )}
    </div>
  );
}

export default function OpportunitiesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full" style={{ backgroundColor: "var(--bg)" }}><span style={{ color: "var(--text-muted)" }}>...</span></div>}>
      <OpportunitiesContent />
    </Suspense>
  );
}
