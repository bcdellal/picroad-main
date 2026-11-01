-- PicRoad direct messaging MVP. Run once in Supabase SQL Editor.
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now(),
  read_at timestamptz,
  constraint messages_not_self check (sender_id <> recipient_id)
);
create index if not exists messages_sender_created_idx on public.messages(sender_id, created_at desc);
create index if not exists messages_recipient_created_idx on public.messages(recipient_id, created_at desc);
alter table public.messages enable row level security;
drop policy if exists "friends can read direct messages" on public.messages;
drop policy if exists "friends can send direct messages" on public.messages;
drop policy if exists "recipients can mark messages read" on public.messages;
create policy "friends can read direct messages" on public.messages for select to authenticated
using ((sender_id = auth.uid() or recipient_id = auth.uid()) and exists (
 select 1 from public.friendships f where f.status = 'accepted' and
 ((f.requester_id = messages.sender_id and f.addressee_id = messages.recipient_id) or
  (f.requester_id = messages.recipient_id and f.addressee_id = messages.sender_id))
));
create policy "friends can send direct messages" on public.messages for insert to authenticated
with check (sender_id = auth.uid() and exists (
 select 1 from public.friendships f where f.status = 'accepted' and
 ((f.requester_id = messages.sender_id and f.addressee_id = messages.recipient_id) or
  (f.requester_id = messages.recipient_id and f.addressee_id = messages.sender_id))
));
create policy "recipients can mark messages read" on public.messages for update to authenticated
using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());