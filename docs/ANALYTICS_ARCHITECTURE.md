# Anonymous Player Analytics

The client uses `AnalyticsManager` as a non-blocking observer. It creates a random UUID once per browser (`icube-analytics-player-id`) and a new UUID per launch (`sessionId`). No IP, fingerprint, name, email, ad ID, location, or input text is collected.

When `VITE_ANALYTICS_URL` and `VITE_ANALYTICS_ANON_KEY` are configured, batches are inserted into the dedicated Supabase `analytics_events` table. Without them, events remain in a bounded local queue and gameplay continues. Localhost events are marked `isTest=true` and must be excluded from production aggregates.

## Definitions

- Player: distinct random anonymous player UUID.
- Session: one game load, identified by session UUID.
- Active time: visible, recently active gameplay time; hidden/paused/idle periods are excluded.
- Stage clear rate: completed stage events / started stage events for the same period.

The browser receives insert-only access through RLS. Admin aggregation is intentionally server-side; a service-role key must never be included in frontend code.

## Activation checklist

1. Create or select a dedicated i CUBE TEST Supabase project.
2. Apply `supabase/analytics.sql` using an authenticated administrator or migration pipeline.
3. Configure `VITE_ANALYTICS_URL` and the publishable/anon key in the production environment only.
4. Add a protected server-side `/admin/analytics` route using Supabase Auth and aggregate non-test rows.
5. Verify anon can INSERT but cannot SELECT, UPDATE, or DELETE; then run a single local QA session and confirm duplicate-safe rows.

This repository intentionally stops before steps 1–4 because no project reference, credentials, or admin identity were supplied.
