#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
// 用法: node scripts/gen-invite-codes.js [數量]
// 例: node scripts/gen-invite-codes.js 20
const Database = require('better-sqlite3')
const DB_PATH = process.env.FLYWHEEL_DB_PATH || '/home/benjamin/Projects/flywheel-bot/flywheel.db'
const count = parseInt(process.argv[2] || '10', 10)

function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `${seg()}-${seg()}-${seg()}`
}

const db = new Database(DB_PATH)
// Schema: code (PK), created_by, used_by, used_at, is_used
const insert = db.prepare('INSERT OR IGNORE INTO invite_codes (code, created_by) VALUES (?, ?)')
const codes = []
for (let i = 0; i < count; i++) {
  const code = genCode()
  insert.run(code, 'admin')
  codes.push(code)
}
db.close()
console.log(`✅ 生成了 ${count} 個邀請碼：`)
codes.forEach(c => console.log(`  ${c}`))
