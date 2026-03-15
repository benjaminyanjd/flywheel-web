"use client";

import { Suspense } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FlywheelLogo } from "@/components/flywheel-logo";
import { ShareCardModal } from "@/components/share-card-modal";
import { useOpportunities } from "@/components/opportunities/use-opportunities";
import { OpportunityFilters } from "@/components/opportunities/opportunity-filters";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";

function OpportunitiesContent() {
  const h = useOpportunities();

  if (h.loading) return (
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
      if (new Date(opp.created_at).toLocaleDateString("zh-TW") !== today) return false;
    }
    if (h.confFilter === "all") return true;
    const raw = (() => { try { return JSON.parse(opp.opp_embed); } catch { return {}; } })();
    const c = raw.confidence ?? 0;
    const pct = c <= 1 ? Math.round(c * 100) : Math.round(c * 10);
    if (h.confFilter === "high") return pct >= 70;
    if (h.confFilter === "mid") return pct >= 50 && pct < 70;
    if (h.confFilter === "low") return pct < 50;
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-slate-900 p-6">
      {h.showWelcome && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-4 flex items-start justify-between">
          <div>
            <p className="text-amber-400 font-medium">{h.t("opp_welcome_title")}</p>
            <p className="text-slate-400 text-sm mt-1">
              {h.t("opp_welcome_desc")}<br />
              {h.lang === "zh" ? "記得去 " : "Go to "}<a href="/settings" className="text-amber-400 underline">{h.lang === "zh" ? "設置頁面" : "Settings"}</a>{h.lang === "zh" ? " 綁定 Telegram，才能收到每日推送。" : " to bind Telegram for daily push."}
            </p>
          </div>
          <button onClick={() => h.setShowWelcome(false)} className="text-slate-500 hover:text-slate-300 ml-4">✕</button>
        </div>
      )}

      <OpportunityFilters
        dateFilter={h.dateFilter}
        setDateFilter={h.setDateFilter}
        confFilter={h.confFilter}
        setConfFilter={h.setConfFilter}
        count={h.opportunities.length}
        latestDate={h.opportunities[0]?.created_at}
        t={h.t}
      />

      {h.undoState && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 text-sm whitespace-nowrap">
          <span>{h.t("opp_undo_marked")} {ACTION_LABELS[h.undoState.action] ?? h.undoState.action} · <button onClick={h.handleUndo} className="text-indigo-400 font-medium hover:text-indigo-300">{h.t("opp_undo")}</button></span>
        </div>
      )}

      <ScrollArea className="flex-1 h-[calc(100vh-8rem)] md:h-auto">
        <div className="space-y-5 pr-4">
          {filtered.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opp={opp}
              lang={h.lang}
              isWelcome={h.isWelcome}
              isTop3={h.top3Ids.has(opp.id)}
              actionLoading={h.actionLoading}
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
          {h.opportunities.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <FlywheelLogo size={48} className="text-amber-400/40 animate-[spin_8s_linear_infinite] mb-4" />
              <p className="text-lg font-medium text-slate-400">{h.t("opp_empty_title")}</p>
              <p className="text-sm mt-1">{h.t("opp_empty_desc")}</p>
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
    <Suspense fallback={<div className="flex items-center justify-center h-full bg-slate-900"><span className="text-slate-400">...</span></div>}>
      <OpportunitiesContent />
    </Suspense>
  );
}
