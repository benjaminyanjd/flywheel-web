"use client";

import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/toast";
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
      <div className="flex flex-col h-full bg-white p-6">
        <div className="h-7 bg-gray-100 rounded w-32 mb-4 animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-1/2 mb-3" />
              <div className="flex gap-2 mt-4">
                <div className="h-8 bg-gray-100 rounded w-20" />
                <div className="h-8 bg-gray-100 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{t("todo_title")}</h1>

      {todos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <FlywheelLogo size={48} className="text-gray-300 animate-[spin_8s_linear_infinite] mb-4" />
          <p className="text-lg font-medium text-gray-500">{t("opp_empty_title")}</p>
          <p className="text-sm mt-1">{t("opp_empty_desc")}</p>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="space-y-5 pr-4">
            {todos.map((todo) => {
              const embed = parseEmbed(todo.opp_embed);
              const confidence = embed?.confidence ?? 0;
              const confidencePct = confidence <= 1 ? Math.round(confidence * 100) : Math.round(confidence * 10);
              const borderColor = confidencePct >= 70 ? "border-l-4 border-l-green-500" : confidencePct >= 50 ? "border-l-4 border-l-yellow-400" : "border-l-4 border-l-gray-200";
              const confBadge = confidencePct >= 70
                ? "bg-green-50 text-green-700 border border-green-200"
                : confidencePct >= 50
                ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                : "bg-gray-100 text-gray-500 border border-gray-200";

              return (
                <Card key={todo.id} className={`bg-white border border-gray-100 rounded-2xl overflow-hidden ${borderColor}`}>
                  <div className="p-5">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-gray-900 font-semibold text-base leading-snug pr-4">
                          {todo.opp_title}
                        </h3>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${confBadge}`}>
                            {confidencePct}%
                          </span>
                          <span className="text-xs text-gray-400">{formatDate(todo.created_at)}</span>
                        </div>
                      </div>

                      {embed && (
                        <div className="flex flex-col md:flex-row gap-0 text-sm">
                          {/* Left: main content */}
                          <div className="flex-1 space-y-4 md:pr-5 min-w-0">
                            <div>
                              <p className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-1.5">{t("opp_section_whynow")}</p>
                              <p className="text-gray-500 leading-relaxed">{embed.why_now}</p>
                            </div>

                            <Separator className="bg-gray-100" />

                            <div>
                              <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1.5">{t("opp_section_profit")}</p>
                              <p className="text-gray-500 leading-relaxed">{embed.profit_logic}</p>
                            </div>

                            {(embed.risks?.length ?? 0) > 0 && (
                              <>
                                <Separator className="bg-gray-100" />
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
                            <div className="flex items-center gap-3 pt-1 border-t border-gray-100">
                              <Progress value={confidencePct} className="flex-1 h-1.5" />
                              <span className="text-xs font-semibold text-gray-400 shrink-0">
                                {t("opp_confidence")}{" "}
                                <span className={confidencePct >= 70 ? "text-green-600" : confidencePct >= 50 ? "text-yellow-600" : "text-red-500"}>
                                  {confidencePct}%
                                </span>
                              </span>
                            </div>
                          </div>

                          {/* Right: action list */}
                          <div className="w-full md:w-96 md:shrink-0 bg-gray-50 rounded-xl border border-gray-100 p-5 md:ml-2 mt-4 md:mt-0">
                            <p className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">{t("opp_section_actions")}</p>
                            <ol className="space-y-3.5">
                              {embed.actions?.map((a, i) => (
                                <li key={i} className="flex gap-3 text-gray-600">
                                  <span className="shrink-0 w-6 h-6 rounded-full bg-gray-200 text-gray-500 text-xs flex items-center justify-center font-bold mt-0.5">
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
                      <div className="mt-4 pt-4 border-t border-gray-100">
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
                              <p className="text-xs font-bold text-gray-700 uppercase tracking-widest">{t("opp_plan_title")}</p>
                              <span className={`text-gray-400 text-xs transition-transform duration-200 ml-1 ${expandedNotes.has(todo.id) ? "rotate-180" : ""}`}>▾</span>
                              <span className="text-xs text-gray-400 ml-2">{expandedNotes.has(todo.id) ? t("common_collapse") : t("common_expand")}</span>
                            </button>
                          ) : (
                            <p className="text-xs font-bold text-gray-700 uppercase tracking-widest flex-1">{t("opp_plan_title")}</p>
                          )}

                          {(todo.advisor_notes || advisorMap[todo.id]?.text) ? (
                            <button
                              className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded border border-gray-200 hover:border-gray-400"
                              onClick={() => {
                                const blob = new Blob([todo.advisor_notes || advisorMap[todo.id]?.text || ""], { type: "text/markdown" });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = `${todo.opp_title.slice(0, 40).replace(/[^\w\u4e00-\u9fa5]/g, "_")}.md`;
                                a.click();
                                URL.revokeObjectURL(url);
                              }}
                            >⬇ .md</button>
                          ) : advisorMap[todo.id]?.loading ? (
                            <span className="text-xs text-gray-400 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />{t("opp_generating")}
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              className="bg-black hover:bg-gray-800 text-white text-xs h-7 px-3 rounded-xl"
                              onClick={() => generateAdvisor(todo)}
                            >
                              {t("todo_generate")}
                            </Button>
                          )}
                        </div>

                        {(todo.advisor_notes || advisorMap[todo.id]?.text) && expandedNotes.has(todo.id) && (
                          <div className={PROSE_CLASS}>
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
                      <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                        <Button
                          size="sm"
                          className="bg-black hover:bg-gray-800 text-white text-xs rounded-xl"
                          disabled={actionLoading[todo.id]}
                          onClick={() => handleDone(todo.id)}
                        >
                          {actionLoading[todo.id] ? "..." : t("todo_done")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-200 text-red-500 hover:bg-red-50 text-xs rounded-xl"
                          disabled={actionLoading[todo.id]}
                          onClick={() => openCancelDialog(todo.id)}
                        >
                          {t("todo_cancel")}
                        </Button>
                        <button
                          onClick={() => setOutcomeForm(outcomeForm?.id === todo.id ? null : { id: todo.id, amount: "", note: "" })}
                          className="text-xs px-3 py-1.5 rounded-xl border border-gray-200 text-gray-400 hover:text-green-600 hover:border-green-300 transition-colors"
                        >
                          {t("todo_record")}
                        </button>
                      </div>

                      {outcomeForm?.id === todo.id && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-2">
                          <div className="flex gap-2">
                            <input
                              type="number"
                              placeholder={t("todo_amount")}
                              value={outcomeForm.amount}
                              onChange={e => setOutcomeForm(f => f ? {...f, amount: e.target.value} : null)}
                              className="flex-1 text-xs bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-gray-900 placeholder:text-gray-400"
                            />
                          </div>
                          <input
                            type="text"
                            placeholder={t("todo_note")}
                            value={outcomeForm.note}
                            onChange={e => setOutcomeForm(f => f ? {...f, note: e.target.value} : null)}
                            className="text-xs bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-gray-900 placeholder:text-gray-400"
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setOutcomeForm(null)}
                              className="text-xs text-gray-400 px-3 py-1 rounded hover:text-gray-600"
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
                              className="text-xs bg-black hover:bg-gray-800 text-white px-3 py-1 rounded-lg"
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
        <DialogContent className="bg-white border border-gray-200 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">{t("todo_cancel_title")}</DialogTitle>
          </DialogHeader>
          <Textarea
            className="border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 rounded-xl"
            placeholder={t("todo_cancel_placeholder")}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button
              variant="outline"
              className="border-gray-200 text-gray-600 rounded-xl"
              onClick={() => setCancelDialogOpen(false)}
            >
              {t("todo_cancel_back")}
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
              onClick={handleCancel}
              disabled={actionLoading[cancelTarget ?? -1]}
            >
              {t("todo_cancel_confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
