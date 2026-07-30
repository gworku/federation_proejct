# OWUF Architecture

## Overview

Monorepo with two deployable apps:

| App | Path | Role |
|-----|------|------|
| Web | `apps/web` | Next.js public site + authenticated workspace |
| API | `apps/api` | Laravel REST API + MySQL |

```
Browser (Next.js)
  ├── Public pages (i18n en/om/am)
  └── /app/* workspace (JWT in sessionStorage)
        │
        ▼
Laravel API (/api/*)
  ├── JWT auth + role checks
  ├── CMS / intake / ops / membership
  └── MySQL 8
```

## Auth flow

1. `POST /api/auth/login` → access + refresh JWT + user profile
2. Access token sent as `Authorization: Bearer …`
3. On 401, web client refreshes via `POST /api/auth/refresh`
4. Refresh rejects inactive or locked users
5. Password reset: `forgot-password` → token (email / local debug) → `reset-password`
6. Forced change: `must_change_password` gates `/app` until `change-password`

## Roles

`administrator`, `management`, `content_editor`, `project_officer`, `finance_officer`, `procurement_officer`, `utility_user`, `auditor`

CMS writes require administrator / management / content_editor. Editorial publish for news/events/publications is limited to administrator/management.

## Content model

- Dynamic content: news, events, gallery, partners, projects, utilities, stats (API/CMS)
- Static institutional copy still in `apps/web/src/data/*` (services, FAQ chrome) — deferred CMS migration

## Soft deletes

News, events, publications, gallery, partners, and projects use `deleted_at`. Public queries exclude soft-deleted rows by default.
