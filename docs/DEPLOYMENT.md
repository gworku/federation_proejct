# OWUF Deployment

## Environments

| Env | Web | API | Notes |
|-----|-----|-----|-------|
| local | `next dev` | `artisan serve` + Docker MySQL | Demo seed OK |
| staging | `next start` | php-fpm + nginx | Seed optional |
| production | `next start` / Node process | php-fpm + nginx | No demo seed |

## Commands

### API

```bash
cd apps/api
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan app:deploy-prepare
# php artisan app:create-admin you@example.com --name="Name"
```

Shell helper: `deploy/deploy-api.sh`  
Nginx sample: `deploy/nginx-api.conf.example`

### Web

```bash
cd apps/web
npm ci
NEXT_PUBLIC_SITE_URL=https://owuf.gov.et \
NEXT_PUBLIC_API_URL=https://api.owuf.gov.et \
npm run build
npm run start
```

Shell helper: `deploy/deploy-web.sh`  
Nginx sample: `deploy/nginx-web.conf.example`

## Required production env

**API:** `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL`, `JWT_SECRET`, MySQL, `CORS_ALLOWED_ORIGINS`, `FRONTEND_URL`, `TRUSTED_PROXIES` (CIDRs), mail settings for password reset.

> Render free web services cannot host a managed database. Provision an external MySQL instance (for example, Aiven free tier) and connect it with `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, and optionally `MYSQL_ATTR_SSL_CA`.

**Web:** `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_URL`

## Render free deployment checklist

1. Push the latest `main` branch to GitHub.
2. In Render, create two services if not using `render.yaml`:
   - `owuf-web`: type `web`, env `node`, build `cd apps/web && npm ci && npm run build`, start `cd apps/web && npx next start --hostname 0.0.0.0 --port $PORT`.
   - `owuf-api`: type `web`, env `docker`, Dockerfile `./apps/api/Dockerfile`, build and start during deploy.
3. Configure `owuf-api` env vars:
   - `APP_ENV=production`
   - `APP_DEBUG=false`
   - `APP_URL=https://owuf-api.onrender.com`
   - `FRONTEND_URL=https://owuf-web.onrender.com`
   - `CORS_ALLOWED_ORIGINS=https://owuf-web.onrender.com`
   - `LOG_CHANNEL=daily`
   - `LOG_LEVEL=warning`
   - `SESSION_SECURE_COOKIE=true`
   - `APP_KEY` generated value
   - `DB_CONNECTION=mysql`
   - `DB_HOST` from Aiven
   - `DB_PORT=3306` (or provider value)
   - `DB_DATABASE` from Aiven
   - `DB_USERNAME` from Aiven
   - `DB_PASSWORD` from Aiven
   - `DB_CHARSET=utf8mb4`
   - `DB_COLLATION=utf8mb4_unicode_ci`
   - `MYSQL_ATTR_SSL_CA=/etc/ssl/certs/ca.pem` when using SSL
   - `JWT_SECRET` generated value
4. Optionally define `DB_URL` instead of individual DB values for managed MySQL URLs.
5. Configure `owuf-web` env vars:
   - `NODE_ENV=production`
   - `NEXT_PUBLIC_SITE_URL=https://owuf-web.onrender.com`
   - `NEXT_PUBLIC_API_URL=https://owuf-api.onrender.com`
6. For first deploy, allow Render to build the app and create a shell if needed to run `php artisan app:create-admin ...`.
7. Use the Render dashboard or `render.yaml` to keep service settings versioned.

## Health checks

- API: `GET /api/health` and Laravel `/up`
- After deploy: login, publish news as admin, public home load

## Backups

- Create/download via admin UI (`/app/backups`) or artisan backup commands
- HTTP restore is blocked in production by default

## Rollback

1. Redeploy previous web build artifact
2. Restore previous API release
3. If a migration must reverse: `php artisan migrate:rollback` (only with tested down methods)
4. Restore DB from backup if schema/data corruption occurred

## Optional Docker images

See `apps/api/Dockerfile` and `apps/web/Dockerfile`. Compose remains MySQL-only for local DB (`docker-compose.yml`).
