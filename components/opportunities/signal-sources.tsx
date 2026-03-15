"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import type { TKey } from "@/lib/i18n";
import { sourceBadgeColor, type SignalSource } from "./types";

interface SignalSourcesProps {
  oppId: number;
  signalIds: string;
  signalExpanded: boolean;
  signalSources: SignalSource[] | undefined;
  onToggle: (oppId: number, signalIds: string) => void;
  t: (key: TKey) => string;
}

export function SignalSourcesSection({ oppId, signalIds, signalExpanded, signalSources, onToggle, t }: SignalSourcesProps) {
  if (!signalIds) return null;

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <button
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        onClick={() => onToggle(oppId, signalIds)}
      >
        <span>📡</span>
        <span>{signalIds.split(",").filter(Boolean).length} {t("opp_signals")}</span>
        <span className={`transition-transform duration-200 ${signalExpanded ? "rotate-180" : ""}`}>▾</span>
      </button>
      {signalExpanded && signalSources && (
        <div className="mt-2 space-y-1.5">
          {signalSources.map((sig) => (
            <div key={sig.id} className="flex items-center gap-2 text-xs">
              <Badge className={`${sourceBadgeColor(sig.source)} text-xs shrink-0`}>{sig.source}</Badge>
              <span className="text-gray-300">·</span>
              {sig.url ? (
                <a href={sig.url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-500 truncate max-w-[50ch] transition-colors">
                  {sig.title?.length > 50 ? sig.title.slice(0, 50) + "…" : sig.title}
                </a>
              ) : (
                <span className="text-gray-600 truncate max-w-[50ch]">{sig.title?.length > 50 ? sig.title.slice(0, 50) + "…" : sig.title}</span>
              )}
              <span className="text-gray-300">·</span>
              <span className="text-orange-500 shrink-0">🔥{sig.heat_score}</span>
            </div>
          ))}
          {signalSources.length === 0 && (
            <p className="text-xs text-gray-400">{t("opp_no_signal_data")}</p>
          )}
        </div>
      )}
      {signalExpanded && !signalSources && (
        <p className="text-xs text-gray-400 mt-1">{t("common_loading")}</p>
      )}
    </div>
  );
}
