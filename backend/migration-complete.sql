-- Articon2 Backend - Complete Supabase Schema Migration
-- This migration creates all necessary tables and structures
-- Run this ONCE on a fresh database or use it as reference

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

-- Participants table with all required fields
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
  role text,
  experience integer default 0,
  organization text,
  specialization text,
  source text,
  password_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.participants.role is 'Participant role: Student, Professional, or Freelancer';
comment on column public.participants.experience is 'Years of experience';
comment on column public.participants.organization is 'Organization or college name';
comment on column public.participants.specialization is 'Field of specialization: UI/UX Design, Video Editing, or Graphic Design';
comment on column public.participants.source is 'How they heard about the competition';
comment on column public.participants.password_hash is 'Hashed password for authentication';

-- Tasks table
create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  category category_enum not null,
  title text not null,
  description text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Judges table
create table if not exists public.judges (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  assigned_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Admins table
create table if not exists public.admins (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Winners table
create table if not exists public.winners (
  id uuid primary key default uuid_generate_v4(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  position integer not null,
  category category_enum not null,
  announcement_text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Notifications table
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

-- Event settings table
create table if not exists public.event_settings (
  id uuid primary key default uuid_generate_v4(),
  key text not null unique,
  value text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Submissions table with score column
create table if not exists public.submissions (
  id uuid primary key default uuid_generate_v4(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  drive_link text not null,
  submitted_at timestamptz not null default now(),
  judge_id uuid references public.judges(id),
  preview_url text,
  score integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (participant_id, task_id)
);

comment on column public.submissions.score is 'Score assigned by judge (0-100)';

-- VIEWS

-- Drop and recreate participant_statistics
drop view if exists public.participant_statistics cascade;

create view public.participant_statistics as
select
  p.category::text as category,
  count(*)::int as total_participants,
  count(*) filter (where p.is_present)::int as present_participants
from public.participants p
group by p.category;

-- Drop and recreate submission_statistics
drop view if exists public.submission_statistics cascade;

create view public.submission_statistics as
select
  t.category::text as category,
  count(s.id)::int as total_submissions
from public.tasks t
left join public.submissions s on s.task_id = t.id
group by t.category;

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
create index if not exists idx_submissions_judge on public.submissions(judge_id);
create index if not exists idx_judges_email on public.judges(email);
create index if not exists idx_winners_participant on public.winners(participant_id);

-- TRIGGERS for updated_at columns
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply triggers to all tables
do $$
declare
  t text;
begin
  foreach t in array array['participants', 'tasks', 'judges', 'admins', 'winners', 'notifications', 'event_settings', 'submissions']
  loop
    execute format('
      drop trigger if exists update_%s_updated_at on public.%s;
      create trigger update_%s_updated_at
        before update on public.%s
        for each row
        execute function public.update_updated_at_column();
    ', t, t, t, t);
  end loop;
end$$;

-- SUCCESS MESSAGE
do $$
begin
  raise notice '✅ Migration completed successfully!';
  raise notice 'All tables, views, functions, indexes, and triggers have been created.';
end$$;
