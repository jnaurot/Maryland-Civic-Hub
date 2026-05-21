cat > ~/Projects/Maryland-Civic-Hub/deploy.sh << 'EOF'
#!/bin/bash
set -e

SERVER="root@194.195.92.140"
REMOTE_BASE="/var/www/politician"
LOCAL_BASE="$HOME/Projects/Maryland-Civic-Hub"

echo "=== Building frontend ==="
cd "$LOCAL_BASE/artifacts/rep"
pnpm build

echo "=== Syncing source to server ==="
rsync -avz --exclude='node_modules' --exclude='.git' --exclude='dist' \
  "$LOCAL_BASE/" "$SERVER:$REMOTE_BASE/"

echo "=== Deploying frontend ==="
rsync -avz "$LOCAL_BASE/artifacts/rep/dist/public/" \
  "$SERVER:$REMOTE_BASE/artifacts/rep/dist/public/"

echo "=== Building backend on server ==="
ssh "$SERVER" "cd $REMOTE_BASE && pnpm install --ignore-scripts && pnpm --filter @workspace/api-server run build"

echo "=== Restarting backend ==="
ssh "$SERVER" "pm2 restart politician-api && pm2 logs politician-api --lines 10 --nostream"

echo "=== Done! ==="
echo "https://politician.bawlmorean.com"
EOF
chmod +x ~/Projects/Maryland-Civic-Hub/deploy.sh
