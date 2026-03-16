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
    <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--border-subtle)" }}>
      <button
        className="flex items-center gap-1.5 text-xs transition-colors hover:text-[var(--text-secondary)]" style={{ color: "var(--text-muted)" }}
        onClick={() => onToggle(oppId, signalIds)}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.55a11 11 0 0114.08 0"/>
          <path d="M1.42 9a16 16 0 0121.16 0"/>
          <path d="M8.53 16.11a6 6 0 016.95 0"/>
          <circle cx="12" cy="20" r="1" fill="currentColor" stroke="none"/>
        </svg>
        <span>{signalIds.split(",").filter(Boolean).length} {t("opp_signals")}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${signalExpanded ? "rotate-180" : ""}`}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {signalExpanded && signalSources && (
        <div className="mt-2 space-y-1.5">
          {signalSources.map((sig) => (
            <div key={sig.id} className="flex items-center gap-2 text-xs">
              <Badge className={`${sourceBadgeColor(sig.source)} text-xs shrink-0`}>{sig.source}</Badge>
              <span className="" style={{ color: "var(--border)" }}>·</span>
              {sig.url ? (
                <a href={sig.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 truncate max-w-[50ch] transition-colors" style={{ color: "var(--text-secondary)" }}>
                  {sig.title?.length > 50 ? sig.title.slice(0, 50) + "…" : sig.title}
                </a>
              ) : (
                <span className="truncate max-w-[50ch]" style={{ color: "var(--text-secondary)" }}>{sig.title?.length > 50 ? sig.title.slice(0, 50) + "…" : sig.title}</span>
              )}
              <span className="" style={{ color: "var(--border)" }}>·</span>
              <span className="inline-flex items-center gap-0.5 text-orange-500 shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" strokeLinecap="round">
                  <path d="M12 2c0 0-5.5 6-5.5 11a5.5 5.5 0 0011 0C17.5 8 12 2 12 2z"/>
                </svg>
                {sig.heat_score}
              </span>
            </div>
          ))}
          {signalSources.length === 0 && (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t("opp_no_signal_data")}</p>
          )}
        </div>
      )}
      {signalExpanded && !signalSources && (
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{t("common_loading")}</p>
      )}
    </div>
  );
}
