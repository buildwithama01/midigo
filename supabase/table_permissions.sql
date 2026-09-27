begin;

-- Table privileges let PostgREST reach a table; existing RLS policies still
-- decide which rows and operations each user is allowed to access.
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

-- The RPCs are security definer and enforce authentication internally.
revoke all on function public.join_live_room(uuid) from public, anon;
revoke all on function public.leave_live_room(uuid) from public, anon;
grant execute on function public.join_live_room(uuid) to authenticated;
grant execute on function public.leave_live_room(uuid) to authenticated;

-- Existing RLS policies also need to reflect the operations used by the app.
drop policy if exists "profiles_staff_read" on public.profiles;
create policy "profiles_staff_read" on public.profiles for select using (
	public.current_profile_role() in ('chatter', 'moderator', 'editor', 'administrator')
);
drop policy if exists "profiles_write_admin" on public.profiles;
create policy "profiles_write_admin" on public.profiles for insert with check (
	public.current_profile_role() in ('administrator', 'moderator', 'editor')
);
drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin" on public.profiles for update using (
	auth.uid() = id
	or public.current_profile_role() in ('administrator', 'moderator', 'editor')
) with check (
	auth.uid() = id
	or public.current_profile_role() in ('administrator', 'moderator', 'editor')
);

drop policy if exists "conversations_staff_create" on public.conversations;
create policy "conversations_staff_create" on public.conversations
	for insert with check (
		exists (select 1 from public.profiles p where p.id = auth.uid()
			and p.role in ('chatter', 'moderator', 'administrator'))
	);

drop policy if exists "audit_events_write_admin" on public.audit_events;
drop policy if exists "audit_events_write_staff" on public.audit_events;
create policy "audit_events_write_staff" on public.audit_events
	for insert with check (
		exists (select 1 from public.profiles p where p.id = auth.uid()
			and p.role in ('chatter', 'moderator', 'editor', 'administrator'))
	);

commit;
