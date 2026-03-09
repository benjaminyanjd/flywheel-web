"use client";

import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface OppEmbed {
  title: string;
  why_now: string;
  profit_logic: string;
  actions: string[];
  risks: string[];
  confidence: number;
}

interface Opportunity {
  id: number;
  signal_ids: string;
  opp_window: string;
  opp_rank: number;
  opp_title: string;
  opp_url: string;
  opp_embed: string;
  action: string;
  cancel_reason: string | null;
  created_at: string;
  acted_at: string | null;
}

function parseEmbed(raw: string): OppEmbed | null {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function actionBadge(action: string) {
  const map: Record<string, { label: string; className: string }> = {
    todo: { label: "待办", className: "bg-blue-600 text-blue-100" },
    bias: { label: "偏见", className: "bg-orange-600 text-orange-100" },
    action: { label: "行动", className: "bg-green-600 text-green-100" },
    done: { label: "完成", className: "bg-emerald-600 text-emerald-100" },
    cancel: { label: "取消", className: "bg-red-600 text-red-100" },
    missed: { label: "遗漏", className: "bg-gray-600 text-gray-100" },
  };
  const info = map[action] || { label: action, className: "bg-slate-600 text-slate-100" };
  return <Badge className={info.className}>{info.label}</Badge>;
}

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [advisorResponse, setAdvisorResponse] = useState("");
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [activeOppTitle, setActiveOppTitle] = useState("");
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    fetch("/api/opportunities")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setOpportunities(data);
        else if (data.opportunities) setOpportunities(data.opportunities);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleAction(id: number, action: string) {
    const key = `${id}-${action}`;
    setActionLoading((prev) => ({ ...prev, [key]: true }));
    try {
      await fetch(`/api/opportunities/${id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      setOpportunities((prev) =>
        prev.map((o) => (o.id === id ? { ...o, action } : o))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [key]: false }));
    }
  }

  async function handleActionWithAdvisor(opp: Opportunity) {
    await handleAction(opp.id, "action");
    setActiveOppTitle(opp.opp_title);
    setDrawerOpen(true);
    setAdvisorResponse("");
    setAdvisorLoading(true);

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: `请针对以下机会给出行动建议: ${opp.opp_title}` }),
        signal: controller.signal,
      });

      if (!res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        setAdvisorResponse(buffer);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") console.error(err);
    } finally {
      setAdvisorLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-900">
        <span className="text-slate-400">加载中...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 p-6">
      <h1 className="text-xl font-bold text-slate-100 mb-4">机会捕捉</h1>

      <ScrollArea className="flex-1">
        <div className="space-y-4 pr-4">
          {opportunities.map((opp) => {
            const embed = parseEmbed(opp.opp_embed);
            return (
              <Card
                key={opp.id}
                className="bg-slate-800 border-slate-700 p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-slate-100 font-semibold text-lg">
                    {opp.opp_title}
                  </h3>
                  {opp.action !== "missed" && actionBadge(opp.action)}
                </div>

                {embed && (
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-1">
                        为什么是现在
                      </h4>
                      <p className="text-sm text-slate-400">{embed.why_now}</p>
                    </div>

                    <Separator className="bg-slate-700" />

                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-1">
                        盈利逻辑
                      </h4>
                      <p className="text-sm text-slate-400">
                        {embed.profit_logic}
                      </p>
                    </div>

                    <Separator className="bg-slate-700" />

                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-1">
                        行动步骤
                      </h4>
                      <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
                        {embed.actions.map((a, i) => (
                          <li key={i}>{a}</li>
                        ))}
                      </ul>
                    </div>

                    {embed.risks.length > 0 && (
                      <>
                        <Separator className="bg-slate-700" />
                        <div>
                          <h4 className="text-sm font-medium text-slate-300 mb-1">
                            风险
                          </h4>
                          <ul className="list-disc list-inside text-sm text-red-400/80 space-y-1">
                            {embed.risks.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}

                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-1">
                        置信度
                      </h4>
                      <div className="flex items-center gap-3">
                        <Progress
                          value={embed.confidence * 100}
                          className="flex-1 h-2"
                        />
                        <span className="text-sm text-slate-400">
                          {Math.round(embed.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {opp.action === "missed" && (
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-700">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      disabled={actionLoading[`${opp.id}-todo`]}
                      onClick={() => handleAction(opp.id, "todo")}
                    >
                      {actionLoading[`${opp.id}-todo`] ? "..." : "📋待办"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      disabled={actionLoading[`${opp.id}-bias`]}
                      onClick={() => handleAction(opp.id, "bias")}
                    >
                      {actionLoading[`${opp.id}-bias`] ? "..." : "🗂偏见"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      disabled={actionLoading[`${opp.id}-action`]}
                      onClick={() => handleActionWithAdvisor(opp)}
                    >
                      {actionLoading[`${opp.id}-action`] ? "..." : "⚡行动"}
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
          {opportunities.length === 0 && (
            <div className="text-center text-slate-500 py-12">暂无机会</div>
          )}
        </div>
      </ScrollArea>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="bg-slate-900 border-slate-700 w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="text-slate-100">
              行动建议: {activeOppTitle}
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="mt-4 h-[calc(100vh-120px)]">
            <div className="text-sm text-slate-300 whitespace-pre-wrap pr-4">
              {advisorResponse}
              {advisorLoading && (
                <span className="inline-block w-2 h-4 bg-blue-400 animate-pulse ml-0.5" />
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
