// Re-export canonical types from lib/types.ts
export type { SignalSource, Opportunity, AdvisorState } from "@/lib/types";

// UI-specific constants and helpers

export const ACTION_BADGE_STYLES: Record<string, { cls: string }> = {
  todo:   { cls: "bg-blue-50 text-blue-600 border border-blue-200" },
  bias:   { cls: "bg-orange-50 text-orange-600 border border-orange-200" },
  action: { cls: "bg-green-50 text-green-600 border border-green-200" },
  done:   { cls: "bg-emerald-50 text-emerald-600 border border-emerald-200" },
  cancel: { cls: "bg-red-50 text-red-500 border border-red-200" },
};

export function sourceBadgeColor(source: string): string {
  const colors: Record<string, string> = {
    HackerNews: "bg-orange-50 text-orange-600 border border-orange-200",
    ProductHunt: "bg-red-50 text-red-600 border border-red-200",
    GitHub: "bg-purple-50 text-purple-600 border border-purple-200",
    Reddit: "bg-blue-50 text-blue-600 border border-blue-200",
    RSS: "bg-gray-100 text-gray-600 border border-gray-200",
    KOL: "bg-yellow-50 text-yellow-600 border border-yellow-200",
  };
  return colors[source] || "bg-gray-100 text-gray-600 border border-gray-200";
}
