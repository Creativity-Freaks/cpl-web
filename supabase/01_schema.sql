-- Run this SQL in your Supabase project's SQL editor
-- Profiles table to store CPL user metadata
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text unique,
  role text check (role in ('admin','player')) default 'player',
  avatar_url text,
  session text,
  player_type text,
  semester text,
  payment_method text,
  transaction_id text,
  payment_number text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Update trigger to maintain updated_at
-- (Optional) Add an updated_at trigger if desired via Supabase SQL editor
-- create or replace function public.set_updated_at()
-- returns trigger as $$
-- begin
--   new.updated_at = now();
--   return new;
-- end;
-- $$ language plpgsql;
-- create trigger set_profiles_updated_at before update on public.profiles
-- for each row execute procedure public.set_updated_at();

-- Ensure `session` column exists (idempotent)
-- Ensure `session` column exists (idempotent)
do $$
begin
  begin
    alter table public.profiles add column session text;
  exception when duplicate_column then
    -- column already exists, ignore
    null;
  end;
end$$;

-- Add a trigger to keep updated_at current on update (idempotent)
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles
for each row execute procedure public.set_updated_at();

-- OPTIONAL: Make certain profile fields NOT NULL for stricter validation (run only if you want enforced constraints)
-- alter table public.profiles
--   alter column name set not null,
--   alter column email set not null,
--   alter column player_type set not null,
--   alter column semester set not null;

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- RLS policies: users can view own profile and public minimal info
create policy "Profiles are viewable by everyone" on public.profiles
  for select using ( true );

create policy "Users can insert their own profile" on public.profiles
  for insert with check ( auth.uid() = id );

create policy "Users can update own profile" on public.profiles
  for update using ( auth.uid() = id );

-- Storage bucket for avatars (create via dashboard or use the API)
-- In the Supabase Dashboard, create a bucket named 'avatars' and set it to public.
-- Then add storage policies to allow users to upload to their own folder paths.

-- Optional minimal tournament tables to start dynamics
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_name text,
  color text,
  logo_url text
);

create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  season int not null,
  name text not null,
  start_date date,
  end_date date,
  description text
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references public.tournaments(id) on delete cascade,
  match_date timestamp with time zone,
  team_a uuid references public.teams(id) on delete set null,
  team_b uuid references public.teams(id) on delete set null,
  venue text,
  status text check (status in ('upcoming','live','completed')) default 'upcoming',
  scorecard jsonb
);

alter table public.teams enable row level security;
alter table public.tournaments enable row level security;
alter table public.matches enable row level security;

create policy "Read public data" on public.teams for select using ( true );
create policy "Read public data" on public.tournaments for select using ( true );
create policy "Read public data" on public.matches for select using ( true );

-- Team members linking profiles to teams for rosters
create table if not exists public.team_members (
  team_id uuid references public.teams(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  role text, -- optional role label; profiles.player_type also available
  joined_at timestamp with time zone default now(),
  primary key (team_id, profile_id)
);

alter table public.team_members enable row level security;
create policy "Read public team members" on public.team_members for select using ( true );
