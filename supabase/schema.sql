-- ============================================================
--  MIDIGO — Supabase SQL Schema
--  Paste this into: Supabase → SQL Editor → Run
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Helper: updated_at trigger ──────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─── Helper: new user profile trigger ────────────────────────
-- Automatically creates a profile row when a user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================================
--  TABLES
-- ============================================================

-- ─── profiles ────────────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid primary key references auth.users on delete cascade,
  email         text not null unique,
  name          text,
  handle        text unique,
  avatar_url    text,
  role          text not null default 'fan'
                  check (role in ('fan','chatter','moderator','editor','administrator')),
  membership    text not null default 'free'
                  check (membership in ('free','standard','vip','founding','lifetime')),
  status        text not null default 'active'
                  check (status in ('active','pending','suspended')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- ─── fans ────────────────────────────────────────────────────
create table if not exists public.fans (
  id            uuid primary key default uuid_generate_v4(),
  profile_id    uuid references public.profiles(id) on delete set null,
  name          text not null,
  handle        text not null unique,
  membership    text not null default 'free',
  engagement    text not null default 'medium'
                  check (engagement in ('low','medium','high','very_high')),
  status        text not null default 'active'
                  check (status in ('active','vip','at_risk','churned')),
  joined_at     timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

-- ─── chatters ────────────────────────────────────────────────
create table if not exists public.chatters (
  id                   uuid primary key default uuid_generate_v4(),
  profile_id           uuid references public.profiles(id) on delete set null,
  name                 text not null,
  queue                text not null default 'General',
  presence             text not null default 'offline'
                         check (presence in ('online','away','offline')),
  active_conversations integer not null default 0,
  avg_response_time    text,
  status               text not null default 'offline'
                         check (status in ('available','busy','offline')),
  created_at           timestamptz not null default now()
);

-- ─── media_assets ────────────────────────────────────────────
create table if not exists public.media_assets (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  category      text not null default 'Other',
  storage_path  text,
  visibility    text not null default 'public'
                  check (visibility in ('public','members','vip')),
  status        text not null default 'draft'
                  check (status in ('published','draft','locked')),
  uploaded_by   uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger media_assets_updated_at before update on public.media_assets
  for each row execute procedure public.handle_updated_at();

-- ─── live_rooms ──────────────────────────────────────────────
create table if not exists public.live_rooms (
  id                   uuid primary key default uuid_generate_v4(),
  title                text not null,
  host                 text not null default 'Midigo',
  max_participants     integer,
  current_participants integer not null default 0,
  status               text not null default 'upcoming'
                         check (status in ('live','upcoming','ended')),
  scheduled_at         timestamptz,
  started_at           timestamptz,
  ended_at             timestamptz,
  created_at           timestamptz not null default now()
);

-- Room memberships make participant counts idempotent per signed-in user.
create table if not exists public.live_room_participants (
  room_id    uuid not null references public.live_rooms(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  joined_at  timestamptz not null default now(),
  primary key (room_id, profile_id)
);

-- ─── conversations ───────────────────────────────────────────
create table if not exists public.conversations (
  id             uuid primary key default uuid_generate_v4(),
  fan_id         uuid references public.fans(id) on delete set null,
  fan_name       text not null,
  subject        text not null,
  assignee_id    uuid references public.chatters(id) on delete set null,
  assignee_name  text not null default 'Unassigned',
  message_count  integer not null default 0,
  status         text not null default 'open'
                   check (status in ('open','waiting','resolved')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger conversations_updated_at before update on public.conversations
  for each row execute procedure public.handle_updated_at();

-- ─── messages ────────────────────────────────────────────────
create table if not exists public.messages (
  id                  uuid primary key default uuid_generate_v4(),
  conversation_id     uuid references public.conversations(id) on delete cascade,
  live_room_id        uuid references public.live_rooms(id) on delete cascade,
  sender_id           uuid references public.profiles(id) on delete set null,
  sender_name         text not null default 'Member',
  sender              text not null check (sender in ('midigo','fan','chatter')),
  type                text not null default 'text' check (type in ('text','voice')),
  content             text,
  voice_duration      text,
  voice_storage_path  text,
  read                boolean not null default false,
  created_at          timestamptz not null default now()
  ,constraint messages_context_check check (
    (conversation_id is not null) <> (live_room_id is not null)
  )
);

-- Keep this schema safe to re-run against projects created before room chat existed.
alter table public.messages alter column conversation_id drop not null;
alter table public.messages add column if not exists live_room_id uuid references public.live_rooms(id) on delete cascade;
alter table public.messages add column if not exists sender_id uuid references public.profiles(id) on delete set null;
alter table public.messages add column if not exists sender_name text not null default 'Member';
alter table public.messages drop constraint if exists messages_sender_check;
alter table public.messages add constraint messages_sender_check check (sender in ('midigo','fan','chatter'));
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

revoke all on function public.join_live_room(uuid) from public, anon;
revoke all on function public.leave_live_room(uuid) from public, anon;
grant execute on function public.join_live_room(uuid) to authenticated;
grant execute on function public.leave_live_room(uuid) to authenticated;

-- ─── content_articles ────────────────────────────────────────
create table if not exists public.content_articles (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  type          text not null default 'Article',
  category      text not null default 'General',
  status        text not null default 'draft'
                  check (status in ('published','draft','scheduled')),
  author_id     uuid references public.profiles(id) on delete set null,
  author_name   text not null default 'Team Midigo',
  body          text,
  scheduled_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger content_articles_updated_at before update on public.content_articles
  for each row execute procedure public.handle_updated_at();

-- ─── memberships ─────────────────────────────────────────────
create table if not exists public.memberships (
  id            uuid primary key default uuid_generate_v4(),
  fan_id        uuid references public.fans(id) on delete set null,
  member_name   text not null,
  plan          text not null,
  amount_cents  integer not null default 0,
  currency      text not null default 'usd',
  status        text not null default 'active'
                  check (status in ('active','past_due','cancelled','refunded')),
  renewal_at    timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger memberships_updated_at before update on public.memberships
  for each row execute procedure public.handle_updated_at();

-- ─── moderation_cases ────────────────────────────────────────
create table if not exists public.moderation_cases (
  id           uuid primary key default uuid_generate_v4(),
  target       text not null,
  reason       text not null,
  severity     text not null default 'low'
                 check (severity in ('low','medium','high')),
  status       text not null default 'open'
                 check (status in ('open','in_review','resolved')),
  reporter     text not null default 'System',
  assigned_to  text,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger moderation_cases_updated_at before update on public.moderation_cases
  for each row execute procedure public.handle_updated_at();

-- ─── audit_events ────────────────────────────────────────────
create table if not exists public.audit_events (
  id          uuid primary key default uuid_generate_v4(),
  actor       text not null,
  action      text not null,
  target      text not null,
  outcome     text not null default 'success'
                check (outcome in ('success','denied','warning')),
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

-- ─── roles ───────────────────────────────────────────────────
create table if not exists public.roles (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null unique,
  description   text not null default '',
  member_count  integer not null default 0,
  created_at    timestamptz not null default now()
);

-- ─── role_permissions ────────────────────────────────────────
create table if not exists public.role_permissions (
  id          uuid primary key default uuid_generate_v4(),
  role_id     uuid not null references public.roles(id) on delete cascade,
  permission  text not null,
  unique (role_id, permission)
);


-- ============================================================
--  ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles          enable row level security;
alter table public.fans               enable row level security;
alter table public.chatters           enable row level security;
alter table public.media_assets       enable row level security;
alter table public.live_rooms         enable row level security;
alter table public.live_room_participants enable row level security;
alter table public.conversations      enable row level security;
alter table public.messages           enable row level security;
alter table public.content_articles   enable row level security;
alter table public.memberships        enable row level security;
alter table public.moderation_cases   enable row level security;
alter table public.audit_events       enable row level security;
alter table public.roles              enable row level security;
alter table public.role_permissions   enable row level security;

create or replace function public.current_profile_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;
revoke all on function public.current_profile_role() from public, anon;
grant execute on function public.current_profile_role() to authenticated;

-- Table privileges are required before the RLS policies below can be evaluated.
grant usage on schema public to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.fans, public.chatters to authenticated;
grant select on public.media_assets to anon, authenticated;
grant insert, update, delete on public.media_assets to authenticated;
grant select on public.live_rooms to anon, authenticated;
grant insert, update, delete on public.live_rooms to authenticated;
grant select on public.live_room_participants to authenticated;
grant select, insert, update on public.conversations to authenticated;
grant select, insert on public.messages to authenticated;
grant select on public.content_articles to anon, authenticated;
grant insert, update, delete on public.content_articles to authenticated;
grant select, insert, update, delete on public.memberships to authenticated;
grant select, insert, update, delete on public.moderation_cases to authenticated;
grant select, insert on public.audit_events to authenticated;
grant select on public.roles, public.role_permissions to authenticated;

-- profiles: users can read/update their own row
-- Self-service is restricted to safe columns (name, avatar_url, handle).
-- Privileged columns (role, membership, status) require admin — enforced
-- at both the Server Action layer and the database layer below.
create policy "profiles_own_read"   on public.profiles for select using (auth.uid() = id);
create policy "profiles_own_update" on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    -- Prevent self-promotion: reject updates to privileged columns.
    AND (
      COALESCE(role, '') = COALESCE(OLD.role, '')
      AND COALESCE(membership, '') = COALESCE(OLD.membership, '')
      AND COALESCE(status, '') = COALESCE(OLD.status, '')
    )
  );
drop policy if exists "profiles_staff_read" on public.profiles;
create policy "profiles_staff_read" on public.profiles for select using (
  public.current_profile_role() in ('chatter', 'moderator', 'editor', 'administrator')
);

-- Admins can update any profile, including privileged columns.
create policy "profiles_staff_update" on public.profiles for update
  using (
    public.current_profile_role() in ('editor', 'administrator')
  )
  with check (true);

-- fans, chatters: authenticated users can read; admins/moderators manage
create policy "fans_read_auth"     on public.fans     for select using (auth.role() = 'authenticated');
create policy "chatters_read_auth" on public.chatters for select using (auth.role() = 'authenticated');

-- media: public rows are visible to everyone; members/vip require auth
create policy "media_public_read" on public.media_assets
  for select using (visibility = 'public' or auth.role() = 'authenticated');

-- media: editors+ can insert/update/delete assets
-- INSERT: any authenticated user with role editor or administrator
-- UPDATE/DELETE: only the uploader or any editor/administrator
create policy "media_write_admin" on public.media_assets
  for insert with check (auth.uid() = uploaded_by);
create policy "media_update_admin" on public.media_assets
  for update using (
    auth.uid() = uploaded_by
    or exists (select 1 from public.profiles p
      where p.id = auth.uid()
      and p.role in ('editor', 'administrator'))
  );
create policy "media_delete_admin" on public.media_assets
  for delete using (
    auth.uid() = uploaded_by
    or exists (select 1 from public.profiles p
      where p.id = auth.uid()
      and p.role in ('editor', 'administrator'))
  );

-- live_rooms: public read
create policy "rooms_public_read" on public.live_rooms for select using (true);

-- live_rooms: editors+ can create/update/delete rooms
create policy "rooms_write_admin" on public.live_rooms
  for all using (
    exists (select 1 from public.profiles p
      where p.id = auth.uid()
      and p.role in ('editor', 'administrator'))
  ) with check (
    exists (select 1 from public.profiles p
      where p.id = auth.uid()
      and p.role in ('editor', 'administrator'))
  );

drop policy if exists "room_participants_self_read" on public.live_room_participants;
create policy "room_participants_self_read" on public.live_room_participants
  for select using (profile_id = auth.uid());

-- Fans can access their own conversations; staff can access the queue.
drop policy if exists "conversations_fan_read" on public.conversations;
drop policy if exists "conversations_access_read" on public.conversations;
create policy "conversations_access_read" on public.conversations
  for select using (
    exists (select 1 from public.fans f where f.id = fan_id and f.profile_id = auth.uid())
    or exists (select 1 from public.profiles p where p.id = auth.uid()
      and p.role in ('chatter','moderator','administrator'))
  );
drop policy if exists "conversations_fan_create" on public.conversations;
create policy "conversations_fan_create" on public.conversations
  for insert with check (
    exists (select 1 from public.fans f where f.id = fan_id and f.profile_id = auth.uid())
  );
create policy "conversations_staff_create" on public.conversations
  for insert with check (
    exists (select 1 from public.profiles p where p.id = auth.uid()
      and p.role in ('chatter', 'moderator', 'administrator'))
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
          and p.role in ('chatter','moderator','administrator'))
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
      or (p.role in ('moderator','administrator') and sender = 'midigo')
    ))
    and (
      (conversation_id is not null and exists (
        select 1 from public.conversations c where c.id = conversation_id and (
          exists (select 1 from public.fans f where f.id = c.fan_id and f.profile_id = auth.uid())
          or exists (select 1 from public.profiles p where p.id = auth.uid()
            and p.role in ('chatter','moderator','administrator'))
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

-- content_articles: published articles are public; drafts require auth
create policy "content_published_read" on public.content_articles
  for select using (status = 'published' or auth.role() = 'authenticated');

-- memberships: authenticated users see records (service key for admin queries)
create policy "memberships_own_read" on public.memberships
  for select using (auth.role() = 'authenticated');

-- moderation, audit, roles: staff only
create policy "mod_cases_staff_read"    on public.moderation_cases for select using (auth.role() = 'authenticated');
create policy "audit_events_staff_read" on public.audit_events     for select using (auth.role() = 'authenticated');
create policy "roles_public_read"       on public.roles             for select using (auth.role() = 'authenticated');
create policy "role_perms_read"         on public.role_permissions  for select using (auth.role() = 'authenticated');

-- moderation_cases: moderators+ can insert/update/delete cases
create policy "mod_cases_write_staff" on public.moderation_cases
  for all using (
    exists (select 1 from public.profiles p
      where p.id = auth.uid()
      and p.role in ('moderator', 'editor', 'administrator'))
  ) with check (
    exists (select 1 from public.profiles p
      where p.id = auth.uid()
      and p.role in ('moderator', 'editor', 'administrator'))
  );

-- audit_events: staff can insert moderation and administration events
create policy "audit_events_write_staff" on public.audit_events
  for insert with check (
    exists (select 1 from public.profiles p
      where p.id = auth.uid()
      and p.role in ('chatter', 'moderator', 'editor', 'administrator'))
  );

-- content_articles: editors+ can insert/update/delete content
create policy "content_write_staff" on public.content_articles
  for all using (
    exists (select 1 from public.profiles p
      where p.id = auth.uid()
      and p.role in ('editor', 'administrator'))
  ) with check (
    exists (select 1 from public.profiles p
      where p.id = auth.uid()
      and p.role in ('editor', 'administrator'))
  );

-- memberships: administrators can insert/update/delete memberships
create policy "memberships_write_admin" on public.memberships
  for all using (
    exists (select 1 from public.profiles p
      where p.id = auth.uid()
      and p.role in ('administrator'))
  ) with check (
    exists (select 1 from public.profiles p
      where p.id = auth.uid()
      and p.role in ('administrator'))
  );

-- fans: administrators can insert/update/delete fan records
create policy "fans_write_admin" on public.fans
  for all using (
    exists (select 1 from public.profiles p
      where p.id = auth.uid()
      and p.role in ('administrator', 'moderator'))
  ) with check (
    exists (select 1 from public.profiles p
      where p.id = auth.uid()
      and p.role in ('administrator', 'moderator'))
  );

-- chatters: administrators can insert/update/delete chatter records
create policy "chatters_write_admin" on public.chatters
  for all using (
    exists (select 1 from public.profiles p
      where p.id = auth.uid()
      and p.role in ('administrator', 'moderator'))
  ) with check (
    exists (select 1 from public.profiles p
      where p.id = auth.uid()
      and p.role in ('administrator', 'moderator'))
  );

-- profiles: administrators can insert new profiles and update roles/status for others
create policy "profiles_write_admin" on public.profiles
  for insert with check (
    public.current_profile_role() in ('administrator', 'moderator', 'editor')
  );
drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin" on public.profiles
  for update using (
    auth.uid() = id
    or public.current_profile_role() in ('administrator', 'moderator', 'editor')
  ) with check (
    auth.uid() = id
    or public.current_profile_role() in ('administrator', 'moderator', 'editor')
  );

-- conversations: staff can update assignment/status for any conversation
create policy "conversations_update_staff" on public.conversations
  for update using (
    exists (select 1 from public.profiles p
      where p.id = auth.uid()
      and p.role in ('chatter', 'moderator', 'administrator'))
  );


-- ============================================================
--  SEED DATA  (matches TypeScript mock data)
-- ============================================================

-- roles
insert into public.roles (id, name, description, member_count) values
  ('00000000-0000-0000-0000-000000000001', 'Administrator', 'Full access to workspace settings and all modules.', 2),
  ('00000000-0000-0000-0000-000000000002', 'Moderator',     'Review reports and manage live-room safety.',        4),
  ('00000000-0000-0000-0000-000000000003', 'Editor',        'Create and publish platform content.',               3),
  ('00000000-0000-0000-0000-000000000004', 'Support',       'Assist members and resolve conversations.',          6)
on conflict (name) do nothing;

-- role_permissions
insert into public.role_permissions (role_id, permission) values
  ('00000000-0000-0000-0000-000000000001', 'Manage users'),
  ('00000000-0000-0000-0000-000000000001', 'Manage content'),
  ('00000000-0000-0000-0000-000000000001', 'Manage billing'),
  ('00000000-0000-0000-0000-000000000001', 'View audit logs'),
  ('00000000-0000-0000-0000-000000000002', 'Review reports'),
  ('00000000-0000-0000-0000-000000000002', 'Manage rooms'),
  ('00000000-0000-0000-0000-000000000002', 'View conversations'),
  ('00000000-0000-0000-0000-000000000003', 'Manage content'),
  ('00000000-0000-0000-0000-000000000003', 'Manage media'),
  ('00000000-0000-0000-0000-000000000003', 'View analytics'),
  ('00000000-0000-0000-0000-000000000004', 'View users'),
  ('00000000-0000-0000-0000-000000000004', 'Manage conversations'),
  ('00000000-0000-0000-0000-000000000004', 'View reports')
on conflict (role_id, permission) do nothing;

-- fans
insert into public.fans (id, name, handle, membership, engagement, status, joined_at) values
  ('10000000-0000-0000-0000-000000000001', 'Elena Stone',  '@elena',  'VIP',      'high',   'vip',     '2026-01-01'),
  ('10000000-0000-0000-0000-000000000002', 'Marcus Lee',   '@marcus', 'Standard', 'medium', 'active',  '2026-02-01'),
  ('10000000-0000-0000-0000-000000000003', 'Nora James',   '@nora',   'VIP',      'high',   'vip',     '2026-03-01'),
  ('10000000-0000-0000-0000-000000000004', 'Owen King',    '@owen',   'Standard', 'low',    'at_risk', '2026-04-01'),
  ('10000000-0000-0000-0000-000000000005', 'Priya Shah',   '@priya',  'Founding', 'high',   'active',  '2026-05-01'),
  ('10000000-0000-0000-0000-000000000006', 'Lucas Martin', '@lucas',  'Standard', 'medium', 'active',  '2026-06-01')
on conflict do nothing;

-- chatters
insert into public.chatters (id, name, queue, presence, active_conversations, avg_response_time, status) values
  ('20000000-0000-0000-0000-000000000001', 'Mia Chen',      'General',    'online',  14, '42 sec', 'available'),
  ('20000000-0000-0000-0000-000000000002', 'Noah Williams', 'VIP',        'online',   8, '51 sec', 'busy'),
  ('20000000-0000-0000-0000-000000000003', 'Sofia Reed',    'Support',    'away',     3, '1 min',  'available'),
  ('20000000-0000-0000-0000-000000000004', 'Ethan Brooks',  'General',    'offline',  0, null,     'offline'),
  ('20000000-0000-0000-0000-000000000005', 'Liam Patel',    'Moderation', 'online',   6, '38 sec', 'available')
on conflict do nothing;

-- media_assets
insert into public.media_assets (id, title, category, visibility, status) values
  ('30000000-0000-0000-0000-000000000001', 'Midnight editorial', 'Photoshoot', 'vip',     'published'),
  ('30000000-0000-0000-0000-000000000002', 'Studio diary 04',    'Video',      'members', 'published'),
  ('30000000-0000-0000-0000-000000000003', 'Behind the render',  'Gallery',    'public',  'draft'),
  ('30000000-0000-0000-0000-000000000004', 'Velvet collection',  'Photoshoot', 'vip',     'locked'),
  ('30000000-0000-0000-0000-000000000005', 'Neon welcome',       'Campaign',   'public',  'published'),
  ('30000000-0000-0000-0000-000000000006', 'Private preview',    'Video',      'vip',     'locked')
on conflict do nothing;

-- live_rooms
insert into public.live_rooms (id, title, host, current_participants, status, started_at, scheduled_at) values
  ('40000000-0000-0000-0000-000000000001', 'Midnight lounge',    'Midigo',    128, 'live',     now() - interval '12 minutes', null),
  ('40000000-0000-0000-0000-000000000002', 'Creator Q&A',        'Midigo',     84, 'live',     now() - interval '31 minutes', null),
  ('40000000-0000-0000-0000-000000000003', 'Studio session',     'Midigo',      0, 'upcoming', null, now() + interval '4 hours'),
  ('40000000-0000-0000-0000-000000000004', 'VIP listening room', 'Midigo',     42, 'live',     now() - interval '1 hour',     null),
  ('40000000-0000-0000-0000-000000000005', 'Community hangout',  'Moderator',  67, 'ended',    now() - interval '1 day',      null),
  ('40000000-0000-0000-0000-000000000006', 'New member welcome', 'Midigo',      0, 'upcoming', null, now() + interval '1 day')
on conflict do nothing;

-- conversations
insert into public.conversations (id, fan_id, fan_name, subject, assignee_id, assignee_name, message_count, status) values
  ('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Elena Stone',  'Membership access',  '20000000-0000-0000-0000-000000000001', 'Mia Chen',      12, 'open'),
  ('50000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Marcus Lee',   'Room invitation',    '20000000-0000-0000-0000-000000000002', 'Noah Williams',  8, 'waiting'),
  ('50000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Nora James',   'VIP content',        '20000000-0000-0000-0000-000000000001', 'Mia Chen',      21, 'open'),
  ('50000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'Owen King',    'Account question',   null,                                   'Unassigned',     4, 'waiting'),
  ('50000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'Priya Shah',   'Feedback',           '20000000-0000-0000-0000-000000000005', 'Liam Patel',     9, 'resolved'),
  ('50000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000006', 'Lucas Martin', 'Payment help',       '20000000-0000-0000-0000-000000000004', 'Ethan Brooks',   6, 'open')
on conflict do nothing;

-- messages (conversation 1)
insert into public.messages (id, conversation_id, sender, type, content, read) values
  ('60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'midigo', 'text',  'Hey, I saw you''ve been in almost every chat this week. That means a lot to me, genuinely.', true),
  ('60000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', 'fan',    'text',  'I love what you''ve been building! The Tokyo Neon collection was absolutely stunning.',        true),
  ('60000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000001', 'midigo', 'voice', null, true),
  ('60000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000001', 'midigo', 'text',  'I recorded something special just for you. It''s a sneak peek at the next collection concept — months before anyone else sees it.', false)
on conflict do nothing;

-- content_articles
insert into public.content_articles (id, title, type, category, status, author_name) values
  ('70000000-0000-0000-0000-000000000001', 'Summer drop announcement',  'News',      'Announcements', 'published', 'Liam Patel'),
  ('70000000-0000-0000-0000-000000000002', 'Meet the Midigo muse',      'Editorial', 'Stories',       'scheduled', 'Mia Chen'),
  ('70000000-0000-0000-0000-000000000003', 'How to join a live room',   'Guide',     'Help',          'published', 'Ethan Brooks'),
  ('70000000-0000-0000-0000-000000000004', 'VIP preview notes',         'Draft',     'Internal',      'draft',     'Noah Williams'),
  ('70000000-0000-0000-0000-000000000005', 'Community spotlight',       'News',      'Community',     'scheduled', 'Liam Patel'),
  ('70000000-0000-0000-0000-000000000006', 'Membership changes',        'Update',    'Announcements', 'draft',     'Sofia Reed')
on conflict do nothing;

-- memberships
insert into public.memberships (id, fan_id, member_name, plan, amount_cents, status, renewal_at) values
  ('80000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Elena Stone',  'VIP monthly',      2400,  'active',    '2026-08-01'),
  ('80000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Marcus Lee',   'Standard monthly', 1200,  'past_due',  '2026-07-28'),
  ('80000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Nora James',   'VIP annual',       24000, 'active',    '2027-01-15'),
  ('80000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'Owen King',    'Standard monthly', 1200,  'cancelled', null),
  ('80000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'Priya Shah',   'Founding',         4900,  'active',    '2026-09-01'),
  ('80000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000006', 'Lucas Martin', 'Standard monthly', 1200,  'active',    '2026-08-12')
on conflict do nothing;

-- moderation_cases
insert into public.moderation_cases (id, target, reason, severity, status, reporter) values
  ('90000000-0000-0000-0000-000000000001', 'Message #4821',         'Spam',              'low',    'open',      'System'),
  ('90000000-0000-0000-0000-000000000002', 'Room: Midnight lounge', 'Reported behavior', 'high',   'in_review', 'Elena S.'),
  ('90000000-0000-0000-0000-000000000003', 'Profile @owen',         'Profile content',   'medium', 'open',      'Nora J.'),
  ('90000000-0000-0000-0000-000000000004', 'Comment #1940',         'Harassment',        'high',   'resolved',  'Marcus L.'),
  ('90000000-0000-0000-0000-000000000005', 'Message #4798',         'Links',             'low',    'in_review', 'System'),
  ('90000000-0000-0000-0000-000000000006', 'Room: Creator Q&A',     'Room safety',       'medium', 'open',      'Noah W.')
on conflict do nothing;

-- audit_events
insert into public.audit_events (id, actor, action, target, outcome) values
  ('a0000000-0000-0000-0000-000000000001', 'Ava Morgan',    'Updated role',        'Moderator',                'success'),
  ('a0000000-0000-0000-0000-000000000002', 'Noah Williams', 'Resolved case',       'MOD-904',                  'success'),
  ('a0000000-0000-0000-0000-000000000003', 'System',        'Flagged message',     'Message #4821',            'warning'),
  ('a0000000-0000-0000-0000-000000000004', 'Liam Patel',    'Published article',   'Summer drop announcement', 'success'),
  ('a0000000-0000-0000-0000-000000000005', 'Sofia Reed',    'Attempted export',    'Payment report',           'denied'),
  ('a0000000-0000-0000-0000-000000000006', 'Mia Chen',      'Changed room status', 'ROOM-101',                 'success')
on conflict do nothing;
