# OWUF API (selected endpoints)

Base: `{API_URL}/api`  
Auth header: `Authorization: Bearer {access}`

## Auth

| Method | Path | Notes |
|--------|------|-------|
| POST | `/auth/login` | `{ identifier, password }` → access, refresh, user |
| POST | `/auth/refresh` | `{ refresh }` |
| POST | `/auth/logout` | `{ refresh }` |
| POST | `/auth/forgot-password` | `{ email }` |
| POST | `/auth/reset-password` | `{ email, token, password, password_confirmation }` |
| POST | `/auth/change-password` | Auth required |
| GET | `/auth/me` | Auth required |
| POST | `/auth/access-requests` | Public |
| GET | `/auth/access-requests/manage` | Admin/management |
| PATCH | `/auth/access-requests/{id}` | Approve returns `setup_url` (no temp password) |

## Admin users

| Method | Path | Role |
|--------|------|------|
| GET | `/admin/users` | administrator |
| PATCH | `/admin/users/{id}` | administrator |
| GET | `/admin/users/export` | administrator (CSV) |

## CMS

`GET/POST/PATCH/DELETE /cms/{resource}` where resource includes `news`, `events`, `gallery`, `partners`, `publications`, …

Public `GET` returns published/public rows only. Writes require content roles.

## Audit

`GET /audit/events?action=&entity_type=&from=&to=` — auditor / admin / management

## Health

`GET /health` → `{ status, database, service }`
