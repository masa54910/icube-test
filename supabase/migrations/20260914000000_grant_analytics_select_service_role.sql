-- Server-side Admin Analytics reads only. RLS remains enabled and no
-- SELECT access is granted to anon or authenticated roles.
grant select on table public.admin_users to service_role;
grant select on table public.analytics_events to service_role;
grant select on table public.analytics_sessions to service_role;
grant select on table public.analytics_stage_results to service_role;
grant select on table public.analytics_cube_tests to service_role;
