# i CUBE TEST Analytics — Production Setup

This document is the production checklist for the dedicated i CUBE TEST Supabase project.

## Required user action

The dedicated project is `icube-test` (`xrfrnmocrvgecebpklwt`, region `ap-northeast-2`). Do not reuse another product's project.

For deployment, provide only:

- Project reference/ID
- Project API URL (`https://<project-ref>.supabase.co`)
- Public anon/publishable key

Never place a service-role key in the browser, `.env.example`, or a `VITE_*` variable.

## Database

1. Open the dedicated project's SQL Editor.
2. Apply [`supabase/analytics.sql`](../supabase/analytics.sql).
3. Confirm the analytics tables exist and RLS is enabled.
4. Verify the anon/authenticated roles have INSERT only; raw SELECT, UPDATE, and DELETE are not granted.

The client currently posts events to `public.analytics_events` using the REST endpoint. The other analytics tables are retained for the existing aggregation contract and future migrations.

## Frontend environment

Set these values only in the production deployment environment:

```text
VITE_ANALYTICS_URL=https://<project-ref>.supabase.co
VITE_ANALYTICS_ANON_KEY=<public-anon-or-publishable-key>
```

Do not commit `.env` files or keys. Localhost and preview traffic is marked `is_test=true` by `AnalyticsManager` and must be excluded from production aggregates (or leave the variables unset for local development).

## Admin API and authentication

`public/admin/analytics/index.html` intentionally calls `/api/admin/analytics`; it does not contain a service-role key. A protected server-side route must:

- require Supabase Auth;
- verify the signed-in user is in the admin allowlist/table;
- query only the dedicated project with a server-side service-role credential;
- filter `is_test=false` and apply the range parameter;
- return the contract in [`ANALYTICS_ADMIN_API.md`](./ANALYTICS_ADMIN_API.md).

The service-role credential belongs in the server deployment environment only. If no admin-auth route exists in the hosting project, configure that route before exposing `/admin/analytics/`.

## Verification checklist

- Send one valid `session_start` with the public key and confirm one row is inserted.
- Repeat the same `event_id`; confirm no duplicate row is created.
- Confirm anon SELECT/UPDATE/DELETE fail.
- Confirm invalid payload constraints fail.
- Run a production-like game session and verify stage and CUBE TEST events.
- Confirm the dashboard shows production rows and excludes `is_test=true` rows.
- Confirm the admin route redirects/denies unauthenticated and non-admin users.

## Current connection status

The dedicated project and schema are now connected. Production dashboard completion still requires a server deployment target for `/api/admin/analytics` and an admin-auth allowlist. No service-role credential is stored in this repository.
