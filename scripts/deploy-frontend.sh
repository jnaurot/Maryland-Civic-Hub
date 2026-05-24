#!/usr/bin/env bash
# Build the frontend locally and rsync the dist to the server's nginx directory.
# Unlike the API server, the frontend has no server-specific paths baked in at
# build time, so building locally and uploading the dist is safe.
#
# Usage:
#   SERVER_HOST=<ip-or-hostname> ./scripts/deploy-frontend.sh

set -euo pipefail

SERVER_HOST="${SERVER_HOST:-}"
SERVER_USER="${SERVER_USER:-root}"
SERVER_FRONTEND_DIR="${SERVER_FRONTEND_DIR:-/var/www/politician.bawlmorean.com}"

if [ -z "$SERVER_HOST" ]; then
  echo "ERROR: Set SERVER_HOST (e.g. SERVER_HOST=194.195.92.140 ./scripts/deploy-frontend.sh)"
  exit 1
fi

SERVER="$SERVER_USER@$SERVER_HOST"

# Run from repo root
cd "$(dirname "$0")/.."

echo "--> Typechecking..."
pnpm run typecheck

echo "--> Building frontend..."
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/rep run build

echo "--> Uploading dist to $SERVER:$SERVER_FRONTEND_DIR ..."
rsync -avz --delete \
  -e "ssh -o StrictHostKeyChecking=no" \
  artifacts/rep/dist/public/ \
  "$SERVER:$SERVER_FRONTEND_DIR/"

echo "=== Frontend deploy complete ==="
