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
    <div className="border-t" style={{ borderColor: "var(--border-subtle)" }}>
      <div className="flex items-center justify-between px-5 py-2.5" style={{ backgroundColor: "var(--bg-panel)" }}>
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border" style={{ color: "var(--text-secondary)", backgroundColor: "var(--bg-panel)", borderColor: "var(--border)" }}>{t("opp_plan_title")}</span>
        {!adv.loading && adv.text && (
          <div className="flex items-center gap-2">
            <button
              className="text-xs transition-colors px-2 py-1 rounded border hover:text-[var(--text-primary)]" style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}
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
              <span className="text-xs text-green-600 font-semibold">{t("opp_added")}</span>
            ) : (
              <Button
                size="sm"
                className="h-6 px-3 text-xs rounded-xl" style={{ backgroundColor: "var(--signal)", color: "var(--bg)" }}
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
          <div className="flex items-center gap-2 text-sm py-2" style={{ color: "var(--text-muted)" }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "var(--signal)" }} />
            {t("opp_plan_loading")}
          </div>
        )}
        <div className={PROSE_CLASS}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{adv.text}</ReactMarkdown>
          {adv.loading && adv.text && (
            <span className="inline-block w-1.5 h-4 animate-pulse ml-0.5 align-middle" style={{ backgroundColor: "var(--signal)" }} />
          )}
        </div>
      </div>
    </div>
  );
}
