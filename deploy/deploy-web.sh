#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   NEXT_PUBLIC_SITE_URL=https://owuf.gov.et \
#   NEXT_PUBLIC_API_URL=https://api.owuf.gov.et \
#   bash deploy/deploy-web.sh
#
# Then run the built app with PM2/systemd: npm run start (port 3000)

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WEB="$ROOT/apps/web"

cd "$WEB"

if [[ -z "${NEXT_PUBLIC_API_URL:-}" ]]; then
  echo "NEXT_PUBLIC_API_URL is required for production builds." >&2
  exit 1
fi

if [[ -z "${NEXT_PUBLIC_SITE_URL:-}" ]]; then
  echo "NEXT_PUBLIC_SITE_URL is required for production builds." >&2
  exit 1
fi

npm ci
npm run build

echo "Web build complete. Start with: cd apps/web && npm run start"
