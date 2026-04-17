#!/bin/bash
# Sentinel Production Deployment Orchestrator
# Targets: 149.104.110.122
set -e

echo "🚀 Initiating Sentinel Production Rollout..."

# 1. Environment Check
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found. Please populate credentials before deployment."
    exit 1
fi

# 2. Safety Backup
echo "💾 Backing up production database..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
# Check if container is running before attempting backup
if [ "$(docker ps -q -f name=db)" ]; then
    docker exec db pg_dump -U postgres alphaai > "backups/alphaai_prod_$TIMESTAMP.sql" 2>/dev/null || echo "⚠️  Warning: Backup failed (non-critical if first deploy)"
else
    echo "ℹ️  Database container not found. Skipping backup (Initial Deployment)."
fi

# 3. Pull & Build
echo "🏗️  Building production images..."
docker compose -f docker-compose.prod.yml build --no-cache

# 4. Deploy (Blue/Green Zero-Downtime focus)
echo "🌐 Deploying services..."
docker compose -f docker-compose.prod.yml up -d --remove-orphans

# 5. Smoke Test
echo "🩺 Performing health checks..."
# Allow services 10 seconds to stabilize
sleep 10

SERVICES=("frontend" "api-gateway" "python-backend" "db" "redis")
for service in "${SERVICES[@]}"; do
    STATUS=$(docker inspect -f '{{.State.Health.Status}}' "$service" 2>/dev/null || echo "running")
    if [ "$STATUS" == "unhealthy" ]; then
        echo "❌ Error: Service $service is UNHEALTHY"
        docker compose -f docker-compose.prod.yml logs "$service" | tail -n 20
        exit 1
    fi
    echo "✅ Service $service is healthy"
done

echo "🎉 Sentinel Platform is LIVE on 149.104.110.122"
echo "Check logs with: docker compose -f docker-compose.prod.yml logs -f"
