// Canonical type definitions for Flywheel Web

export interface Signal {
  id: number;
  source: string;
  title: string;
  url: string | null;
  description: string | null;
  category: string | null;
  heat_score: number;
  monetize_score: number;
  window: string | null;
  created_at: string;
}

export interface SignalSource {
  id: number;
  source: string;
  title: string;
  url: string;
  heat_score: number;
}

export interface Opportunity {
  id: number;
  signal_ids: string | null;
  opp_window: string | null;
  opp_rank: number | null;
  opp_title: string | null;
  opp_url: string | null;
  opp_embed: string | null;
  opp_title_en: string | null;
  opp_embed_en: string | null;
  action: string;
  advisor_notes: string | null;
  cancel_reason: string | null;
  created_at: string;
  acted_at: string | null;
  action_count?: number;
}

export interface AdvisorState {
  text: string;
  loading: boolean;
  open: boolean;
}

export interface UserSettings {
  user_id: string;
  categories: string;
  scan_interval: number;
  notify_channel: string;
  telegram_chat_id: string | null;
  email: string | null;
  onboarding_done: number;
  last_scan_at: string | null;
  user_role: string | null;
  user_focus: string | null;
  opp_type: string | null;
  profit_source: string | null;
  core_skills: string | null;
  opp_horizon: string | null;
  risk_level: string | null;
  time_budget: string | null;
  opp_dislike: string | null;
}
