begin;

create table if not exists public.live_room_participants (
  room_id uuid not null references public.live_rooms(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (room_id, profile_id)
);

alter table public.messages alter column conversation_id drop not null;
alter table public.messages add column if not exists live_room_id uuid references public.live_rooms(id) on delete cascade;
alter table public.messages add column if not exists sender_id uuid references public.profiles(id) on delete set null;
alter table public.messages add column if not exists sender_name text not null default 'Member';
alter table public.messages drop constraint if exists messages_sender_check;
alter table public.messages add constraint messages_sender_check
  check (sender in ('midigo', 'fan', 'chatter'));
alter table public.messages drop constraint if exists messages_context_check;
alter table public.messages add constraint messages_context_check check (
  (conversation_id is not null) <> (live_room_id is not null)
);

create or replace function public.sync_conversation_message_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' and new.conversation_id is not null then
    update public.conversations
    set message_count = message_count + 1, updated_at = now()
    where id = new.conversation_id;
    return new;
  elsif tg_op = 'DELETE' and old.conversation_id is not null then
    update public.conversations
    set message_count = greatest(0, message_count - 1), updated_at = now()
    where id = old.conversation_id;
    return old;
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists messages_sync_conversation_count on public.messages;
create trigger messages_sync_conversation_count
  after insert or delete on public.messages
  for each row execute procedure public.sync_conversation_message_count();

create or replace function public.join_live_room(target_room_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  participant_count integer;
  room_status text;
  room_capacity integer;
begin
  if current_user_id is null then
    raise exception 'Sign in to join a live room.';
  end if;

  select status, max_participants into room_status, room_capacity
  from public.live_rooms where id = target_room_id for update;

  if room_status is distinct from 'live' then
    raise exception 'This room is not live.';
  end if;

  if not exists (
    select 1 from public.live_room_participants
    where room_id = target_room_id and profile_id = current_user_id
  ) and room_capacity is not null and (
    select count(*) from public.live_room_participants where room_id = target_room_id
  ) >= room_capacity then
    raise exception 'This room is full.';
  end if;

  insert into public.live_room_participants (room_id, profile_id)
  values (target_room_id, current_user_id)
  on conflict (room_id, profile_id) do nothing;

  update public.live_rooms
  set current_participants = (
    select count(*) from public.live_room_participants where room_id = target_room_id
  )
  where id = target_room_id
  returning current_participants into participant_count;

  return participant_count;
end;
$$;

create or replace function public.leave_live_room(target_room_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  participant_count integer;
begin
  if current_user_id is null then
    raise exception 'Sign in to leave a live room.';
  end if;

  perform 1 from public.live_rooms where id = target_room_id for update;

  delete from public.live_room_participants
  where room_id = target_room_id and profile_id = current_user_id;

  update public.live_rooms
  set current_participants = (
    select count(*) from public.live_room_participants where room_id = target_room_id
  )
  where id = target_room_id
  returning current_participants into participant_count;

  return coalesce(participant_count, 0);
end;
$$;

alter table public.live_room_participants enable row level security;
drop policy if exists "room_participants_self_read" on public.live_room_participants;
create policy "room_participants_self_read" on public.live_room_participants
  for select using (profile_id = auth.uid());

drop policy if exists "conversations_fan_read" on public.conversations;
drop policy if exists "conversations_access_read" on public.conversations;
create policy "conversations_access_read" on public.conversations
  for select using (
    exists (select 1 from public.fans f where f.id = fan_id and f.profile_id = auth.uid())
    or exists (select 1 from public.profiles p where p.id = auth.uid()
      and p.role in ('chatter', 'moderator', 'administrator'))
  );
drop policy if exists "conversations_fan_create" on public.conversations;
create policy "conversations_fan_create" on public.conversations
  for insert with check (
    exists (select 1 from public.fans f where f.id = fan_id and f.profile_id = auth.uid())
  );

drop policy if exists "messages_fan_read" on public.messages;
drop policy if exists "messages_access_read" on public.messages;
create policy "messages_access_read" on public.messages
  for select using (
    (conversation_id is not null and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (
        exists (select 1 from public.fans f where f.id = c.fan_id and f.profile_id = auth.uid())
        or exists (select 1 from public.profiles p where p.id = auth.uid()
          and p.role in ('chatter', 'moderator', 'administrator'))
      )
    ))
    or (live_room_id is not null and auth.role() = 'authenticated')
  );
drop policy if exists "messages_access_insert" on public.messages;
create policy "messages_access_insert" on public.messages
  for insert with check (
    sender_id = auth.uid()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and (
      (p.role = 'fan' and sender = 'fan')
      or (p.role = 'chatter' and sender = 'chatter')
      or (p.role in ('moderator', 'administrator') and sender = 'midigo')
    ))
    and (
      (conversation_id is not null and exists (
        select 1 from public.conversations c where c.id = conversation_id and (
          exists (select 1 from public.fans f where f.id = c.fan_id and f.profile_id = auth.uid())
          or exists (select 1 from public.profiles p where p.id = auth.uid()
            and p.role in ('chatter', 'moderator', 'administrator'))
        )
      ))
      or (live_room_id is not null and (
        sender = 'chatter'
        or exists (select 1 from public.live_room_participants rp
          where rp.room_id = live_room_id and rp.profile_id = auth.uid())
      ))
    )
  );

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'live_rooms') then
      alter publication supabase_realtime add table public.live_rooms;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages') then
      alter publication supabase_realtime add table public.messages;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'conversations') then
      alter publication supabase_realtime add table public.conversations;
    end if;
  end if;
end;
$$;

commit;
