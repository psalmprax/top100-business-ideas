#!/bin/bash

# Configuration
API_URL="http://localhost:7001"
ADMIN_SECRET="test-admin-secret-alaska"
PROTECTED_ROUTE="/api/v1/agents/list"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3QtYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzU3Mzg4ODh9.tg7ZhfUO6qqdAd1ImgdxcmkhM3PPJuTwQIubJScjLCU"

echo "--- 🛡️ AlphaAI Lockdown Verification Protocol ---"

# 1. Check initial status
echo "Step 1: Checking initial status..."
STATUS=$(curl -s -H "Authorization: Bearer $TOKEN" $API_URL/api/status)
IS_LOCKED=$(echo $STATUS | grep -o '"locked":true' || echo "false")

if [[ "$IS_LOCKED" == '"locked":true' ]]; then
    echo "⚠️ System is ALREADY locked. Attempting reset first..."
    curl -s -H "Authorization: Bearer $TOKEN" -X POST $API_URL/api/v1/panic/reset -H "Content-Type: application/json" -d "{\"adminSecret\": \"$ADMIN_SECRET\"}"
fi

echo "✅ System is NOMINAL."

# 2. Trigger Lockdown
echo "Step 2: Triggering Panic Word lockdown..."
PANIC_RES=$(curl -s -H "Authorization: Bearer $TOKEN" -X POST $API_URL/api/v1/panic -H "Content-Type: application/json" -d '{"reason": "E2E Functional Verification"}')
echo "Response: $PANIC_RES"

# 3. Verify Lockdown Enforcement
echo "Step 3: Verifying protected route enforcement..."
HTTP_CODE=$(curl -s -H "Authorization: Bearer $TOKEN" -o /dev/null -w "%{http_code}" $API_URL$PROTECTED_ROUTE)
if [ "$HTTP_CODE" -eq 503 ]; then
    echo "✅ SUCCESS: Protected route returned 503 (Service Unavailable)."
else
    echo "❌ FAILURE: Protected route returned $HTTP_CODE instead of 503."
fi

# 4. Verify Unauthorized Reset
echo "Step 4: Attempting unauthorized reset..."
RESET_FAIL_CODE=$(curl -s -H "Authorization: Bearer $TOKEN" -o /dev/null -w "%{http_code}" -X POST $API_URL/api/v1/panic/reset -H "Content-Type: application/json" -d '{"adminSecret": "wrong-secret"}')
if [ "$RESET_FAIL_CODE" -eq 403 ]; then
    echo "✅ SUCCESS: Unauthorized reset returned 403 (Forbidden)."
else
    echo "❌ FAILURE: Unauthorized reset returned $RESET_FAIL_CODE instead of 403."
fi

# 5. Verify Authorized Reset
echo "Step 5: Attempting authorized reset (Alaska Protocol)..."
RESET_SUCCESS_RES=$(curl -s -H "Authorization: Bearer $TOKEN" -X POST $API_URL/api/v1/panic/reset -H "Content-Type: application/json" -d "{\"adminSecret\": \"$ADMIN_SECRET\"}")
echo "Response: $RESET_SUCCESS_RES"

# 6. Final Status Check
echo "Step 6: Verifying final system status..."
FINAL_STATUS=$(curl -s -H "Authorization: Bearer $TOKEN" $API_URL/api/status)
IS_LOCKED_FINAL=$(echo $FINAL_STATUS | grep -o '"locked":true' || echo "false")

if [[ "$IS_LOCKED_FINAL" == "false" ]]; then
    echo "✅ SUCCESS: System is back online."
else
    echo "❌ FAILURE: System remains locked."
fi

echo "--- Verification Complete ---"
