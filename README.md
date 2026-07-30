# OWUF Platform

Integrated public website and authenticated management system for the **Oromia Water Utilities Federation (OWUF)**.

## Stack

| Layer | Technology |
|-------|------------|
| Public + App UI | Next.js 16, TypeScript, Tailwind CSS 4, Framer Motion |
| API | Laravel 13, JWT (`php-open-source-saver/jwt-auth`) |
| Data | MySQL 8 (default) |

## Quick start (local)

Run the frontend and API as two local processes. MySQL can run via Docker Compose or a local MySQL 8 install.

### Prerequisites

- Node.js 20+
- PHP 8.3+ with extensions: `openssl`, `mbstring`, `curl`, `pdo_mysql`, `zip`, `sodium`
- Composer ([getcomposer.org](https://getcomposer.org/))
- MySQL 8 (local install **or** Docker)

### MySQL

**Option A — Docker Compose** (from the repo root):

```bash
docker compose up -d
```

This starts MySQL 8 with credentials matching `apps/api/.env.example`:

| Setting | Value |
|---------|-------|
| Host | `127.0.0.1` |
| Port | `3306` |
| Database | `owuf` |
| Username | `owuf` |
| Password | `owuf_secret` |

**Option B — Local MySQL 8:** create the `owuf` database/user with the same credentials, or adjust `apps/api/.env`.

SQLite remains available as an alternative (see commented lines in `apps/api/.env.example`).

### Frontend

```bash
cd apps/web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Backend

```bash
cd apps/api
composer install
copy .env.example .env
php artisan key:generate
php artisan jwt:secret
php artisan migrate --seed
php artisan serve --host=127.0.0.1 --port=8000
```

API base: [http://127.0.0.1:8000](http://127.0.0.1:8000)

Set in `apps/web/.env.local`:

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Demo accounts (local / staging only)

| Email | Password | Role |
|-------|----------|------|
| admin@owuf.gov.et | Admin@123 | Administrator |
| manager@owuf.gov.et | Manager@123 | Management |
| editor@owuf.gov.et | Editor@123 | Content Editor |
| projects@owuf.gov.et | Project@123 | Project Officer |
| finance@owuf.gov.et | Finance@123 | Finance Officer |
| procurement@owuf.gov.et | Procure@123 | Procurement Officer |
| utility@owuf.gov.et | Utility@123 | Utility User |
| auditor@owuf.gov.et | Auditor@123 | Auditor |

**Do not run demo seeders or these passwords in production.**

### Useful Artisan commands

```bash
php artisan migrate:fresh --seed   # reset DB + demo data (local only)
php artisan app:seed-demo          # re-seed demo content (local only)
php artisan app:backup-create --label=manual
php artisan app:backup-restore owuf-backup-YYYYMMDD-HHMMSS-manual.zip --force
php artisan utilities:import-xlsx "path\to\utilities.xlsx"
```

## Production deployment

Example nginx configs and scripts live in [`deploy/`](deploy/).

### 1. MySQL

Provision MySQL 8 with a dedicated database/user. Apply strong credentials (not the Docker demo password).

### 2. API (`apps/api`)

```bash
cd apps/api
composer install --no-dev --optimize-autoloader
cp .env.example .env   # then edit production values
php artisan key:generate
php artisan jwt:secret
php artisan migrate --force
php artisan app:deploy-prepare
php artisan app:create-admin you@owuf.gov.et --name="Your Name"
```

Or from the repo root after `.env` is configured: `bash deploy/deploy-api.sh`

Required production `.env` values:

```
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.owuf.gov.et
LOG_CHANNEL=daily
LOG_LEVEL=warning
SESSION_SECURE_COOKIE=true
DB_CONNECTION=mysql
DB_HOST=...
DB_DATABASE=...
DB_USERNAME=...
DB_PASSWORD=...
CORS_ALLOWED_ORIGINS=https://owuf.gov.et,https://www.owuf.gov.et
FRONTEND_URL=https://owuf.gov.et
TRUSTED_PROXIES=10.0.0.0/8,172.16.0.0/12   # production: explicit CIDRs, not *
JWT_SECRET=...      # from jwt:secret
```

> For Render free deployments, provision an external MySQL database such as Aiven free tier. Render free web services do not include a hosted database.
> Use `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, and optionally `MYSQL_ATTR_SSL_CA` for secure managed MySQL access.

More detail: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md), [`docs/SECURITY.md`](docs/SECURITY.md), [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), [`docs/API.md`](docs/API.md).

Serve `apps/api/public` via nginx/Apache + PHP-FPM 8.3+ (see `deploy/nginx-api.conf.example`). Health checks: `/up` and `/api/health`.

**Never** run `migrate:fresh`, `db:seed`, or `app:seed-demo` in production. Demo seeding is blocked when `APP_ENV=production`.

### 3. Frontend (`apps/web`)

```bash
cd apps/web
# Must be set at build time:
# NEXT_PUBLIC_SITE_URL=https://owuf.gov.et
# NEXT_PUBLIC_API_URL=https://api.owuf.gov.et
npm ci
npm run build
npm run start
```

Or: `bash deploy/deploy-web.sh` with those env vars exported. Put nginx (see `deploy/nginx-web.conf.example`) or PM2/systemd in front of `next start` with TLS.

### 4. Post-deploy smoke checks

- [ ] `GET /api/health` returns ok / database up
- [ ] Public home loads stats, news, utilities
- [ ] Login + logout on member portal (admin from `app:create-admin`)
- [ ] Contact / membership / technical-support forms submit
- [ ] CMS publish appears on the public site
- [ ] Requests feed + CSV export work for admin
- [ ] Gallery / uploaded media render via `/storage`
- [ ] `/sitemap.xml` and `/robots.txt` use the production site URL

## SEO & discoverability

- Canonical URLs, Open Graph, Twitter cards, and hreflang (`en` / `om` / `am`)
- JSON-LD: `GovernmentOrganization`, `WebSite`, `FAQPage`, `NewsArticle`, `Service`, breadcrumbs
- Auto routes: `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`
- Set `NEXT_PUBLIC_SITE_URL=https://owuf.gov.et` in production
- Optional: `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` for Search Console

## Content assets

Brand assets live under `apps/web/public/brand/`. Utility spreadsheets can be imported with `php artisan utilities:import-xlsx`.

## Testing

```bash
# API
cd apps/api && php artisan test

# Web unit tests
cd apps/web && npm test
```

CI (`.github/workflows/ci.yml`) runs web typecheck/lint/tests/build and API migrate + PHPUnit.

## Project layout

```
apps/web     Next.js public site + authenticated shell
apps/api     Laravel REST API (JWT + MySQL)
docs/        Architecture, security, deployment, API notes
docker-compose.yml   Local MySQL 8
```
