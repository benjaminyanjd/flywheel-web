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

// --- Multi-user additions ---

export interface InviteCode {
  code: string;
  created_by: string;
  used_by: string | null;
  used_at: string | null;
  is_used: number;
}

export interface UserSubscription {
  user_id: string;
  plan: string;
  trial_end: string | null;
  created_at: string;
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
}

export function runMigrations(): void {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS invite_codes (
      code        TEXT PRIMARY KEY,
      created_by  TEXT DEFAULT 'admin',
      used_by     TEXT,
      used_at     DATETIME,
      is_used     INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS user_subscriptions (
      user_id     TEXT PRIMARY KEY,
      plan        TEXT DEFAULT 'pending',
      trial_end   DATETIME,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      user_id           TEXT PRIMARY KEY,
      categories        TEXT DEFAULT '["ai_tech","crypto_policy","new_tools","overseas_trends","x_kol"]',
      scan_interval     INTEGER DEFAULT 60,
      notify_channel    TEXT DEFAULT 'none',
      telegram_chat_id  TEXT,
      email             TEXT,
      onboarding_done   INTEGER DEFAULT 0,
      last_scan_at      DATETIME
    );

    -- Invite codes are managed via DB directly, not seeded here
  `);

  // T-02: Add user_id to opportunity_actions for multi-user data isolation
  try {
    db.exec(`ALTER TABLE opportunity_actions ADD COLUMN user_id TEXT DEFAULT "system"`);
  } catch (_) {
    // Column already exists, ignore
  }

  // P2-1: Signal bookmarks table
  try {
    db.exec(`CREATE TABLE IF NOT EXISTS signal_bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      signal_id INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(signal_id, user_id)
    )`);
  } catch (_) {
    // Table already exists, ignore
  }
}
