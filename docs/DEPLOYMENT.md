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
