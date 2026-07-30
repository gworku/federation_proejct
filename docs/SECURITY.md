# OWUF Security

## Authentication

- Passwords hashed with bcrypt (Laravel `hashed` cast)
- JWT access + refresh; refresh tokens require `token_use=refresh`
- Account lockout after 5 failed logins (15 minutes)
- Refresh denied for inactive or locked accounts
- Access approval returns a **one-time setup URL/token**, never a plaintext temporary password
- HTTP backup restore disabled in production unless `ALLOW_BACKUP_RESTORE=true`

## Transport and headers

- `SecurityHeaders` middleware: `X-Content-Type-Options`, `X-Frame-Options`, Referrer-Policy, Permissions-Policy; HSTS in production
- CORS origins from `CORS_ALLOWED_ORIGINS` only
- Production: set explicit `TRUSTED_PROXIES` CIDRs (do not use `*` behind the public internet)

## Rate limits

| Limiter | Scope |
|---------|--------|
| `auth` | Login / refresh / password endpoints |
| `intake` | Public forms and media upload |
| `api` | Authenticated API traffic |

## Authorization

- Route middleware `role:…` on admin users, backups, and CMS writes
- Controller-level role checks for audit, finance, and ops modules
- Frontend module matrix in `apps/web/src/lib/roles.ts` (UX only — API remains authoritative)

## Secrets

Store only in environment variables: `APP_KEY`, `JWT_SECRET`, DB credentials, mail credentials. Never commit `.env`.
