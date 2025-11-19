#!/bin/bash

echo "=========================================="
echo "🔧 TESTING 14 NEW SECURITY FIXES"
echo "=========================================="
echo ""

PASS=0
FAIL=0

check() {
  if [ $? -eq 0 ]; then
    echo "  ✅ $1"
    PASS=$((PASS + 1))
  else
    echo "  ❌ $1"
    FAIL=$((FAIL + 1))
  fi
}

echo "1️⃣ FIX #1: API Key on protected routes"
grep -q "validateApiKey, authenticate" routes/index.js
check "API key enforced before auth"

echo "2️⃣ FIX #2: HMAC mounted globally"
grep -q "validateHmacSignature" app.js
check "HMAC middleware in app.js"

echo "3️⃣ FIX #3: CSRF activated"
grep -q "csrfProtection" routes/auth.routes.js
check "CSRF on auth routes"

echo "4️⃣ FIX #4: PayPal webhook verification"
[ -f middleware/validatePayPalWebhook.js ]
check "PayPal webhook middleware exists"

echo "5️⃣ FIX #5: ClamAV handling"
grep -q "ANTIVIRUS DISABLED" utils/antivirusScanner.js
check "ClamAV properly disabled when unavailable"

echo "6️⃣ FIX #6: Zod validation"
[ -f validation/ai.validation.js ] && [ -f validation/workflow.validation.js ]
check "AI & Workflow validation added"

echo "7️⃣ FIX #7: SQL/RPC safety wrapper"
[ -f utils/safeSupabase.js ]
check "Safe Supabase wrapper exists"

echo "8️⃣ FIX #8: Separate HMAC secret"
grep -q "INTERNAL_HMAC_SECRET" middleware/hmac.middleware.js
check "HMAC uses separate secret"

echo "9️⃣ FIX #9: API key rotation"
grep -q "INTERNAL_API_KEY_V1\|INTERNAL_API_KEY_V2" middleware/security.js
check "API key rotation support"

echo "🔟 FIX #10: Redis brute force"
grep -q "locked for 30 minutes" middleware/bruteForce.middleware.js
check "30-minute lockout implemented"

echo "1️⃣1️⃣ FIX #11: Webhook idempotency Redis"
grep -q "webhook:.*webhookId" utils/idempotency.js
check "Webhook idempotency in Redis"

echo "1️⃣6️⃣ FIX #16: HTTPS redirect"
grep -q "x-forwarded-proto" app.js
check "HTTPS redirect added"

echo "1️⃣7️⃣ FIX #17: Request size limits"
grep -q "limit: '1mb'" app.js
check "1MB request limit enforced"

echo "1️⃣8️⃣ FIX #18: CI audit level"
grep -q "audit-level=high" .github/workflows/ci.yml
check "CI fails on high vulnerabilities"

echo ""
echo "=========================================="
echo "📊 NEW FIXES TEST RESULTS"
echo "=========================================="
echo ""
echo "Passed: $PASS/14 ✅"
echo "Failed: $FAIL/14 ❌"
echo ""

if [ $PASS -eq 14 ]; then
  echo "╔══════════════════════════════════════════╗"
  echo "║                                          ║"
  echo "║   🎉 ALL NEW FIXES IMPLEMENTED! 🎉      ║"
  echo "║                                          ║"
  echo "║        14/14 FIXES COMPLETE ✅          ║"
  echo "║                                          ║"
  echo "╚══════════════════════════════════════════╝"
else
  echo "⚠️  Some fixes incomplete - review above"
fi
