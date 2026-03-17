import Database from "better-sqlite3";
import path from "path";

// Re-export types for backward compatibility
export type { Signal, Opportunity, UserSettings } from "@/lib/types";

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
      categories        TEXT DEFAULT '["kol","crypto_news","onchain","ai_tech","community","alpha"]',
      scan_interval     INTEGER DEFAULT 60,
      notify_channel    TEXT DEFAULT 'none',
      telegram_chat_id  TEXT,
      email             TEXT,
      onboarding_done   INTEGER DEFAULT 0,
      last_scan_at      DATETIME
    );

    -- Invite codes are managed via DB directly, not seeded here
  `);

  // User preferences columns
  for (const col of [
    'user_role TEXT DEFAULT NULL', 'user_focus TEXT DEFAULT NULL', 'opp_type TEXT DEFAULT NULL',
    'profit_source TEXT DEFAULT NULL', 'core_skills TEXT DEFAULT NULL', 'opp_horizon TEXT DEFAULT NULL',
    'risk_level TEXT DEFAULT NULL', 'time_budget TEXT DEFAULT NULL',
    'opp_dislike TEXT DEFAULT NULL',
  ]) {
    try {
      db.exec(`ALTER TABLE user_settings ADD COLUMN ${col}`);
    } catch (_) {
      // Column already exists, ignore
    }
  }

  // T-02: Add user_id to opportunity_actions for multi-user data isolation
  try {
    db.exec(`ALTER TABLE opportunity_actions ADD COLUMN user_id TEXT DEFAULT "system"`);
  } catch (_) {
    // Column already exists, ignore
  }

  // T-03: Add user_id to conversations for per-user rate limiting
  try {
    db.exec(`ALTER TABLE conversations ADD COLUMN user_id TEXT DEFAULT "system"`);
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
