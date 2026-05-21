#!/usr/bin/env bash
# One-time VPS setup script for Maryland Civic Hub
# Run this as root (or with sudo) on a fresh Ubuntu VPS.
# It installs everything, configures nginx, gets SSL certs, and does the first deploy.

set -euo pipefail

# --- Configuration ---
FRONTEND_DOMAIN="politician.bawlmorean.com"
API_DOMAIN="politician.api.bawlmorean.com"
APP_DIR="/opt/civic-hub"
REPO_URL=""  # <-- Fill this in: e.g. git@github.com:yourname/maryland-civic-hub.git
GITHUB_SSH_KEY=""  # <-- Optional: paste your GitHub deploy key here

# --- Helpers ---
command_exists() {
  command -v "$1" &> /dev/null
}

echo "=== Maryland Civic Hub VPS Setup ==="
echo "Domains: $FRONTEND_DOMAIN + $API_DOMAIN"
echo "App dir: $APP_DIR"
echo ""

if [ -z "$REPO_URL" ]; then
  echo "ERROR: You must set REPO_URL at the top of this script before running."
  exit 1
fi

# --- 1. System packages ---
echo "--> Updating system packages..."
apt-get update
apt-get install -y \
  curl wget git nginx certbot python3-certbot-nginx \
  build-essential python3-pip \
  apt-transport-https ca-certificates gnupg lsb-release

# --- 2. Docker + Docker Compose ---
if ! command_exists docker; then
  echo "--> Installing Docker..."
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list
  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
fi

# --- 3. Node.js 22 via NodeSource ---
if ! command_exists node || [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" != "22" ]; then
  echo "--> Installing Node.js 22..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

# --- 4. pnpm ---
if ! command_exists pnpm; then
  echo "--> Installing pnpm..."
  npm install -g pnpm@10
  # Enable corepack for future pnpm projects
  corepack enable
fi

# --- 5. PM2 ---
if ! command_exists pm2; then
  echo "--> Installing PM2..."
  npm install -g pm2
fi

# --- 6. Clone repo ---
echo "--> Cloning repository..."
if [ -d "$APP_DIR" ]; then
  echo "    $APP_DIR already exists. Pulling instead..."
  cd "$APP_DIR"
  git pull origin main
else
  mkdir -p "$(dirname "$APP_DIR")"
  if [ -n "$GITHUB_SSH_KEY" ]; then
    # Create a temporary SSH key for GitHub clone
    mkdir -p /root/.ssh
    echo "$GITHUB_SSH_KEY" > /root/.ssh/id_rsa_tmp
    chmod 600 /root/.ssh/id_rsa_tmp
    GIT_SSH_COMMAND="ssh -i /root/.ssh/id_rsa_tmp -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new" git clone "$REPO_URL" "$APP_DIR"
    rm -f /root/.ssh/id_rsa_tmp
  else
    git clone "$REPO_URL" "$APP_DIR"
  fi
fi

cd "$APP_DIR"

# --- 7. Install project dependencies ---
echo "--> Installing project dependencies..."
pnpm install --frozen-lockfile

# --- 8. Create .env if it doesn't exist ---
if [ ! -f "$APP_DIR/.env" ]; then
  echo "--> Creating .env from .env.example..."
  cp "$APP_DIR/.env.example" "$APP_DIR/.env"
  echo ""
  echo "!!! IMPORTANT: Edit $APP_DIR/.env and fill in your API keys and database credentials before continuing !!!"
  echo ""
  echo "    nano $APP_DIR/.env"
  echo ""
  read -rp "Press Enter after you've edited .env and saved it..."
fi

# Load env vars for the rest of the script
set -a
source "$APP_DIR/.env"
set +a

# --- 9. Start PostgreSQL via Docker Compose ---
echo "--> Starting PostgreSQL container..."
docker compose up -d

# Wait for Postgres to be ready
echo "    Waiting for Postgres to be ready..."
for i in {1..30}; do
  if docker compose exec -T postgres pg_isready -U "${POSTGRES_USER:-civic}" -d "${POSTGRES_DB:-civic_hub}" > /dev/null 2>&1; then
    echo "    Postgres is ready"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "    Postgres did not become ready in time. Check docker logs:"
    echo "    docker compose logs postgres"
    exit 1
  fi
  sleep 1
done

# --- 10. Push DB schema ---
echo "--> Pushing database schema..."
pnpm --filter @workspace/db run push

# --- 11. Build the project ---
echo "--> Building project..."
pnpm run build

# --- 12. Build frontend for production ---
echo "--> Building frontend..."
cd "$APP_DIR/artifacts/md-reps"
VITE_API_BASE_URL="$VITE_API_BASE_URL" \
BASE_PATH="$BASE_PATH" \
PORT="$PORT" \
pnpm run build

# --- 13. Deploy frontend static files ---
echo "--> Deploying frontend static files..."
mkdir -p /var/www/$FRONTEND_DOMAIN
cp -r "$APP_DIR/artifacts/md-reps/dist/"* /var/www/$FRONTEND_DOMAIN/
chown -R www-data:www-data /var/www/$FRONTEND_DOMAIN

# --- 14. Configure nginx ---
echo "--> Configuring nginx..."

# Create upstream file for the API
mkdir -p /etc/nginx/conf.d
tee /etc/nginx/conf.d/api-upstream.conf > /dev/null << EOF
upstream civic_api {
    server 127.0.0.1:3001;
}
EOF

# Copy site configs
ln -sf "$APP_DIR/scripts/nginx/$FRONTEND_DOMAIN" /etc/nginx/sites-available/$FRONTEND_DOMAIN
ln -sf "$APP_DIR/scripts/nginx/$API_DOMAIN" /etc/nginx/sites-available/$API_DOMAIN

ln -sf /etc/nginx/sites-available/$FRONTEND_DOMAIN /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/$API_DOMAIN /etc/nginx/sites-enabled/

nginx -t && systemctl reload nginx

# --- 15. Get SSL certificates ---
echo "--> Requesting SSL certificates..."
certbot --nginx --non-interactive --agree-tos \
  --email "admin@$FRONTEND_DOMAIN" \
  -d "$FRONTEND_DOMAIN" \
  -d "$API_DOMAIN" \
  --redirect

# --- 16. Start API with PM2 ---
echo "--> Starting API with PM2..."
cd "$APP_DIR"
PORT="$PORT" pm2 start "node artifacts/api-server/dist/index.mjs" --name civic-api-blue
pm2 save
pm2 startup systemd

# The above command prints a command to run. Execute it.
echo ""
echo "=== Setup complete ==="
echo ""
echo "Frontend: https://$FRONTEND_DOMAIN"
echo "API:      https://$API_DOMAIN"
echo ""
echo "PM2 processes:"
pm2 list
