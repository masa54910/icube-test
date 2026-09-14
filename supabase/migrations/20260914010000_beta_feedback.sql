create table if not exists public.beta_feedback (
 id uuid primary key default gen_random_uuid(), anonymous_player_id text not null, session_id text not null,
 rating_usability integer not null check (rating_usability between 1 and 5), difficulty text not null check (difficulty in ('very_easy','easy','just_right','hard','very_hard')),
 rating_fun integer not null check (rating_fun between 1 and 5), rating_cube_memo integer null check (rating_cube_memo is null or rating_cube_memo between 1 and 5), cube_memo_unused boolean not null default false,
 rating_replay integer not null check (rating_replay between 1 and 5), comment text null check (comment is null or char_length(comment)<=1000), traffic_source text null,
 created_at timestamptz not null default now(), is_test boolean not null default false, unique (anonymous_player_id)
);
create table if not exists public.beta_feedback_contacts (
 id uuid primary key default gen_random_uuid(), feedback_id uuid not null references public.beta_feedback(id) on delete cascade,
 email text not null check (char_length(email) between 3 and 320 and position('@' in email)>1), marketing_consent boolean not null default false, created_at timestamptz not null default now()
);
alter table public.beta_feedback enable row level security;
alter table public.beta_feedback_contacts enable row level security;
revoke all on table public.beta_feedback, public.beta_feedback_contacts from anon, authenticated;
grant insert on table public.beta_feedback, public.beta_feedback_contacts to anon, authenticated;
grant select on table public.beta_feedback, public.beta_feedback_contacts to service_role;
create policy beta_feedback_insert on public.beta_feedback for insert to anon, authenticated with check (char_length(anonymous_player_id) between 1 and 128 and char_length(session_id) between 1 and 128);
create policy beta_feedback_contacts_insert on public.beta_feedback_contacts for insert to anon, authenticated with check (char_length(email) between 3 and 320 and position('@' in email)>1);
