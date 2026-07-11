-- Add slug column for public store URLs
ALTER TABLE public.stores ADD COLUMN slug text UNIQUE;

-- Backfill slugs for existing stores
UPDATE public.stores SET slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(id::text, 1, 8) WHERE slug IS NULL;

-- Allow anonymous visitors to read published stores (safe-column reads via publishable client)
CREATE POLICY "Anyone can view published stores"
ON public.stores
FOR SELECT
TO anon, authenticated
USING (status = 'published');

GRANT SELECT ON public.stores TO anon;