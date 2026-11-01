-- PicRoad friendship actions: allow recipients to reject pending requests.
-- Run once in Supabase SQL Editor.
drop policy if exists "recipients can reject friend requests" on public.friendships;
create policy "recipients can reject friend requests"
  on public.friendships for delete to authenticated
  using (addressee_id = auth.uid() and status = 'pending');
