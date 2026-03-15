"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { PROSE_CLASS } from "@/lib/prose-class";
import type { TKey } from "@/lib/i18n";
import type { AdvisorState } from "./types";

interface AdvisorPanelProps {
  adv: AdvisorState;
  oppId: number;
  oppTitle: string;
  finalText: string;
  todoSuccess: boolean;
  onAddTodo: (oppId: number) => void;
  t: (key: TKey) => string;
}

export function AdvisorPanel({ adv, oppId, oppTitle, finalText, todoSuccess, onAddTodo, t }: AdvisorPanelProps) {
  if (!adv?.open) return null;

  return (
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
                a.download = `${oppTitle.slice(0, 40).replace(/[^\w\u4e00-\u9fa5]/g, "_")}.md`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >{t("opp_download")}</button>
            {todoSuccess ? (
              <span className="text-xs text-emerald-400 font-semibold">{t("opp_added")}</span>
            ) : (
              <Button
                size="sm"
                className="h-6 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => onAddTodo(oppId)}
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
        <div className={PROSE_CLASS}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{adv.text}</ReactMarkdown>
          {adv.loading && adv.text && (
            <span className="inline-block w-1.5 h-4 bg-purple-400 animate-pulse ml-0.5 align-middle" />
          )}
        </div>
      </div>
    </div>
  );
}
