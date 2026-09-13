-- The signup trigger runs as SECURITY DEFINER from auth.users; it must never be callable over REST.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
