#!/bin/bash
# Security acceptance tests for Flywheel API
BASE="http://localhost:3000"
PASS=0
FAIL=0

check() {
  local name="$1"
  local expected="$2"
  local actual="$3"
  if echo "$actual" | grep -qE "$expected"; then
    echo "PASS: $name"
    PASS=$((PASS+1))
  else
    echo "FAIL: $name (expected '$expected', got: $actual)"
    FAIL=$((FAIL+1))
  fi
}

echo "=== Flywheel Security Tests ==="
echo ""

# Fix 1: /api/translate requires auth
echo "[Fix 1] /api/translate - unauth should be blocked"
R=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/translate" \
  -H "Content-Type: application/json" \
  -d '{"texts":["hello"],"targetLang":"zh"}')
check "/api/translate unauth" "401|307" "$R"

# Fix 1b: input limit
echo "[Fix 1b] /api/translate - over 20 items blocked (unauth check)"
R=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/translate" \
  -H "Content-Type: application/json" \
  -d '{"texts":["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u"],"targetLang":"zh"}')
check "/api/translate >20 items blocked" "401|307" "$R"

# Fix 2: /api/signals requires auth
echo "[Fix 2] /api/signals - unauth should be blocked"
R=$(curl -s "$BASE/api/signals")
check "/api/signals unauth" "Unauthorized|401|sign-in" "$R"

# Fix 3: /api/signals/stream requires auth
echo "[Fix 3] /api/signals/stream - unauth should be blocked"
R=$(curl -s --max-time 3 "$BASE/api/signals/stream")
check "/api/signals/stream unauth" "Unauthorized|401|sign-in" "$R"

# Fix 4: /api/advisor requires auth
echo "[Fix 4] /api/advisor - unauth should be blocked"
R=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/advisor" \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}')
check "/api/advisor unauth" "401|307" "$R"

# Fix 5: IDOR /api/opportunities/[id]/signals
echo "[Fix 5] /api/opportunities/1/signals - unauth should be blocked"
R=$(curl -s "$BASE/api/opportunities/1/signals")
check "/api/opportunities/[id]/signals unauth" "Unauthorized|401|sign-in" "$R"

# Fix 6: /api/opportunities/[id]/action
echo "[Fix 6] /api/opportunities/1/action - unauth should be blocked"
R=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/opportunities/1/action" \
  -H "Content-Type: application/json" \
  -d '{"action":"act"}')
check "/api/opportunities/[id]/action unauth" "401|307" "$R"

# Fix 7: /api/invite/validate race condition (check auth protection)
echo "[Fix 7] /api/invite/validate - unauth should be blocked"
R=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/invite/validate" \
  -H "Content-Type: application/json" \
  -d '{"code":"TESTCODE"}')
check "/api/invite/validate unauth" "401|307" "$R"

# Fix 7b: transaction code inspection
echo "[Fix 7b] invite/validate uses DB transaction (code review)"
USES_TRANSACTION=$(grep -c "db.transaction" /home/benjamin/Projects/flywheel-web/app/api/invite/validate/route.ts 2>/dev/null)
if [ "$USES_TRANSACTION" -gt 0 ]; then
  echo "PASS: /api/invite/validate uses db.transaction ($USES_TRANSACTION occurrence)"
  PASS=$((PASS+1))
else
  echo "FAIL: /api/invite/validate missing db.transaction"
  FAIL=$((FAIL+1))
fi

# Fix 8: /api/advisor trial limit uses transaction (code review)
echo "[Fix 8] /api/advisor trial limit uses atomic transaction"
USES_TRANSACTION=$(grep -c "transaction\|atomic\|INCREMENT\|UPDATE.*WHERE" /home/benjamin/Projects/flywheel-web/app/api/advisor/route.ts 2>/dev/null)
if [ "$USES_TRANSACTION" -gt 0 ]; then
  echo "PASS: /api/advisor uses atomic update ($USES_TRANSACTION occurrences)"
  PASS=$((PASS+1))
else
  echo "FAIL: /api/advisor missing atomic trial counter"
  FAIL=$((FAIL+1))
fi

# Fix 9: /api/waitlist telegram dedup (silent dedup - no double DB insert)
echo "[Fix 9] /api/waitlist - telegram dedup (DB level)"
DEDUP_HANDLE="sectest_$(date +%s)"
curl -s -X POST "$BASE/api/waitlist" \
  -H "Content-Type: application/json" \
  -d "{\"telegram\":\"$DEDUP_HANDLE\",\"email\":\"test@test.com\"}" > /dev/null
curl -s -X POST "$BASE/api/waitlist" \
  -H "Content-Type: application/json" \
  -d "{\"telegram\":\"$DEDUP_HANDLE\",\"email\":\"test@test.com\"}" > /dev/null
COUNT=$(node -e "
const Database = require('better-sqlite3');
const db = new Database('/home/benjamin/Projects/flywheel-bot/flywheel.db');
const r = db.prepare(\"SELECT COUNT(*) as c FROM waitlist WHERE telegram=?\").get('$DEDUP_HANDLE');
console.log(r.c);
" 2>/dev/null)
echo "  Submitted twice, DB row count: $COUNT"
if [ "$COUNT" = "1" ]; then
  echo "PASS: /api/waitlist dedup (2 submits = 1 DB row)"
  PASS=$((PASS+1))
else
  echo "FAIL: /api/waitlist dedup (expected 1 row, got $COUNT)"
  FAIL=$((FAIL+1))
fi

# Cleanup test waitlist entry
node -e "
const Database = require('better-sqlite3');
const db = new Database('/home/benjamin/Projects/flywheel-bot/flywheel.db');
db.prepare(\"DELETE FROM waitlist WHERE telegram LIKE 'sectest_%'\").run();
" 2>/dev/null

echo ""
echo "=========================="
echo "PASS: $PASS | FAIL: $FAIL"
echo "=========================="

exit $FAIL
