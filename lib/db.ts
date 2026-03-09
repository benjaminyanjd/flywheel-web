import Database from "better-sqlite3";
import path from "path";

const DB_PATH =
  process.env.FLYWHEEL_DB_PATH ||
  path.join(process.env.HOME || "", "Projects/flywheel-bot/flywheel.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH, { readonly: false });
    _db.pragma("journal_mode = WAL");
  }
  return _db;
}

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

export interface Opportunity {
  id: number;
  signal_ids: string | null;
  opp_window: string | null;
  opp_rank: number | null;
  opp_title: string | null;
  opp_url: string | null;
  opp_embed: string | null;
  action: string;
  cancel_reason: string | null;
  created_at: string;
  acted_at: string | null;
}

export interface Conversation {
  id: number;
  type: string;
  input_summary: string | null;
  output: string | null;
  signal_ids: string | null;
  window: string | null;
  created_at: string;
}
