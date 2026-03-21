#!/bin/bash
set -e

echo "Starting E2E test services..."

# Install curl for health checks
apt-get update && apt-get install -y curl

# Start backend in background
cd /app/server/python
nohup python -m uvicorn main:app --host 0.0.0.0 --port 7002 > /tmp/backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to be ready
echo "Waiting for backend..."
for i in $(seq 1 30); do
    if curl -s http://localhost:7002/health > /dev/null 2>&1; then
        echo "Backend ready!"
        break
    fi
    sleep 2
done

# Start frontend in background  
cd /app/client
export VITE_API_URL=http://localhost:7002
export PORT=7000
nohup npm run dev -- --host 0.0.0.0 --port 7000 > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to be ready
echo "Waiting for frontend..."
for i in $(seq 1 30); do
    if curl -s http://localhost:7000 > /dev/null 2>&1; then
        echo "Frontend ready!"
        break
    fi
    sleep 2
done

# Run Playwright tests
cd /app
npx playwright test client/src/test/sentinel-functional.spec.ts --project=chromium --reporter=list
TEST_EXIT=$?

# Cleanup
kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true

exit $TEST_EXIT
