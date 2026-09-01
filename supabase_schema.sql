-- RPG Joshep - Schema para familias LEON/OVEJA - ejecutar en Supabase SQL Editor
-- https://supabase.com/dashboard/project/yilkoleasisnclorvhws/sql

-- 1) families
create table if not exists public.families (
  code text primary key,
  display_name text not null,
  created_at timestamptz default now()
);
-- seed LEON
insert into public.families(code, display_name) values ('LEON','Familia LEON')
on conflict (code) do nothing;

-- 2) family_settings
create table if not exists public.family_settings (
  family_code text primary key references public.families(code) on delete cascade,
  scoring jsonb not null default '{"simpleTaskPoints":10,"guideCompletePoints":30,"weekCompleteBonus":50,"week1AllSubjectsBonus":150,"week2AllSubjectsBonus":150,"week3AllSubjectsBonus":150,"week4AllSubjectsBonus":150,"bimesterSubjectBonus":300}'::jsonb,
  theme text not null default 'dark',
  habit_board_width int not null default 140,
  habit_board_height int not null default 72,
  promises jsonb not null default '[]'::jsonb,
  parent_pin text not null default '2026',
  sync_interval_minutes int not null default 30,
  updated_at timestamptz default now()
);
insert into public.family_settings(family_code) values ('LEON') on conflict (family_code) do nothing;

-- 3) profiles
create table if not exists public.profiles (
  id text primary key,
  family_code text not null references public.families(code) on delete cascade,
  name text not null,
  role text not null default 'child',
  age int not null default 8,
  gender text default 'boy',
  grade_level text default 'segundo_grado',
  km_ganados double precision not null default 0,
  km_reales double precision not null default 0,
  start_km double precision not null default 0,
  wisdom_points int not null default 0,
  life_points int not null default 0,
  coins int not null default 0,
  level int not null default 1,
  current_streak int not null default 0,
  unlocked_cities jsonb not null default '{}'::jsonb,
  unlocked_houses jsonb not null default '{}'::jsonb,
  avatar jsonb not null default '{}'::jsonb,
  inventory jsonb not null default '[]'::jsonb,
  pomodoro_minutes int not null default 20,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_profiles_family on public.profiles(family_code);

-- 4) tasks
create table if not exists public.tasks (
  id text primary key,
  family_code text not null references public.families(code) on delete cascade,
  user_id text not null,
  materia_id text not null,
  bimestre int not null,
  semana int not null,
  title text not null,
  description text,
  type text not null default 'sabiduria',
  points int not null default 10,
  status text not null default 'pending',
  is_daily_habit boolean default false,
  is_guide_complete boolean default false,
  is_guide_subtask boolean default false,
  created_at timestamptz default now(),
  submitted_at timestamptz,
  approved_at timestamptz,
  days_overdue int,
  original_points int
);
create index if not exists idx_tasks_family_user on public.tasks(family_code, user_id);
create index if not exists idx_tasks_family on public.tasks(family_code);

-- 5) store_items
create table if not exists public.store_items (
  id text primary key,
  family_code text not null references public.families(code) on delete cascade,
  title text not null,
  type text not null,
  cost_type text not null,
  cost int not null,
  icon text not null default '',
  description text not null default '',
  purchased boolean not null default false,
  item_key text,
  redeem_limit int,
  redeem_period text,
  avatar_duration text,
  avatar_duration_days int,
  gender text,
  required_days int,
  created_at timestamptz default now()
);
create index if not exists idx_store_items_family on public.store_items(family_code);

-- 6) reward_redemptions
create table if not exists public.reward_redemptions (
  id bigserial primary key,
  family_code text not null references public.families(code) on delete cascade,
  store_item_id text not null,
  user_id text not null,
  redeemed_at timestamptz not null default now()
);
create index if not exists idx_redemptions_family on public.reward_redemptions(family_code);

-- 7) avatar_actives
create table if not exists public.avatar_actives (
  id bigserial primary key,
  family_code text not null references public.families(code) on delete cascade,
  user_id text not null,
  item_key text not null,
  activated_at timestamptz not null default now(),
  expires_at timestamptz
);
create index if not exists idx_avatar_actives_family on public.avatar_actives(family_code);

-- 8) medal_definitions
create table if not exists public.medal_definitions (
  id text primary key,
  family_code text not null references public.families(code) on delete cascade,
  title text not null,
  description text not null default '',
  icon text not null default '',
  materia_id text,
  criteria_type text not null default 'manual',
  criteria_params jsonb default '{}'::jsonb,
  enabled boolean not null default true
);
create index if not exists idx_medal_defs_family on public.medal_definitions(family_code);

-- 9) manual_medal_overrides
create table if not exists public.manual_medal_overrides (
  id bigserial primary key,
  family_code text not null references public.families(code) on delete cascade,
  user_id text not null,
  medal_id text not null,
  active boolean not null,
  updated_at timestamptz not null default now(),
  unique(family_code, user_id, medal_id)
);

-- 10) habit_definitions
create table if not exists public.habit_definitions (
  id text primary key,
  family_code text not null references public.families(code) on delete cascade,
  title text not null,
  description text,
  icon text not null default '',
  points int not null default 5,
  goal_type text not null default 'daily',
  goal_count int not null default 1,
  enabled boolean not null default true
);
create index if not exists idx_habit_defs_family on public.habit_definitions(family_code);

-- 11) habit_logs
create table if not exists public.habit_logs (
  id bigserial primary key,
  family_code text not null references public.families(code) on delete cascade,
  habit_id text not null,
  user_id text not null,
  date text not null,
  completed boolean not null default true,
  created_at timestamptz not null default now(),
  unique(family_code, habit_id, user_id, date)
);
create index if not exists idx_habit_logs_family on public.habit_logs(family_code);

-- 12) play_stats
create table if not exists public.play_stats (
  family_code text primary key references public.families(code) on delete cascade,
  total_minutes int not null default 0,
  active_minutes int not null default 0,
  last_session_at timestamptz,
  updated_at timestamptz default now()
);
insert into public.play_stats(family_code) values ('LEON') on conflict (family_code) do nothing;

-- 13) app_state_snapshots (opcional backup completo por familia)
create table if not exists public.app_state_snapshots (
  family_code text primary key references public.families(code) on delete cascade,
  state jsonb not null,
  updated_at timestamptz default now()
);

-- RLS: desactivado por ahora (pediste exponer datos)
alter table public.families disable row level security;
alter table public.family_settings disable row level security;
alter table public.profiles disable row level security;
alter table public.tasks disable row level security;
alter table public.store_items disable row level security;
alter table public.reward_redemptions disable row level security;
alter table public.avatar_actives disable row level security;
alter table public.medal_definitions disable row level security;
alter table public.manual_medal_overrides disable row level security;
alter table public.habit_definitions disable row level security;
alter table public.habit_logs disable row level security;
alter table public.play_stats disable row level security;
alter table public.app_state_snapshots disable row level security;
