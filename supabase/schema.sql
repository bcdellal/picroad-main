-- PicRoad Supabase schema
-- Run in Supabase SQL Editor. This script is safe to re-run.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- A friendship is directional while pending; either row can represent an accepted friendship.
create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint friendships_not_self check (requester_id <> addressee_id),
  constraint friendships_unique_pair unique (requester_id, addressee_id)
);

create index if not exists friendships_requester_status_idx
  on public.friendships(requester_id, status);
create index if not exists friendships_addressee_status_idx
  on public.friendships(addressee_id, status);

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

create index if not exists moment_likes_moment_id_idx on public.moment_likes(moment_id);
create index if not exists moment_comments_moment_id_idx on public.moment_comments(moment_id);

-- SECURITY DEFINER avoids recursive RLS when the 1,000-like threshold is evaluated.
create or replace function public.moment_like_count(target_moment_id uuid)
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::bigint
  from public.moment_likes
  where moment_id = target_moment_id;
$$;

revoke all on function public.moment_like_count(uuid) from public;
grant execute on function public.moment_like_count(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.friendships enable row level security;
alter table public.moments enable row level security;
alter table public.route_points enable row level security;
alter table public.moment_likes enable row level security;
alter table public.moment_comments enable row level security;

drop policy if exists "profiles are public to authenticated users" on public.profiles;
drop policy if exists "users can create their own profile" on public.profiles;
drop policy if exists "users can update their own profile" on public.profiles;
create policy "profiles are visible to authenticated users"
  on public.profiles for select to authenticated using (true);
create policy "users can create their own profile"
  on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "users can update their own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "friendship participants can read requests" on public.friendships;
drop policy if exists "users can send friend requests" on public.friendships;
drop policy if exists "recipients can accept friend requests" on public.friendships;
create policy "friendship participants can read requests"
  on public.friendships for select to authenticated
  using (requester_id = auth.uid() or addressee_id = auth.uid());
create policy "users can send friend requests"
  on public.friendships for insert to authenticated
  with check (requester_id = auth.uid() and status = 'pending');
create policy "recipients can accept friend requests"
  on public.friendships for update to authenticated
  using (addressee_id = auth.uid() and status = 'pending')
  with check (addressee_id = auth.uid() and status = 'accepted');

drop policy if exists "active moments are visible to authenticated users" on public.moments;
drop policy if exists "owners friends and popular moments are visible" on public.moments;
create policy "owners friends and popular moments are visible"
  on public.moments for select to authenticated
  using (
    expires_at > now()
    and (
      user_id = auth.uid()
      or exists (
        select 1 from public.friendships f
        where f.status = 'accepted'
          and (
            (f.requester_id = auth.uid() and f.addressee_id = moments.user_id)
            or (f.addressee_id = auth.uid() and f.requester_id = moments.user_id)
          )
      )
      or public.moment_like_count(id) >= 1000
    )
  );

drop policy if exists "users can create their own moments" on public.moments;
drop policy if exists "users can delete their own moments" on public.moments;
create policy "users can create their own moments"
  on public.moments for insert to authenticated
  with check (user_id = auth.uid());
create policy "users can delete their own moments"
  on public.moments for delete to authenticated using (user_id = auth.uid());

drop policy if exists "users can create their own route points" on public.route_points;
drop policy if exists "users can read their own route points" on public.route_points;
create policy "users can create their own route points"
  on public.route_points for insert to authenticated with check (user_id = auth.uid());
create policy "users can read their own route points"
  on public.route_points for select to authenticated using (user_id = auth.uid());

drop policy if exists "likes are visible to authenticated users" on public.moment_likes;
drop policy if exists "likes visible when moment is visible" on public.moment_likes;
drop policy if exists "users can like as themselves" on public.moment_likes;
drop policy if exists "users can remove their own likes" on public.moment_likes;
create policy "likes visible when moment is visible"
  on public.moment_likes for select to authenticated
  using (exists (select 1 from public.moments m where m.id = moment_id));
create policy "users can like as themselves"
  on public.moment_likes for insert to authenticated
  with check (user_id = auth.uid());
create policy "users can remove their own likes"
  on public.moment_likes for delete to authenticated using (user_id = auth.uid());

drop policy if exists "comments are visible to authenticated users" on public.moment_comments;
drop policy if exists "comments visible when moment is visible" on public.moment_comments;
drop policy if exists "users can comment as themselves" on public.moment_comments;
drop policy if exists "users can delete their own comments" on public.moment_comments;
create policy "comments visible when moment is visible"
  on public.moment_comments for select to authenticated
  using (exists (select 1 from public.moments m where m.id = moment_id));
create policy "users can comment as themselves"
  on public.moment_comments for insert to authenticated
  with check (user_id = auth.uid());
create policy "users can delete their own comments"
  on public.moment_comments for delete to authenticated using (user_id = auth.uid());

-- Private bucket: photos are readable only when their Moment is readable.
insert into storage.buckets (id, name, public)
values ('moments', 'moments', false)
on conflict (id) do update set public = false;

drop policy if exists "moment photos public read" on storage.objects;
drop policy if exists "moment photos upload own folder" on storage.objects;
drop policy if exists "moment photos delete own folder" on storage.objects;
drop policy if exists "moment photos visible with moment access" on storage.objects;

create policy "moment photos upload own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'moments'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "moment photos visible with moment access"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'moments'
    and exists (
      select 1 from public.moments m
      where m.storage_path = name
        and m.expires_at > now()
        and (
          m.user_id = auth.uid()
          or exists (
            select 1 from public.friendships f
            where f.status = 'accepted'
              and (
                (f.requester_id = auth.uid() and f.addressee_id = m.user_id)
                or (f.addressee_id = auth.uid() and f.requester_id = m.user_id)
              )
          )
          or public.moment_like_count(m.id) >= 1000
        )
    )
  );

create policy "moment photos delete own folder"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'moments'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

-- Expired records and their storage objects still require a scheduled server-side cleanup job.
