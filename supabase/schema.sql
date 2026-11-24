-- WZ-TRVKER : Schéma complet Supabase (Profils, Matchs, Amis & Camos)
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  friend_code text unique,
  activision_id text,
  prestige int default 0,
  level int default 1,
  xp_total bigint default 0,
  xp_border text default 'bronze',
  updated_at timestamptz default now()
);

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'blocked')),
  created_at timestamptz default now(),
  unique (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);

create table if not exists public.matches (
  id text primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.user_camo_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  camo_id text not null,
  weapon_name text not null default 'Warzone Global',
  unlocked boolean not null default false,
  unlocked_at timestamptz,
  updated_at timestamptz default now(),
  unique (user_id, camo_id)
);

alter table public.profiles enable row level security;
alter table public.friendships enable row level security;
alter table public.matches enable row level security;
alter table public.user_camo_progress enable row level security;

drop policy if exists "profiles_select_auth" on public.profiles;
create policy "profiles_select_auth" on public.profiles for select using (auth.role() = 'authenticated');

drop policy if exists "profiles_upsert_own" on public.profiles;
create policy "profiles_upsert_own" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "matches_all_own" on public.matches;
create policy "matches_all_own" on public.matches for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "camo_progress_all_own" on public.user_camo_progress;
create policy "camo_progress_all_own" on public.user_camo_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "friendships_involved" on public.friendships;
create policy "friendships_involved" on public.friendships for all using (auth.uid() = requester_id or auth.uid() = addressee_id);
