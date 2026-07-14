
REVOKE EXECUTE ON FUNCTION public.owns_store(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.store_is_published(uuid) FROM PUBLIC, anon, authenticated;
