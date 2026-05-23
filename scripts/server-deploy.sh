#!/usr/bin/env bash
# Runs ON the server. Receives source via rsync, then builds and restarts.
# Place at: /var/www/politician/deploy.sh
# Run via: ssh root@<server> /var/www/politician/deploy.sh

set -euo pipefail

APP_DIR="/var/www/politician"
PM2_NAME="politician-api"
NODE_BIN="/root/.nvm/versions/node/v24.15.0/bin"
PM2="$NODE_BIN/pm2"
PNPM="$NODE_BIN/pnpm"

cd "$APP_DIR"

echo "--> Installing dependencies..."
"$PNPM" install --frozen-lockfile

echo "--> Building..."
"$PNPM" --filter @workspace/api-server run build

echo "--> Restarting PM2..."
"$PM2" restart "$PM2_NAME"
"$PM2" save

echo "=== Deploy complete ==="
"$PM2" list
