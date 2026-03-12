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
import remarkGfm from "remark-gfm";

interface TodoItem {
  id: number;
  opp_title: string;
  opp_embed: string;
  advisor_notes: string | null;
  created_at: string;
}

interface EmbedData {
  why_now?: string;
  profit_logic?: string;
  actions?: string[];
  risks?: string[];
  confidence?: number;
}

function parseEmbed(raw: string): EmbedData | null {
  try {
    const d = typeof raw === "string" ? JSON.parse(raw) : raw;
    return {
      why_now: d.why_now || "",
      profit_logic: d.profit_logic || "",
      actions: Array.isArray(d.actions) ? d.actions : [],
      risks: Array.isArray(d.risks) ? d.risks : [],
      confidence: typeof d.confidence === "number" ? d.confidence : 0,
    };
  } catch {
    return null;
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("zh-CN", {
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
      .catch(console.error)
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
    } catch (err) {
      console.error(err);
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
        body: JSON.stringify({ message: `请针对以下机会给出行动建议: ${todo.opp_title}` }),
        signal: ctrl.signal,
      });
      if (!res.body) return;
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "", acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n"); buf = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try { const j = JSON.parse(line.slice(6)); if (j.text) acc += j.text; } catch {}
        }
        setAdvisorMap((p) => ({ ...p, [todo.id]: { text: acc, loading: true } }));
      }
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
      if ((e as Error).name !== "AbortError") console.error(e);
      setAdvisorMap((p) => ({ ...p, [todo.id]: { text: "", loading: false } }));
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
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [cancelTarget!]: false }));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-900">
        <span className="text-slate-400">{t("common_loading")}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 p-6">
      <h1 className="text-xl font-bold text-slate-100 mb-4">{t("todo_title")}</h1>

      {todos.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-slate-500">
          <span className="text-4xl mb-3">✅</span>
          <p>{t("todo_empty")}</p>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="space-y-5 pr-4">
            {todos.map((todo) => {
              const embed = parseEmbed(todo.opp_embed);
              const confidence = embed?.confidence ?? 0;
              const confidencePct = confidence <= 1 ? Math.round(confidence * 100) : Math.round(confidence * 10);
              const accentColor = confidencePct >= 70 ? "bg-emerald-500" : confidencePct >= 50 ? "bg-amber-500" : "bg-red-500";

              return (
                <Card key={todo.id} className="bg-slate-800 border-slate-700 overflow-hidden">
                  <div className="flex">
                    <div className={`w-1 shrink-0 ${accentColor}`} />
                    <div className="flex-1 p-5">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-slate-100 font-semibold text-base leading-snug pr-4">
                          📋 {todo.opp_title}
                        </h3>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${accentColor} text-white`}>
                            {confidencePct}%
                          </span>
                          <span className="text-xs text-slate-500">{formatDate(todo.created_at)}</span>
                        </div>
                      </div>

                      {embed && (
                        <div className="flex flex-col md:flex-row gap-0 text-sm">
                          {/* Left: main content */}
                          <div className="flex-1 space-y-4 md:pr-5 min-w-0">
                            <div>
                              <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1.5">{t("opp_section_whynow")}</p>
                              <p className="text-slate-300 leading-relaxed">{embed.why_now}</p>
                            </div>

                            <Separator className="bg-slate-700" />

                            <div>
                              <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1.5">{t("opp_section_profit")}</p>
                              <p className="text-slate-300 leading-relaxed">{embed.profit_logic}</p>
                            </div>

                            {(embed.risks?.length ?? 0) > 0 && (
                              <>
                                <Separator className="bg-slate-700" />
                                <div>
                                  <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1.5">{t("opp_section_risks")}</p>
                                  <ul className="space-y-1">
                                    {embed.risks!.map((r, i) => (
                                      <li key={i} className="flex gap-2 text-red-400/80">
                                        <span className="shrink-0 mt-0.5">•</span>
                                        <span>{r}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </>
                            )}

                            {/* Footer */}
                            <div className="flex items-center gap-3 pt-1 border-t border-slate-700/60">
                              <Progress value={confidencePct} className="flex-1 h-1.5" />
                              <span className="text-xs font-semibold text-slate-400 shrink-0">
                                {t("opp_confidence")}{" "}
                                <span className={confidencePct >= 70 ? "text-emerald-400" : confidencePct >= 50 ? "text-amber-400" : "text-red-400"}>
                                  {confidencePct}%
                                </span>
                              </span>
                            </div>
                          </div>

                          {/* Right: action list */}
                          <div className="w-full md:w-96 md:shrink-0 bg-slate-900/60 rounded-lg border border-slate-600/50 p-5 md:ml-2 mt-4 md:mt-0">
                            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">{t("opp_section_actions")}</p>
                            <ol className="space-y-3.5">
                              {embed.actions?.map((a, i) => (
                                <li key={i} className="flex gap-3 text-slate-300">
                                  <span className="shrink-0 w-6 h-6 rounded-full bg-slate-700 text-slate-400 text-xs flex items-center justify-center font-bold mt-0.5">
                                    {i + 1}
                                  </span>
                                  <span className="leading-relaxed">{a}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      )}

                      {/* Advisor plan section — always shown */}
                      <div className="mt-4 pt-4 border-t border-slate-700">
                        <div className="flex items-center gap-2 mb-3">
                          {/* Left: title + toggle (only when content exists) */}
                          {(todo.advisor_notes || advisorMap[todo.id]?.text) ? (
                            <button
                              onClick={() => setExpandedNotes((prev) => {
                                const next = new Set(prev);
                                next.has(todo.id) ? next.delete(todo.id) : next.add(todo.id);
                                return next;
                              })}
                              className="flex items-center gap-2 flex-1 text-left group"
                            >
                              <p className="text-xs font-bold text-purple-400 uppercase tracking-widest">{t("opp_plan_title")}</p>
                              <span className={`text-purple-400 text-xs transition-transform duration-200 ml-1 ${expandedNotes.has(todo.id) ? "rotate-180" : ""}`}>▾</span>
                              <span className="text-xs text-slate-500 ml-2">{expandedNotes.has(todo.id) ? t("common_collapse") : t("common_expand")}</span>
                            </button>
                          ) : (
                            <p className="text-xs font-bold text-purple-400 uppercase tracking-widest flex-1">{t("opp_plan_title")}</p>
                          )}

                          {/* Right: download or generate */}
                          {(todo.advisor_notes || advisorMap[todo.id]?.text) ? (
                            <button
                              className="text-xs text-slate-400 hover:text-slate-200 transition-colors px-2 py-1 rounded border border-slate-600 hover:border-slate-400"
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
                            <span className="text-xs text-slate-400 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />{t("opp_generating")}
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-7 px-3"
                              onClick={() => generateAdvisor(todo)}
                            >
                              {t("todo_generate")}
                            </Button>
                          )}
                        </div>

                        {/* Content */}
                        {(todo.advisor_notes || advisorMap[todo.id]?.text) && expandedNotes.has(todo.id) && (
                          <div className="prose prose-invert max-w-none text-sm leading-relaxed
                            [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-white [&_h1]:mt-5 [&_h1]:mb-3
                            [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-slate-100 [&_h2]:mt-5 [&_h2]:mb-2.5 [&_h2]:border-b-2 [&_h2]:border-slate-600 [&_h2]:pb-1.5
                            [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-slate-200 [&_h3]:mt-4 [&_h3]:mb-1.5
                            [&_p]:text-slate-300 [&_p]:leading-7 [&_p]:mb-3
                            [&_ul]:text-slate-300 [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ul]:mb-3
                            [&_ol]:text-slate-300 [&_ol]:space-y-1.5 [&_ol]:pl-5 [&_ol]:mb-3
                            [&_li]:leading-7
                            [&_strong]:text-white [&_strong]:font-bold
                            [&_code]:bg-slate-700/80 [&_code]:text-amber-300 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono [&_code]:border [&_code]:border-slate-600/50
                            [&_pre]:bg-slate-800 [&_pre]:border [&_pre]:border-slate-600 [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:my-3
                            [&_pre_code]:bg-transparent [&_pre_code]:border-0 [&_pre_code]:p-0 [&_pre_code]:text-slate-300 [&_pre_code]:text-xs
                            [&_table]:w-full [&_table]:border-collapse [&_table]:my-3 [&_table]:text-sm
                            [&_thead]:bg-slate-700/60
                            [&_th]:text-slate-200 [&_th]:font-semibold [&_th]:px-4 [&_th]:py-2.5 [&_th]:border [&_th]:border-slate-600 [&_th]:text-left
                            [&_td]:text-slate-300 [&_td]:px-4 [&_td]:py-2 [&_td]:border [&_td]:border-slate-700
                            [&_tr:nth-child(even)_td]:bg-slate-800/40
                            [&_hr]:border-slate-600 [&_hr]:my-4">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {todo.advisor_notes || advisorMap[todo.id]?.text || ""}
                            </ReactMarkdown>
                            {advisorMap[todo.id]?.loading && (
                              <span className="inline-block w-1.5 h-4 bg-purple-400 animate-pulse ml-0.5 align-middle" />
                            )}
                          </div>
                        )}
                        {/* Streaming content (auto-expand while generating) */}
                        {advisorMap[todo.id]?.loading && advisorMap[todo.id]?.text && (
                          <div className="prose prose-invert max-w-none text-sm leading-relaxed [&_p]:text-slate-300 [&_p]:leading-7">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{advisorMap[todo.id].text}</ReactMarkdown>
                            <span className="inline-block w-1.5 h-4 bg-purple-400 animate-pulse ml-0.5 align-middle" />
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-700">
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                          disabled={actionLoading[todo.id]}
                          onClick={() => handleDone(todo.id)}
                        >
                          {actionLoading[todo.id] ? "..." : t("todo_done")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-700 text-red-400 hover:bg-red-900/50 text-xs"
                          disabled={actionLoading[todo.id]}
                          onClick={() => openCancelDialog(todo.id)}
                        >
                          {t("todo_cancel")}
                        </Button>
                        <button
                          onClick={() => setOutcomeForm(outcomeForm?.id === todo.id ? null : { id: todo.id, amount: "", note: "" })}
                          className="text-xs px-3 py-1.5 rounded border border-slate-600 text-slate-400 hover:text-emerald-400 hover:border-emerald-600 transition-colors"
                        >
                          📈 記錄結果
                        </button>
                      </div>

                      {outcomeForm?.id === todo.id && (
                        <div className="mt-3 p-3 bg-slate-900 rounded-lg border border-slate-700 flex flex-col gap-2">
                          <div className="flex gap-2">
                            <input
                              type="number"
                              placeholder="盈虧金額 (USD，正=盈 負=虧)"
                              value={outcomeForm.amount}
                              onChange={e => setOutcomeForm(f => f ? {...f, amount: e.target.value} : null)}
                              className="flex-1 text-xs bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-slate-200 placeholder:text-slate-600"
                            />
                          </div>
                          <input
                            type="text"
                            placeholder="備注（可選）"
                            value={outcomeForm.note}
                            onChange={e => setOutcomeForm(f => f ? {...f, note: e.target.value} : null)}
                            className="text-xs bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-slate-200 placeholder:text-slate-600"
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setOutcomeForm(null)}
                              className="text-xs text-slate-500 px-3 py-1 rounded hover:text-slate-300"
                            >取消</button>
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
                                toast("✅ 結果已記錄");
                                setOutcomeForm(null);
                              }}
                              className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded"
                            >保存</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      )}

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-100">{t("todo_cancel_title")}</DialogTitle>
          </DialogHeader>
          <Textarea
            className="bg-slate-900 border-slate-600 text-slate-100 placeholder:text-slate-500"
            placeholder={t("todo_cancel_placeholder")}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button
              variant="outline"
              className="border-slate-600 text-slate-300"
              onClick={() => setCancelDialogOpen(false)}
            >
              {t("todo_cancel_back")}
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
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
