#!/usr/bin/env bash
set -euo pipefail

# Usage (from repo root):
#   bash deploy/deploy-api.sh
# Requires: composer, php 8.3+, configured apps/api/.env

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API="$ROOT/apps/api"

cd "$API"

if [[ ! -f .env ]]; then
  echo "Missing apps/api/.env — copy .env.example and configure production values." >&2
  exit 1
fi

composer install --no-dev --optimize-autoloader --no-interaction

php artisan migrate --force
php artisan app:deploy-prepare

echo "API deploy complete."
echo "If this is the first deploy, create an admin:"
echo "  cd apps/api && php artisan app:create-admin you@example.com --name=\"Your Name\""
