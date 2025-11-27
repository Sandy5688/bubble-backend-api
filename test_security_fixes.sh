#!/bin/bash

echo "🔒 TESTING SECURITY FIXES"
echo "========================"
echo ""

API_URL="https://bubble-backend-api-production.up.railway.app/api/v1"

# Test 1: HMAC Protection
echo "1️⃣ Testing HMAC Protection..."
echo "   Testing protected route (should fail without HMAC):"
RESULT=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/user/profile")
if [ "$RESULT" -eq 401 ] || [ "$RESULT" -eq 403 ]; then
  echo "   ✅ Protected route requires HMAC"
else
  echo "   ⚠️  Got status: $RESULT"
fi

echo ""
echo "   Testing public route (should succeed):"
RESULT=$(curl -s "$API_URL/auth/csrf-token" | jq -r '.csrfToken')
if [ "$RESULT" != "null" ] && [ -n "$RESULT" ]; then
  echo "   ✅ Public route accessible"
else
  echo "   ❌ Public route failed"
fi

# Test 2: Health Check
echo ""
echo "2️⃣ Testing Health Endpoint..."
HEALTH=$(curl -s "$API_URL/health" | jq -r '.status')
if [ "$HEALTH" = "healthy" ]; then
  echo "   ✅ API is healthy"
else
  echo "   ❌ API health check failed"
fi

# Test 3: Authentication with RLS
echo ""
echo "3️⃣ Testing Authentication (RLS context)..."
echo "   Register test user..."
REGISTER=$(curl -s -X POST "$API_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"sectest$(date +%s)@test.com\",\"password\":\"Test123\",\"firstName\":\"Sec\",\"lastName\":\"Test\"}")

TOKEN=$(echo $REGISTER | jq -r '.data.tokens.accessToken')
if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
  echo "   ✅ Registration successful"
  echo "   ✅ RLS context should be set (check logs)"
else
  echo "   ❌ Registration failed"
fi

echo ""
echo "========================"
echo "✅ Security tests complete"
echo ""
echo "Next steps:"
echo "1. Apply RLS migration (see docs/APPLY_RLS_MIGRATION.md)"
echo "2. Check Railway logs for RLS context warnings"
echo "3. Monitor fraud detection in KYC processing"
