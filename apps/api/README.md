# OWUF Laravel API

REST API for the OWUF Next.js frontend. **MySQL 8** is the default database.

## Local setup

```bash
# From repo root — start MySQL
docker compose up -d

cd apps/api
composer install
copy .env.example .env
php artisan key:generate
php artisan jwt:secret
php artisan migrate --seed
php artisan serve --host=127.0.0.1 --port=8000
```

Health: `GET http://127.0.0.1:8000/api/health`

## Commands

| Command | Purpose |
|---------|---------|
| `php artisan migrate --seed` | Migrate + demo data (**blocked in production**) |
| `php artisan app:seed-demo` | Re-run demo seeder (**blocked in production**) |
| `php artisan app:create-admin email` | Create/promote a production administrator |
| `php artisan app:deploy-prepare` | `storage:link` + config/route/view cache |
| `php artisan app:backup-create --label=manual` | Create ZIP backup |
| `php artisan app:backup-restore {filename} --force` | Restore tables from a backup ZIP |
| `php artisan utilities:import-xlsx path.xlsx` | Import utilities spreadsheet |

## Production

```bash
# Configure .env (APP_ENV=production, APP_DEBUG=false, MySQL, CORS, APP_KEY, JWT_SECRET)
php artisan migrate --force
php artisan app:deploy-prepare
php artisan app:create-admin admin@owuf.gov.et --name="OWUF Admin"
```

- For Render free deployment, use an external MySQL service such as Aiven free tier. Render web services do not include a managed database.
- Document root: `public/`
- nginx example: `../../deploy/nginx-api.conf.example`
- Deploy script: `../../deploy/deploy-api.sh`
