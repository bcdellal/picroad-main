-- PicRoad Supabase schema
-- Run this in Supabase SQL Editor after creating a project.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.moments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,
  caption text not null default '',
  latitude double precision not null,
  longitude double precision not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);

create index if not exists moments_expires_at_idx on public.moments(expires_at);
create index if not exists moments_created_at_idx on public.moments(created_at);
create index if not exists moments_user_id_idx on public.moments(user_id);

create table if not exists public.route_points (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  recorded_at timestamptz not null default now()
);

create index if not exists route_points_user_recorded_idx
  on public.route_points(user_id, recorded_at);

create table if not exists public.moment_likes (
  moment_id uuid not null references public.moments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (moment_id, user_id)
);

create table if not exists public.moment_comments (
  id uuid primary key default gen_random_uuid(),
  moment_id uuid not null references public.moments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.moments enable row level security;
alter table public.route_points enable row level security;
alter table public.moment_likes enable row level security;
alter table public.moment_comments enable row level security;

create policy "profiles are public to authenticated users"
  on public.profiles for select to authenticated using (true);

create policy "users can create their own profile"
  on public.profiles for insert to authenticated with check (id = auth.uid());

create policy "users can update their own profile"
  on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "active moments are visible to authenticated users"
  on public.moments for select to authenticated
  using (expires_at > now());

create policy "users can create their own moments"
  on public.moments for insert to authenticated
  with check (user_id = auth.uid());

create policy "users can delete their own moments"
  on public.moments for delete to authenticated
  using (user_id = auth.uid());

create policy "users can create their own route points"
  on public.route_points for insert to authenticated
  with check (user_id = auth.uid());

create policy "users can read their own route points"
  on public.route_points for select to authenticated
  using (user_id = auth.uid());

create policy "likes are visible to authenticated users"
  on public.moment_likes for select to authenticated using (true);

create policy "users can like as themselves"
  on public.moment_likes for insert to authenticated
  with check (user_id = auth.uid());

create policy "users can remove their own likes"
  on public.moment_likes for delete to authenticated
  using (user_id = auth.uid());

create policy "comments are visible to authenticated users"
  on public.moment_comments for select to authenticated using (true);

create policy "users can comment as themselves"
  on public.moment_comments for insert to authenticated
  with check (user_id = auth.uid());

create policy "users can delete their own comments"
  on public.moment_comments for delete to authenticated
  using (user_id = auth.uid());

-- Remove expired moments and their storage objects with a scheduled Edge Function.
-- Do not rely on client-side deletion for server-side expiry.
