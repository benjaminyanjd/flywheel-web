"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { parseEmbed } from "@/lib/parse-embed";
import type { TKey } from "@/lib/i18n";
import { ACTION_BADGE_STYLES, type Opportunity, type AdvisorState, type SignalSource } from "./types";
import { SignalSourcesSection } from "./signal-sources";
import { AdvisorPanel } from "./advisor-panel";
import { track } from "@/lib/analytics";
import { CATEGORY_ICONS, getCategoryBadgeColor, LEGACY_CATEGORY_MAP } from "@/components/category-icons";

interface OpportunityCardProps {
  opp: Opportunity;
  lang: string;
  isWelcome: boolean;
  isTop3: boolean;
  defaultExpanded?: boolean;
  actionLoading: Record<string, boolean>;
  actionSuccess: Record<string, boolean>;
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
  opp, lang, isWelcome, isTop3, defaultExpanded = false, actionLoading, actionSuccess, adv, todoSuccess,
  signalExpanded, signalSources, finalText,
  onBtn, onAdvisor, onToggleSignal, onAddTodo, onShare, t,
}: OpportunityCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const rawEmbed = parseEmbed(opp.opp_embed ?? "");
  const useEn = lang === "en" && opp.opp_embed_en;
  const embed = useEn ? parseEmbed(opp.opp_embed_en!) ?? rawEmbed : rawEmbed;
  const rawTitle = (useEn && opp.opp_title_en ? opp.opp_title_en : opp.opp_title) ?? "";
  // #13: Extract confidence badge from title
  const confBadgeMatch = rawTitle.match(/[🔴🟡🟢]\s*(高置信|中置信|低置信)/);
  const confBadgeLabel = confBadgeMatch?.[1] as "高置信" | "中置信" | "低置信" | undefined;
  const displayTitle = confBadgeMatch ? rawTitle.replace(confBadgeMatch[0], "").trim() : rawTitle;
  const confBadgeStyles: Record<string, { bg: string; color: string }> = {
    "高置信": { bg: "color-mix(in srgb, #ef4444 15%, transparent)", color: "#ef4444" },
    "中置信": { bg: "color-mix(in srgb, #eab308 15%, transparent)", color: "#eab308" },
    "低置信": { bg: "color-mix(in srgb, var(--signal) 15%, transparent)", color: "var(--signal)" },
  };
  const confidence = rawEmbed?.confidence ?? 0;
  const pct = confidence <= 1 ? Math.round(confidence * 100) : Math.round(confidence * 10);
  // IX13: confidence bar animation
  const [barWidth, setBarWidth] = useState(0);
  const barAnimatedRef = useRef(false);
  useEffect(() => {
    if (!barAnimatedRef.current) {
      barAnimatedRef.current = true;
      const t = setTimeout(() => setBarWidth(pct), 10);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const borderColor = pct >= 70
    ? "border-l-4 border-l-green-500"
    : pct >= 50
    ? "border-l-4 border-l-yellow-400"
    : "border-l-4 border-l-[var(--border)]";
  const cardOpacity = pct < 50 ? "opacity-60" : "";

  const confBadge = pct >= 70
    ? "bg-green-500/10 text-green-500 border border-green-500/30"
    : pct >= 50
    ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30"
    : "border text-[var(--text-muted)]";

  const ACTION_BADGE: Record<string, { label: string; cls: string }> = {
    todo:   { label: t("archive_status_todo"),   ...ACTION_BADGE_STYLES.todo },
    bias:   { label: t("archive_status_bias"),   ...ACTION_BADGE_STYLES.bias },
    action: { label: t("archive_status_action"), ...ACTION_BADGE_STYLES.action },
    done:   { label: t("archive_status_done"),   ...ACTION_BADGE_STYLES.done },
    cancel: { label: t("archive_status_cancel"), ...ACTION_BADGE_STYLES.cancel },
  };
  const badge = ACTION_BADGE[opp.action];

  return (
    <Card
      className={`rounded-2xl overflow-hidden card-hover ${borderColor} ${cardOpacity}`}
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: "var(--border-subtle)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <div className="p-4">
        {isWelcome && isTop3 && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-green-500 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
            {t("opp_recommend")}
          </div>
        )}

        {/* Header — clickable to expand/collapse */}
        <button onClick={() => { if (!isExpanded) track("opp_expand", { opp_id: String(opp.id) }); setIsExpanded(!isExpanded) }} className="w-full text-left">
          <div className="flex items-start justify-between mb-3 min-w-0">
            <div className="flex items-start gap-2 pr-4 min-w-0 flex-wrap">
              <h3 className="font-semibold text-base leading-snug break-words" style={{ color: "var(--text-primary)" }}>
                {displayTitle}
              </h3>
              {/* Category badge */}
              {(() => {
                const rawCat = rawEmbed?.category ?? "";
                const cat = LEGACY_CATEGORY_MAP[rawCat] ?? rawCat;
                const i18nKey = `cat_${cat}` as TKey;
                const label = t(i18nKey);
                const colors = getCategoryBadgeColor(cat);
                const IconComp = CATEGORY_ICONS[cat];
                if (!cat) return null;
                return (
                  <span
                    className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full shrink-0 self-center border"
                    style={{ backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }}
                  >
                    {IconComp && <IconComp size={12} />}
                    {label}
                  </span>
                );
              })()}
              {confBadgeLabel && (
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0 self-center"
                  style={{ backgroundColor: confBadgeStyles[confBadgeLabel].bg, color: confBadgeStyles[confBadgeLabel].color }}
                >
                  {confBadgeLabel}
                </span>
              )}
              {(() => {
                const hoursAgo = (Date.now() - new Date(opp.created_at + " UTC").getTime()) / (1000 * 60 * 60);
                if (hoursAgo > 48) return (
                  <span className="rounded-full text-xs px-2 py-0.5 shrink-0 self-center" style={{ color: "var(--text-muted)", backgroundColor: "var(--bg-panel)" }}>
                    已過期
                  </span>
                );
                if (hoursAgo <= 24) return (
                  <span className="text-green-500 rounded-full text-xs px-2 py-0.5 shrink-0 self-center border border-green-500/30 bg-green-500/10">
                    24h 內
                  </span>
                );
                return null;
              })()}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs px-2 py-0.5 rounded border" style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}>
                {new Date(opp.created_at + " UTC").toLocaleDateString("zh-TW", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${confBadge}`} title="置信度基於信號密度、時效性、可執行性綜合評分">{pct}%</span>
              {(opp.action_count ?? 0) > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/30 hidden md:inline">👥 {opp.action_count}</span>
              )}
              {badge && opp.action !== "action" && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${badge.cls}`}>{badge.label}</span>
              )}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} style={{ color: "var(--text-muted)" }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </div>
        </button>

        {/* Body — collapsible with accordion animation (IX14) */}
        <div
          style={{
            display: "grid",
            gridTemplateRows: isExpanded && embed ? "1fr" : "0fr",
            transition: "grid-template-rows 200ms ease",
          }}
        >
        <div style={{ overflow: "hidden" }}>
        {embed && (
          <div className="expand-content">
            <div className="flex flex-col md:flex-row gap-0 text-sm">
              <div className="flex-1 space-y-4 md:pr-5 min-w-0">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: "var(--text-primary)" }}>
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-primary)" }}>{t("opp_why_now")}</p>
                  </div>
                  <p className="leading-relaxed" style={{ color: "var(--text-secondary)" }}>{embed.why_now}</p>
                </div>
                <Separator style={{ backgroundColor: "var(--border-subtle)" }} />
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: "#22c55e" }}>
                      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
                    </svg>
                    <p className="text-xs font-bold text-green-500 uppercase tracking-widest">{t("opp_profit")}</p>
                  </div>
                  <p className="leading-relaxed" style={{ color: "var(--text-secondary)" }}>{embed.profit_logic}</p>
                </div>
                {embed.risks.length > 0 && (
                  <>
                    <Separator style={{ backgroundColor: "var(--border-subtle)" }} />
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: "#ef4444" }}>
                          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        <p className="text-xs font-bold text-red-500 uppercase tracking-widest">{t("opp_risks")}</p>
                      </div>
                      <ul className="space-y-1">
                        {embed.risks.map((r, i) => (
                          <li key={i} className="flex gap-2 text-red-400">
                            <span className="shrink-0 mt-0.5">•</span><span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
                {/* #7 Deadline / window period */}
                {(() => {
                  const deadline = embed.deadline;
                  const estimatedTime = embed.estimated_time;
                  if (!deadline && !estimatedTime) return null;
                  let deadlineEl: React.ReactNode = null;
                  if (deadline) {
                    if (deadline === "ongoing") {
                      deadlineEl = <span className="text-xs px-2 py-0.5 rounded-full border" style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}>🔄 持續有效</span>;
                    } else {
                      const daysLeft = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                      if (daysLeft < 0) {
                        deadlineEl = <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/30">⚠️ 已過期</span>;
                      } else {
                        deadlineEl = <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/30">⏰ 窗口期：還剩 {daysLeft} 天</span>;
                      }
                    }
                  }
                  return (
                    <div className="flex items-center gap-2 flex-wrap">
                      {deadlineEl}
                      {estimatedTime && <span className="text-xs px-2 py-0.5 rounded-full border" style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}>⏱ 預估 {estimatedTime}</span>}
                      {(opp.action_count ?? 0) > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/30">👥 {opp.action_count} 人已行動</span>}
                    </div>
                  );
                })()}
                {(() => {
                  const { barColor, confLabel } = pct >= 70
                    ? { barColor: "bg-green-500", confLabel: t("opp_conf_high") }
                    : pct >= 50
                    ? { barColor: "bg-yellow-400", confLabel: t("opp_conf_mid") }
                    : { barColor: "bg-[var(--border)]", confLabel: t("opp_conf_low") };
                  return (
                    <div className="flex items-center gap-2 pt-1 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border-subtle)" }}>
                        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${barWidth}%`, transition: "width 500ms ease-out" }} />
                      </div>
                      <span className="text-xs shrink-0" style={{ color: "var(--text-muted)" }} title="置信度基於信號密度、時效性、可執行性綜合評分">{confLabel} {pct}%</span>
                    </div>
                  );
                })()}
              </div>

              <div className="w-full md:w-96 md:shrink-0 rounded-xl border p-5 md:ml-2 mt-4 md:mt-0"
                style={{ backgroundColor: "var(--bg-panel)", borderColor: "var(--border-subtle)" }}>
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: "var(--text-primary)" }}>
                    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                  </svg>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-primary)" }}>{t("opp_actions")}</p>
                </div>
                <ol className="space-y-3.5">
                  {embed.actions.map((a, i) => {
                    // #3 One-click: detect URLs in action text
                    const urlMatch = a.match(/https?:\/\/[^\s)]+/);
                    return (
                      <li key={i} className="flex gap-3" style={{ color: "var(--text-secondary)" }}>
                        <span className="shrink-0 w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold mt-0.5"
                          style={{ backgroundColor: "var(--border)", color: "var(--text-muted)" }}>
                          {i + 1}
                        </span>
                        <span className="leading-relaxed flex-1">
                          {a}
                          {urlMatch && (
                            <a
                              href={urlMatch[0]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-1.5 inline-flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded border transition-colors hover:bg-[var(--border-subtle)]"
                              style={{ color: "var(--signal)", borderColor: "var(--border)" }}
                              onClick={e => e.stopPropagation()}
                            >
                              ↗
                            </a>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>

            <SignalSourcesSection
              oppId={opp.id}
              signalIds={opp.signal_ids ?? ""}
              signalExpanded={signalExpanded}
              signalSources={signalSources}
              onToggle={onToggleSignal}
              t={t}
            />
          </div>
        )}
        </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t" style={{ borderColor: "var(--border-subtle)" }}>
          <Button
            variant="outline" size="sm"
            className={`text-xs transition-all rounded-xl btn-press ${opp.action === "todo" ? "border-blue-400 text-blue-500 bg-blue-500/10" : "hover:bg-[var(--border-subtle)]"}`}
            style={opp.action !== "todo" ? { borderColor: "var(--border)", color: "var(--text-secondary)" } : undefined}
            disabled={actionLoading[`${opp.id}-todo`] || actionSuccess[`${opp.id}-todo`]}
            onClick={() => { track("opp_todo", { opp_id: String(opp.id) }); onBtn(opp.id, "todo") }}
            title={t("opp_todo_title_prefix")}
          >
            {actionLoading[`${opp.id}-todo`] ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 border-2 border-[var(--border)] border-t-[var(--text-secondary)] rounded-full animate-spin" />
              </span>
            ) : actionSuccess[`${opp.id}-todo`] ? (
              <span className="flex items-center gap-1 text-green-500">✓</span>
            ) : <span className="flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>{t("opp_btn_todo")}</span>}
          </Button>
          <Button
            variant="outline" size="sm"
            className={`text-xs transition-all rounded-xl btn-press ${opp.action === "bias" ? "border-orange-400 text-orange-500 bg-orange-500/10" : "hover:bg-[var(--border-subtle)]"}`}
            style={opp.action !== "bias" ? { borderColor: "var(--border)", color: "var(--text-secondary)" } : undefined}
            disabled={actionLoading[`${opp.id}-bias`] || actionSuccess[`${opp.id}-bias`]}
            onClick={() => { track("opp_bias", { opp_id: String(opp.id) }); onBtn(opp.id, "bias") }}
            title={t("opp_bias_title_prefix")}
          >
            {actionLoading[`${opp.id}-bias`] ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 border-2 border-[var(--border)] border-t-[var(--text-secondary)] rounded-full animate-spin" />
              </span>
            ) : actionSuccess[`${opp.id}-bias`] ? (
              <span className="flex items-center gap-1 text-green-500">✓</span>
            ) : <span className="flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>{t("opp_btn_bias")}</span>}
          </Button>
          <Button
            size="sm"
            className="text-xs font-semibold px-4 py-2 rounded-xl transition-all btn-press"
            style={{
              backgroundColor: adv?.open ? "color-mix(in srgb, var(--signal) 80%, black)" : "var(--signal)",
              color: "var(--bg)",
            }}
            disabled={adv?.loading}
            onClick={() => { track("opp_action", { opp_id: String(opp.id) }); if (!adv?.text) track("opp_view_plan", { opp_id: String(opp.id) }); onAdvisor(opp) }}
            title={t("opp_action_title_prefix")}
          >
            {adv?.loading ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 border-2 border-[var(--bg)]/30 border-t-[var(--bg)] rounded-full animate-spin" />{t("opp_generating")}
              </span>
            ) : <span className="flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#f97316" }}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>{adv?.open ? t("opp_btn_collapse") : adv?.text ? t("opp_btn_view") : t("opp_btn_action")}</span>}
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
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition-all btn-press hover:bg-[var(--border-subtle)]"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            {t("opp_share")}
          </button>
        </div>
      </div>

      <AdvisorPanel
        adv={adv!}
        oppId={opp.id}
        oppTitle={opp.opp_title ?? ""}
        finalText={finalText}
        todoSuccess={todoSuccess}
        onAddTodo={onAddTodo}
        t={t}
      />
    </Card>
  );
});
