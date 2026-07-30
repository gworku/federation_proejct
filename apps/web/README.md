# OWUF Web

Next.js 16 public website and authenticated management shell for the Oromia Water Utilities Federation.

## Local

```bash
npm install
# apps/web/.env.local
# NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
# NEXT_PUBLIC_SITE_URL=http://localhost:3000
npm run dev
```

## Production build

```bash
NEXT_PUBLIC_SITE_URL=https://owuf.gov.et \
NEXT_PUBLIC_API_URL=https://api.owuf.gov.et \
npm ci && npm run build && npm run start
```

Or from the repo root: `bash deploy/deploy-web.sh`

See the root `README.md` and `deploy/` for nginx examples.
