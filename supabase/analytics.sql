create table if not exists public.analytics_events (
  event_id uuid primary key, event_name text not null, anonymous_player_id uuid not null,
  session_id uuid not null, occurred_at timestamptz not null, app_version text not null,
  platform text not null check(platform='web'), device_class text not null check(device_class in ('desktop','mobile','tablet')),
  orientation text not null check(orientation in ('portrait','landscape')), language text not null,
  payload jsonb not null default '{}'::jsonb, is_test boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.analytics_events enable row level security;
revoke all on public.analytics_events from anon, authenticated;
grant insert on public.analytics_events to anon, authenticated;
drop policy if exists analytics_insert_valid on public.analytics_events;
create policy analytics_insert_valid on public.analytics_events for insert to anon, authenticated
with check (
  length(event_name) between 3 and 64
  and length(app_version) between 1 and 32
  and (select count(*) from jsonb_object_keys(payload))<=40
  and (not (payload ? 'cubeScore') or (jsonb_typeof(payload->'cubeScore')='number' and (payload->>'cubeScore')::numeric between 0 and 1000))
  and (not (payload ? 'effectivePlaySeconds') or (jsonb_typeof(payload->'effectivePlaySeconds')='number' and (payload->>'effectivePlaySeconds')::numeric between 0 and 86400))
  and (not (payload ? 'answerAttempts') or (jsonb_typeof(payload->'answerAttempts')='number' and (payload->>'answerAttempts')::numeric between 0 and 10))
);
-- Admin reads must use a protected server-side route/service role; never ship that key to the browser.
create table if not exists public.analytics_sessions (like public.analytics_events including defaults);
create table if not exists public.analytics_stage_results (like public.analytics_events including defaults);
create table if not exists public.analytics_cube_tests (like public.analytics_events including defaults);
alter table public.analytics_sessions enable row level security;
alter table public.analytics_stage_results enable row level security;
alter table public.analytics_cube_tests enable row level security;
revoke all on public.analytics_sessions,public.analytics_stage_results,public.analytics_cube_tests from anon, authenticated;
grant insert on public.analytics_sessions,public.analytics_stage_results,public.analytics_cube_tests to anon, authenticated;
drop policy if exists analytics_sessions_insert on public.analytics_sessions;
drop policy if exists analytics_stage_insert on public.analytics_stage_results;
drop policy if exists analytics_test_insert on public.analytics_cube_tests;
create policy analytics_sessions_insert on public.analytics_sessions for insert to anon, authenticated with check (is_test or length(app_version) between 1 and 32);
create policy analytics_stage_insert on public.analytics_stage_results for insert to anon, authenticated with check (is_test or length(app_version) between 1 and 32);
create policy analytics_test_insert on public.analytics_cube_tests for insert to anon, authenticated with check (is_test or length(app_version) between 1 and 32);
