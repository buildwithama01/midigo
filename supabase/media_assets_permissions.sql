-- Grant table access so media_assets RLS policies can be evaluated.
-- RLS remains responsible for deciding which rows and mutations are allowed.
grant select on public.media_assets to anon, authenticated;
grant insert, update, delete on public.media_assets to authenticated;
