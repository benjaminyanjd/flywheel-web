export interface SignalSource {
  id: number;
  source: string;
  title: string;
  url: string;
  heat_score: number;
}

export interface Opportunity {
  id: number;
  signal_ids: string;
  opp_window: string;
  opp_rank: number;
  opp_title: string;
  opp_url: string;
  opp_embed: string;
  opp_title_en: string | null;
  opp_embed_en: string | null;
  action: string;
  advisor_notes: string | null;
  cancel_reason: string | null;
  created_at: string;
  acted_at: string | null;
}

export interface AdvisorState {
  text: string;
  loading: boolean;
  open: boolean;
}

export const ACTION_BADGE_STYLES: Record<string, { cls: string }> = {
  todo:   { cls: "bg-blue-600/20 text-blue-300 border border-blue-600/40" },
  bias:   { cls: "bg-orange-600/20 text-orange-300 border border-orange-600/40" },
  action: { cls: "bg-green-600/20 text-green-300 border border-green-600/40" },
  done:   { cls: "bg-emerald-600/20 text-emerald-300 border border-emerald-600/40" },
  cancel: { cls: "bg-red-600/20 text-red-400 border border-red-600/40" },
};

export function sourceBadgeColor(source: string): string {
  const colors: Record<string, string> = {
    HackerNews: "bg-orange-600 text-orange-100",
    ProductHunt: "bg-red-600 text-red-100",
    GitHub: "bg-purple-600 text-purple-100",
    Reddit: "bg-blue-600 text-blue-100",
    RSS: "bg-gray-600 text-gray-100",
    KOL: "bg-yellow-600 text-yellow-100",
  };
  return colors[source] || "bg-slate-600 text-slate-100";
}
