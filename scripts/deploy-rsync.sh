#!/usr/bin/env bash
# Deploy by rsyncing source to the server and building there.
# Pino embeds worker paths at build time, so we must build on the server.
#
# Usage:
#   SERVER_HOST=<ip-or-hostname> ./scripts/deploy-rsync.sh

set -euo pipefail

SERVER_HOST="${SERVER_HOST:-}"
SERVER_USER="${SERVER_USER:-root}"
SERVER_APP_DIR="${SERVER_APP_DIR:-/var/www/politician}"
PM2_NAME="${PM2_NAME:-politician-api}"
PM2="/root/.nvm/versions/node/v24.15.0/bin/pm2"
NODE="/root/.nvm/versions/node/v24.15.0/bin/node"
PNPM="/root/.nvm/versions/node/v24.15.0/bin/pnpm"

if [ -z "$SERVER_HOST" ]; then
  echo "ERROR: Set SERVER_HOST (e.g. SERVER_HOST=194.195.92.140 ./scripts/deploy-rsync.sh)"
  exit 1
fi

SERVER="$SERVER_USER@$SERVER_HOST"

# Run from repo root
cd "$(dirname "$0")/.."

# --- 1. Typecheck locally ---
echo "--> Typechecking..."
pnpm run typecheck

# --- 2. Rsync source to server (exclude build artifacts and deps) ---
echo "--> Uploading source to $SERVER:$SERVER_APP_DIR ..."
rsync -avz --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='**/node_modules' \
  --exclude='**/dist' \
  --exclude='**/.turbo' \
  . "$SERVER:$SERVER_APP_DIR/"

# --- 3. Build and restart on the server ---
echo "--> Running server-side build and restart..."
ssh "$SERVER" "$SERVER_APP_DIR/deploy.sh"

echo "=== Deploy complete ==="
echo "Tail logs with:  ssh $SERVER '$PM2 logs $PM2_NAME --lines 50 --nostream'"
