#!/bin/bash
set -e

echo "Starting E2E test services..."

# Install curl for health checks
apt-get update && apt-get install -y curl

# Start backend in background
cd /app/server/python
# Fix: uvicorn module path must be app.main:app, and we use VITE_API_PROXY_TARGET for frontend alignment
export VITE_API_PROXY_TARGET=http://localhost:7002
nohup python -m uvicorn app.main:app --host 0.0.0.0 --port 7002 > /tmp/backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to be ready
echo "Waiting for backend on port 7002..."
MAX_RETRIES=30
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:7002/health > /dev/null 2>&1; then
        echo "Backend ready!"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT+1))
    echo "Backend not ready yet ($RETRY_COUNT/$MAX_RETRIES)..."
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "Error: Backend failed to start. Last 20 lines of /tmp/backend.log:"
    tail -n 20 /tmp/backend.log
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# Start frontend in background  
cd /app/client
export VITE_API_URL=http://localhost:7002
export VITE_API_PROXY_TARGET=http://localhost:7002
export PORT=7000
nohup npm run dev -- --host 0.0.0.0 --port 7000 > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to be ready
echo "Waiting for frontend on port 7000..."
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:7000 > /dev/null 2>&1; then
        echo "Frontend ready!"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT+1))
    echo "Frontend not ready yet ($RETRY_COUNT/$MAX_RETRIES)..."
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "Error: Frontend failed to start. Last 20 lines of /tmp/frontend.log:"
    tail -n 20 /tmp/frontend.log
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    exit 1
fi

# Run Playwright tests
cd /app
npx playwright test client/src/test/sentinel-functional.spec.ts --project=chromium --reporter=list
TEST_EXIT=$?

# Cleanup
kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true

exit $TEST_EXIT
