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

drop policy if exists "matches_select_friends" on public.matches;
create policy "matches_select_friends" on public.matches
  for select using (
    auth.uid() = user_id
    or exists (
      select 1 from public.friendships f
      where f.status = 'accepted'
        and (
          (f.requester_id = auth.uid() and f.addressee_id = user_id)
          or (f.addressee_id = auth.uid() and f.requester_id = user_id)
        )
    )
  );


create table if not exists public.invite_codes (
  code text primary key,
  active boolean not null default true,
  max_uses int,
  uses_count int not null default 0,
  created_at timestamptz default now()
);

alter table public.invite_codes enable row level security;

create or replace function public.verify_and_consume_invite_code(p_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.invite_codes%rowtype;
begin
  if p_code is null or length(trim(p_code)) = 0 then
    return false;
  end if;

  select * into v_row
  from public.invite_codes
  where upper(code) = upper(trim(p_code))
    and active = true
  for update;

  if not found then
    return false;
  end if;

  if v_row.max_uses is not null and v_row.uses_count >= v_row.max_uses then
    return false;
  end if;

  update public.invite_codes
  set uses_count = uses_count + 1,
      active = case when max_uses is not null and uses_count + 1 >= max_uses then false else active end
  where code = v_row.code;

  return true;
end;
$$;
insert into public.invite_codes (code, active, max_uses)
values ('VTRVWZ', true, null)
on conflict (code) do update set active = true;
