-- Grant table access so live_rooms RLS policies can be evaluated.
-- RLS still restricts room mutations to authorized editor/admin profiles.
grant select on public.live_rooms to anon, authenticated;
grant insert, update, delete on public.live_rooms to authenticated;
