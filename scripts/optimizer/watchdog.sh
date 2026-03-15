#!/bin/bash
# Watchdog: 檢查 optimizer 上一輪是否完成，若超時未更新則告警
# 每小時在 optimizer 跑完後 45 分鐘運行（如 18:45, 19:45...）

STATE_FILE="/home/benjamin/Projects/flywheel-web/scripts/optimizer/state.json"
LOG_FILE="/home/benjamin/Projects/flywheel-web/scripts/optimizer/watchdog.log"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Watchdog running..." >> "$LOG_FILE"

# 取最後一次 run 的 timestamp
LAST_RUN=$(node -e "
const fs = require('fs');
const s = JSON.parse(fs.readFileSync('$STATE_FILE', 'utf8'));
const runs = s.runs || [];
if (runs.length === 0) { console.log('none'); process.exit(0); }
const last = runs[runs.length - 1];
console.log(last.timestamp || 'none');
" 2>/dev/null)

CURRENT_HOUR=$(date '+%H')
EXPECTED_HOURS=("18" "19" "20" "21" "22")

# 檢查當前小時是否應該有完成的 run
SHOULD_HAVE_RUN=false
for H in "${EXPECTED_HOURS[@]}"; do
  if [ "$CURRENT_HOUR" -ge "$H" ]; then
    SHOULD_HAVE_RUN=true
  fi
done

if [ "$SHOULD_HAVE_RUN" = "true" ] && [ "$LAST_RUN" = "none" ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: Expected a run but state shows no runs!" >> "$LOG_FILE"
  openclaw system event --text "⚠️ Flywheel Optimizer Watchdog: 預期有 optimizer run 但 state.json 沒有記錄，可能卡住了" --mode now 2>/dev/null
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] OK: Last run at $LAST_RUN" >> "$LOG_FILE"
fi
