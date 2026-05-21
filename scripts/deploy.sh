#!/usr/bin/env bash
set -euo pipefail

# Zero-downtime deploy script for Maryland Civic Hub
# Usage: ./scripts/deploy.sh
#
# This script:
# 1. Pulls latest code from main
# 2. Installs dependencies
# 3. Builds the project
# 4. Pushes DB schema changes
# 5. Swaps the running PM2 process to the new build (blue/green)
# 6. Cleans up the old process

APP_DIR="/opt/civic-hub"
ENV_FILE="$APP_DIR/.env"
PM2_NAME="civic-api"
NGINX_API_UPSTREAM="/etc/nginx/conf.d/api-upstream.conf"

BLUE_PORT=3001
GREEN_PORT=3002

cd "$APP_DIR"

# Load environment variables
set -a
source "$ENV_FILE"
set +a

# Determine which port is currently active (blue or green)
get_active_port() {
  local active
  active=$(ss -tlnp 2>/dev/null | grep -E ":${BLUE_PORT}\b" || true)
  if [ -n "$active" ]; then
    echo "$BLUE_PORT"
  else
    echo "$GREEN_PORT"
  fi
}

# Determine which port to deploy to (the inactive one)
get_inactive_port() {
  local active
  active=$(get_active_port)
  if [ "$active" -eq "$BLUE_PORT" ]; then
    echo "$GREEN_PORT"
  else
    echo "$BLUE_PORT"
  fi
}

ACTIVE_PORT=$(get_active_port)
NEW_PORT=$(get_inactive_port)

echo "=== Deploying Maryland Civic Hub ==="
echo "Active port: $ACTIVE_PORT"
echo "New port:    $NEW_PORT"

# Pull latest code
echo "--> Pulling latest code..."
git pull origin main

# Install dependencies
echo "--> Installing dependencies..."
pnpm install --frozen-lockfile

# Build everything
echo "--> Building project..."
pnpm run build

# Push DB schema changes
echo "--> Pushing database schema..."
pnpm --filter @workspace/db run push

# Start new instance on the inactive port
echo "--> Starting new instance on port $NEW_PORT..."
PORT="$NEW_PORT" node artifacts/api-server/dist/index.mjs &
NEW_PID=$!

# Wait for health check
echo "--> Waiting for health check on port $NEW_PORT..."
for i in {1..30}; do
  if curl -sf "http://localhost:${NEW_PORT}/api/health" > /dev/null 2>&1; then
    echo "    Health check passed"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "    Health check failed after 30s, killing new process..."
    kill "$NEW_PID" 2>/dev/null || true
    exit 1
  fi
  sleep 1
done

# Update nginx upstream to point to the new port
echo "--> Updating nginx upstream to port $NEW_PORT..."
sudo tee "$NGINX_API_UPSTREAM" > /dev/null << EOF
upstream civic_api {
    server 127.0.0.1:${NEW_PORT};
}
EOF
sudo nginx -t && sudo systemctl reload nginx

# Gracefully stop the old instance
if [ "$ACTIVE_PORT" -eq "$BLUE_PORT" ]; then
  OLD_PM2_NAME="${PM2_NAME}-blue"
  NEW_PM2_NAME="${PM2_NAME}-green"
else
  OLD_PM2_NAME="${PM2_NAME}-green"
  NEW_PM2_NAME="${PM2_NAME}-blue"
fi

# Start new PM2 process (so it survives SSH disconnect)
echo "--> Registering new process with PM2..."
PORT="$NEW_PORT" pm2 start "node artifacts/api-server/dist/index.mjs" --name "$NEW_PM2_NAME"
pm2 save

# Stop and delete old PM2 process
echo "--> Stopping old PM2 process ($OLD_PM2_NAME)..."
pm2 stop "$OLD_PM2_NAME" 2>/dev/null || true
pm2 delete "$OLD_PM2_NAME" 2>/dev/null || true
pm2 save

# Clean up any orphaned processes on the old port
OLD_PORT=$ACTIVE_PORT
if ss -tlnp 2>/dev/null | grep -qE ":${OLD_PORT}\b"; then
  echo "--> Cleaning up orphaned process on port $OLD_PORT..."
  fuser -k "${OLD_PORT}/tcp" 2>/dev/null || true
fi

echo "=== Deploy complete ==="
echo "API now serving on port $NEW_PORT"
