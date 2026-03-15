"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { parseEmbed } from "@/lib/parse-embed";
import type { TKey } from "@/lib/i18n";
import { ACTION_BADGE_STYLES, type Opportunity, type AdvisorState, type SignalSource } from "./types";
import { SignalSourcesSection } from "./signal-sources";
import { AdvisorPanel } from "./advisor-panel";

interface OpportunityCardProps {
  opp: Opportunity;
  lang: string;
  isWelcome: boolean;
  isTop3: boolean;
  actionLoading: Record<string, boolean>;
  adv: AdvisorState | undefined;
  todoSuccess: boolean;
  signalExpanded: boolean;
  signalSources: SignalSource[] | undefined;
  finalText: string;
  onBtn: (id: number, action: string) => void;
  onAdvisor: (opp: Opportunity) => void;
  onToggleSignal: (oppId: number, signalIds: string) => void;
  onAddTodo: (oppId: number) => void;
  onShare: (data: { isOpen: boolean; title: string; whyNow: string; profitLogic: string; confidence: number; risks: string[]; actions: string[] }) => void;
  t: (key: TKey) => string;
}

export const OpportunityCard = React.memo(function OpportunityCard({
  opp, lang, isWelcome, isTop3, actionLoading, adv, todoSuccess,
  signalExpanded, signalSources, finalText,
  onBtn, onAdvisor, onToggleSignal, onAddTodo, onShare, t,
}: OpportunityCardProps) {
  const rawEmbed = parseEmbed(opp.opp_embed);
  const useEn = lang === "en" && opp.opp_embed_en;
  const embed = useEn ? parseEmbed(opp.opp_embed_en!) ?? rawEmbed : rawEmbed;
  const displayTitle = useEn && opp.opp_title_en ? opp.opp_title_en : opp.opp_title;
  const confidence = rawEmbed?.confidence ?? 0;
  const pct = confidence <= 1 ? Math.round(confidence * 100) : Math.round(confidence * 10);
  const accent = pct >= 70 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";
  const pctColor = pct >= 70 ? "text-emerald-400" : pct >= 50 ? "text-amber-400" : "text-red-400";

  const ACTION_BADGE: Record<string, { label: string; cls: string }> = {
    todo:   { label: t("archive_status_todo"),   ...ACTION_BADGE_STYLES.todo },
    bias:   { label: t("archive_status_bias"),   ...ACTION_BADGE_STYLES.bias },
    action: { label: t("archive_status_action"), ...ACTION_BADGE_STYLES.action },
    done:   { label: t("archive_status_done"),   ...ACTION_BADGE_STYLES.done },
    cancel: { label: t("archive_status_cancel"), ...ACTION_BADGE_STYLES.cancel },
  };
  const badge = ACTION_BADGE[opp.action];

  return (
    <Card className="bg-slate-800 border-slate-700 overflow-hidden">
      <div className="flex">
        <div className={`w-1 shrink-0 ${(Date.now() - new Date(opp.created_at).getTime()) > 24 * 60 * 60 * 1000 ? "bg-slate-600" : accent}`} />
        <div className="flex-1 p-5">

          {isWelcome && isTop3 && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-amber-400 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
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

          {/* Body */}
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
                    : { barColor: "bg-slate-500", confLabel: t("opp_conf_low") };
                  return (
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-700/60">
                      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-slate-400 shrink-0">{confLabel} {pct}%</span>
                    </div>
                  );
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

          <SignalSourcesSection
            oppId={opp.id}
            signalIds={opp.signal_ids}
            signalExpanded={signalExpanded}
            signalSources={signalSources}
            onToggle={onToggleSignal}
            t={t}
          />

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-700">
            <Button
              variant="outline" size="sm"
              className={`text-xs transition-colors ${opp.action === "todo" ? "border-blue-500 text-blue-300 bg-blue-900/20" : "border-slate-600 text-slate-300 hover:bg-slate-700"}`}
              disabled={actionLoading[`${opp.id}-todo`]}
              onClick={() => onBtn(opp.id, "todo")}
              title={t("opp_todo_title_prefix")}
            >
              {actionLoading[`${opp.id}-todo`] ? "..." : t("opp_btn_todo")}
            </Button>
            <Button
              variant="outline" size="sm"
              className={`text-xs transition-colors ${opp.action === "bias" ? "border-orange-500 text-orange-300 bg-orange-900/20" : "border-slate-600 text-slate-300 hover:bg-slate-700"}`}
              disabled={actionLoading[`${opp.id}-bias`]}
              onClick={() => onBtn(opp.id, "bias")}
              title={t("opp_bias_title_prefix")}
            >
              {actionLoading[`${opp.id}-bias`] ? "..." : t("opp_btn_bias")}
            </Button>
            <Button
              size="sm"
              className={`text-xs transition-colors ${adv?.open ? "bg-emerald-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}
              disabled={adv?.loading}
              onClick={() => onAdvisor(opp)}
              title={t("opp_action_title_prefix")}
            >
              {adv?.loading ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />{t("opp_generating")}
                </span>
              ) : adv?.open ? t("opp_btn_collapse") : adv?.text ? t("opp_btn_view") : t("opp_btn_action")}
            </Button>
            <button
              onClick={() => onShare({
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

      <AdvisorPanel
        adv={adv!}
        oppId={opp.id}
        oppTitle={opp.opp_title}
        finalText={finalText}
        todoSuccess={todoSuccess}
        onAddTodo={onAddTodo}
        t={t}
      />
    </Card>
  );
});
