-- Articon2 Backend - Supabase Schema Migration
-- Aligns database schema with current code expectations
-- Review before running on production.

create extension if not exists "uuid-ossp";

-- ENUMS
do $$
begin
  if not exists (select 1 from pg_type where typname = 'category_enum') then
    create type category_enum as enum ('video', 'ui_ux', 'graphics');
  end if;

  if not exists (select 1 from pg_type where typname = 'notification_target') then
    create type notification_target as enum ('all', 'winners', 'specific');
  end if;

  if not exists (select 1 from pg_type where typname = 'notification_status') then
    create type notification_status as enum ('pending', 'sent', 'failed');
  end if;
end$$;

-- TABLES
create table if not exists public.participants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null unique,
  whatsapp_no text not null,
  category category_enum not null,
  city text not null,
  portfolio_url text not null,
  is_present boolean not null default false,
  whatsapp_opt_in boolean,
  whatsapp_opt_in_at timestamptz,
  whatsapp_opt_in_source text,
  whatsapp_opt_out_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  category category_enum not null,
  title text not null,
  description text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.judges (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  assigned_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admins (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.winners (
  id uuid primary key default uuid_generate_v4(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  position integer not null,
  category category_enum not null,
  announcement_text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  message text not null,
  scheduled_time timestamptz not null,
  target_audience notification_target not null,
  target_ids text[] null,
  status notification_status not null default 'pending',
  sent_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_settings (
  id uuid primary key default uuid_generate_v4(),
  key text not null unique,
  value text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default uuid_generate_v4(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  drive_link text not null,
  submitted_at timestamptz not null default now(),
  judge_id uuid references public.judges(id),
  preview_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (participant_id, task_id)
);

-- VIEWS (recreated to match backend expectations)

-- Drop and recreate participant_statistics
DROP VIEW IF EXISTS public.participant_statistics CASCADE;

CREATE VIEW public.participant_statistics AS
SELECT
  p.category::text AS category,
  COUNT(*)::int AS total_participants,
  COUNT(*) FILTER (WHERE p.is_present)::int AS present_participants
FROM public.participants p
GROUP BY p.category;

-- Drop and recreate submission_statistics
DROP VIEW IF EXISTS public.submission_statistics CASCADE;

CREATE VIEW public.submission_statistics AS
SELECT
  t.category::text AS category,
  COUNT(s.id)::int AS total_submissions
FROM public.tasks t
LEFT JOIN public.submissions s
  ON s.task_id = t.id
GROUP BY t.category;

-- RPC FUNCTIONS
create or replace function public.increment_judge_count(judge_id uuid)
returns void
language sql
security definer
as $$
  update public.judges
  set assigned_count = coalesce(assigned_count, 0) + 1,
      updated_at = now()
  where id = judge_id;
$$;

create or replace function public.decrement_judge_count(judge_id uuid)
returns void
language sql
security definer
as $$
  update public.judges
  set assigned_count = greatest(coalesce(assigned_count, 0) - 1, 0),
      updated_at = now()
  where id = judge_id;
$$;

-- INDEXES
create index if not exists idx_participants_email on public.participants(email);
create index if not exists idx_participants_category on public.participants(category);
create index if not exists idx_submissions_participant on public.submissions(participant_id);
create index if not exists idx_submissions_task on public.submissions(task_id);
create index if not exists idx_judges_email on public.judges(email);
create index if not exists idx_winners_participant on public.winners(participant_id);
