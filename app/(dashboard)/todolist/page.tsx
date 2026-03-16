"use client";

import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/toast";
import { TodoListIcon, OpportunityIcon } from "@/components/icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import { useT } from "@/lib/i18n";
import { FlywheelLogo } from "@/components/flywheel-logo";
import remarkGfm from "remark-gfm";
import { PROSE_CLASS } from "@/lib/prose-class";
import { parseEmbed, type EmbedData } from "@/lib/parse-embed";
import { readSSEStream } from "@/lib/sse";

interface TodoItem {
  id: number;
  opp_title: string;
  opp_embed: string;
  advisor_notes: string | null;
  created_at: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TodolistPage() {
  const { t } = useT();
  const toast = useToast();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({});
  const [advisorMap, setAdvisorMap] = useState<Record<number, { text: string; loading: boolean }>>({});
  const [outcomeForm, setOutcomeForm] = useState<{id: number, amount: string, note: string} | null>(null);
  const abortRefs = useRef<Record<number, AbortController>>({});

  useEffect(() => {
    fetch("/api/todolist")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTodos(data);
        else if (data.todos) setTodos(data.todos);
      })
      .catch(() => {/* loading failed, UI shows empty state */})
      .finally(() => setLoading(false));
  }, []);

  async function handleDone(id: number) {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await fetch(`/api/opportunities/${id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "done" }),
      });
      setTodos((prev) => prev.filter((t) => t.id !== id));
      toast(t("todo_done") || "已完成", "success");
    } catch {
      // action failed silently; item remains in list
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  }

  async function generateAdvisor(todo: TodoItem) {
    setAdvisorMap((p) => ({ ...p, [todo.id]: { text: "", loading: true } }));
    abortRefs.current[todo.id]?.abort();
    const ctrl = new AbortController();
    abortRefs.current[todo.id] = ctrl;
    try {
      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: `請針對以下機會給出行動建議: ${todo.opp_title}` }),
        signal: ctrl.signal,
      });
      if (!res.body) return;
      const acc = await readSSEStream(res.body, (text) => {
        setAdvisorMap((p) => ({ ...p, [todo.id]: { text, loading: true } }));
      });
      setAdvisorMap((p) => ({ ...p, [todo.id]: { text: acc, loading: false } }));
      // Save to DB
      await fetch(`/api/opportunities/${todo.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "todo", advisor_notes: acc }),
      });
      setTodos((prev) => prev.map((t) => t.id === todo.id ? { ...t, advisor_notes: acc } : t));
      setExpandedNotes((prev) => { const n = new Set(prev); n.add(todo.id); return n; });
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setAdvisorMap((p) => ({ ...p, [todo.id]: { text: "", loading: false } }));
      }
    }
  }

  function openCancelDialog(id: number) {
    setCancelTarget(id);
    setCancelReason("");
    setCancelDialogOpen(true);
  }

  async function handleCancel() {
    if (cancelTarget === null) return;
    setActionLoading((prev) => ({ ...prev, [cancelTarget]: true }));
    try {
      await fetch(`/api/opportunities/${cancelTarget}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel", cancel_reason: cancelReason }),
      });
      setTodos((prev) => prev.filter((t) => t.id !== cancelTarget));
      setCancelDialogOpen(false);
    } catch {
      // cancel action failed silently
    } finally {
      setActionLoading((prev) => ({ ...prev, [cancelTarget!]: false }));
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full p-6 animate-page-enter" style={{ backgroundColor: "var(--bg)" }}>
        <div className="h-7 skeleton-shimmer rounded w-32 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl p-5 border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-subtle)" }}>
              <div className="h-4 skeleton-shimmer rounded w-3/4 mb-3" />
              <div className="h-3 skeleton-shimmer rounded w-1/2 mb-3" />
              <div className="flex gap-2 mt-4">
                <div className="h-8 skeleton-shimmer rounded w-20" />
                <div className="h-8 skeleton-shimmer rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 animate-page-enter" style={{ backgroundColor: "var(--bg)" }}>
      <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>{t("todo_title")}</h1>

      {todos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 animate-page-enter">
          <div className="relative w-24 h-24 mb-6">
            <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-inner" style={{ backgroundColor: "var(--bg-panel)", border: "1px solid var(--border-subtle)" }}>
              <TodoListIcon size={40} style={{ color: "var(--signal)" }} />
            </div>
          </div>
          <p className="text-lg font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>{t("todo_title")}清單是空的</p>
          <p className="text-sm text-center max-w-xs" style={{ color: "var(--text-muted)" }}>在機會頁面標記「待辦」，它就會出現在這裡</p>
          <a href="/opportunities" className="mt-4 flex items-center gap-2 text-xs px-4 py-2.5 rounded-xl font-semibold transition-all btn-press hover:opacity-90" style={{ backgroundColor: "var(--signal)", color: "var(--bg)" }}>
            <OpportunityIcon size={14} />
            {t("todo_title") === "待辦清單" ? "去看機會" : "View Opportunities"} →
          </a>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="space-y-5 pr-4">
            {todos.map((todo) => {
              const embed = parseEmbed(todo.opp_embed);
              const confidence = embed?.confidence ?? 0;
              const confidencePct = confidence <= 1 ? Math.round(confidence * 100) : Math.round(confidence * 10);
              const borderColor = confidencePct >= 70 ? "border-l-4 border-l-green-500" : confidencePct >= 50 ? "border-l-4 border-l-yellow-400" : "border-l-4 border-l-[var(--border)]";
              const confBadge = confidencePct >= 70
                ? "bg-green-500/10 text-green-500 border border-green-500/30"
                : confidencePct >= 50
                ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30"
                : "border text-[var(--text-muted)] bg-[var(--bg-panel)]";

              return (
                <Card key={todo.id} className={`rounded-2xl overflow-hidden card-hover ${borderColor}`} style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
                  <div className="p-5">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="font-semibold text-base leading-snug pr-4" style={{ color: "var(--text-primary)" }}>
                          {todo.opp_title}
                        </h3>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${confBadge}`}>
                            {confidencePct}%
                          </span>
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>{formatDate(todo.created_at)}</span>
                        </div>
                      </div>

                      {embed && (
                        <div className="flex flex-col md:flex-row gap-0 text-sm">
                          {/* Left: main content */}
                          <div className="flex-1 space-y-4 md:pr-5 min-w-0">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-primary)" }}>{t("opp_section_whynow")}</p>
                              <p className="leading-relaxed" style={{ color: "var(--text-secondary)" }}>{embed.why_now}</p>
                            </div>

                            <Separator style={{ backgroundColor: "var(--border-subtle)" }} />

                            <div>
                              <p className="text-xs font-bold text-green-500 uppercase tracking-widest mb-1.5">{t("opp_section_profit")}</p>
                              <p className="leading-relaxed" style={{ color: "var(--text-secondary)" }}>{embed.profit_logic}</p>
                            </div>

                            {(embed.risks?.length ?? 0) > 0 && (
                              <>
                                <Separator style={{ backgroundColor: "var(--border-subtle)" }} />
                                <div>
                                  <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1.5">{t("opp_section_risks")}</p>
                                  <ul className="space-y-1">
                                    {embed.risks!.map((r, i) => (
                                      <li key={i} className="flex gap-2 text-red-400">
                                        <span className="shrink-0 mt-0.5">•</span>
                                        <span>{r}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </>
                            )}

                            {/* Footer */}
                            <div className="flex items-center gap-3 pt-1 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                              <Progress value={confidencePct} className="flex-1 h-1.5" />
                              <span className="text-xs font-semibold shrink-0" style={{ color: "var(--text-muted)" }}>
                                {t("opp_confidence")}{" "}
                                <span className={confidencePct >= 70 ? "text-green-600" : confidencePct >= 50 ? "text-yellow-600" : "text-red-500"}>
                                  {confidencePct}%
                                </span>
                              </span>
                            </div>
                          </div>

                          {/* Right: action list */}
                          <div className="w-full md:w-96 md:shrink-0 rounded-xl border p-5 md:ml-2 mt-4 md:mt-0" style={{ backgroundColor: "var(--bg-panel)", borderColor: "var(--border-subtle)" }}>
                            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-primary)" }}>{t("opp_section_actions")}</p>
                            <ol className="space-y-3.5">
                              {embed.actions?.map((a, i) => (
                                <li key={i} className="flex gap-3" style={{ color: "var(--text-secondary)" }}>
                                  <span className="shrink-0 w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold mt-0.5" style={{ backgroundColor: "var(--border)", color: "var(--text-muted)" }}>
                                    {i + 1}
                                  </span>
                                  <span className="leading-relaxed">{a}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      )}

                      {/* Advisor plan section */}
                      <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                        <div className="flex items-center gap-2 mb-3">
                          {(todo.advisor_notes || advisorMap[todo.id]?.text) ? (
                            <button
                              onClick={() => setExpandedNotes((prev) => {
                                const next = new Set(prev);
                                next.has(todo.id) ? next.delete(todo.id) : next.add(todo.id);
                                return next;
                              })}
                              className="flex items-center gap-2 flex-1 text-left group"
                            >
                              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-primary)" }}>{t("opp_plan_title")}</p>
                              <span className={`text-xs transition-transform duration-200 ml-1 ${expandedNotes.has(todo.id) ? "rotate-180" : ""}`}>▾</span>
                              <span className="text-xs ml-2" style={{ color: "var(--text-muted)" }}>{expandedNotes.has(todo.id) ? t("common_collapse") : t("common_expand")}</span>
                            </button>
                          ) : (
                            <p className="text-xs font-bold uppercase tracking-widest flex-1" style={{ color: "var(--text-primary)" }}>{t("opp_plan_title")}</p>
                          )}

                          {(todo.advisor_notes || advisorMap[todo.id]?.text) ? (
                            <button
                              className="text-xs transition-colors px-2 py-1 rounded border btn-press hover:text-[var(--text-primary)]" style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}
                              onClick={() => {
                                const blob = new Blob([todo.advisor_notes || advisorMap[todo.id]?.text || ""], { type: "text/markdown" });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = `${todo.opp_title.slice(0, 40).replace(/[^\w\u4e00-\u9fa5]/g, "_")}.md`;
                                a.click();
                                URL.revokeObjectURL(url);
                              }}
                            >↓ .md</button>
                          ) : advisorMap[todo.id]?.loading ? (
                            <span className="text-xs flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                              <span className="w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />{t("opp_generating")}
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              className="text-xs h-7 px-3 rounded-xl btn-press" style={{ backgroundColor: "var(--signal)", color: "var(--bg)" }}
                              onClick={() => generateAdvisor(todo)}
                            >
                              {t("todo_generate")}
                            </Button>
                          )}
                        </div>

                        {(todo.advisor_notes || advisorMap[todo.id]?.text) && expandedNotes.has(todo.id) && (
                          <div className={`${PROSE_CLASS} expand-content`}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {todo.advisor_notes || advisorMap[todo.id]?.text || ""}
                            </ReactMarkdown>
                            {advisorMap[todo.id]?.loading && (
                              <span className="inline-block w-1.5 h-4 bg-gray-400 animate-pulse ml-0.5 align-middle" />
                            )}
                          </div>
                        )}
                        {advisorMap[todo.id]?.loading && advisorMap[todo.id]?.text && (
                          <div className={PROSE_CLASS}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{advisorMap[todo.id].text}</ReactMarkdown>
                            <span className="inline-block w-1.5 h-4 bg-gray-400 animate-pulse ml-0.5 align-middle" />
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                        <Button
                          size="sm"
                          className="text-xs rounded-xl btn-press" style={{ backgroundColor: "var(--signal)", color: "var(--bg)" }}
                          disabled={actionLoading[todo.id]}
                          onClick={() => handleDone(todo.id)}
                        >
                          {actionLoading[todo.id] ? (
                            <span className="flex items-center gap-1.5">
                              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            </span>
                          ) : t("todo_done")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs rounded-xl btn-press"
                          disabled={actionLoading[todo.id]}
                          onClick={() => openCancelDialog(todo.id)}
                        >
                          {t("todo_cancel")}
                        </Button>
                        <button
                          onClick={() => setOutcomeForm(outcomeForm?.id === todo.id ? null : { id: todo.id, amount: "", note: "" })}
                          className="text-xs px-3 py-1.5 rounded-xl border transition-all btn-press hover:text-green-500 hover:border-green-500/30" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                        >
                          {t("todo_record")}
                        </button>
                      </div>

                      {outcomeForm?.id === todo.id && (
                        <div className="mt-3 p-3 rounded-xl border flex flex-col gap-2 expand-content" style={{ backgroundColor: "var(--bg-panel)", borderColor: "var(--border-subtle)" }}>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              placeholder={t("todo_amount")}
                              value={outcomeForm.amount}
                              onChange={e => setOutcomeForm(f => f ? {...f, amount: e.target.value} : null)}
                              className="flex-1 text-xs border rounded-lg px-2 py-1.5 input-focus-ring focus:outline-none" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                            />
                          </div>
                          <input
                            type="text"
                            placeholder={t("todo_note")}
                            value={outcomeForm.note}
                            onChange={e => setOutcomeForm(f => f ? {...f, note: e.target.value} : null)}
                            className="text-xs border rounded-lg px-2 py-1.5 input-focus-ring focus:outline-none" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setOutcomeForm(null)}
                              className="text-xs px-3 py-1 rounded hover:text-[var(--text-primary)] transition-colors" style={{ color: "var(--text-muted)" }}
                            >{t("todo_cancel_btn")}</button>
                            <button
                              onClick={async () => {
                                await fetch(`/api/opportunities/${todo.id}/outcome`, {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    amount: outcomeForm?.amount ? parseFloat(outcomeForm.amount) : null,
                                    note: outcomeForm?.note || null,
                                  }),
                                });
                                toast(t("todo_outcome_saved"));
                                setOutcomeForm(null);
                              }}
                              className="text-xs px-3 py-1 rounded-lg btn-press transition-colors" style={{ backgroundColor: "var(--signal)", color: "var(--bg)" }}
                            >{t("todo_save")}</button>
                          </div>
                        </div>
                      )}
                  </div>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      )}

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <DialogHeader>
            <DialogTitle style={{ color: "var(--text-primary)" }}>{t("todo_cancel_title")}</DialogTitle>
          </DialogHeader>
          <Textarea
            className="border rounded-xl input-focus-ring focus:outline-none" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)", color: "var(--text-primary)" }}
            placeholder={t("todo_cancel_placeholder")}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button
              variant="outline"
              className="border-gray-200 text-gray-600 rounded-xl btn-press"
              onClick={() => setCancelDialogOpen(false)}
            >
              {t("todo_cancel_back")}
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl btn-press"
              onClick={handleCancel}
              disabled={actionLoading[cancelTarget ?? -1]}
            >
              {actionLoading[cancelTarget ?? -1] ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </span>
              ) : t("todo_cancel_confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
