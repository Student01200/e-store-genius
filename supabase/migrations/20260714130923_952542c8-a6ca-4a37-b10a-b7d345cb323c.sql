
-- 1. Helper functions (SECURITY DEFINER) to avoid recursive RLS
CREATE OR REPLACE FUNCTION public.owns_store(_store_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.stores
    WHERE id = _store_id AND user_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION public.store_is_published(_store_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.stores
    WHERE id = _store_id AND status = 'published'
  )
$$;

-- 2. categories table
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (store_id, slug)
);

CREATE INDEX categories_store_position_idx ON public.categories (store_id, position);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT SELECT ON public.categories TO anon;
GRANT ALL ON public.categories TO service_role;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_owner_all" ON public.categories
  FOR ALL TO authenticated
  USING (public.owns_store(store_id))
  WITH CHECK (public.owns_store(store_id));

CREATE POLICY "categories_public_read" ON public.categories
  FOR SELECT TO anon, authenticated
  USING (public.store_is_published(store_id));

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. products table
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  base_price numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  sku text,
  image_url text,
  position integer NOT NULL DEFAULT 0,
  seo_title text,
  seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (store_id, slug)
);

CREATE UNIQUE INDEX products_store_sku_unique
  ON public.products (store_id, sku) WHERE sku IS NOT NULL;
CREATE INDEX products_store_status_idx ON public.products (store_id, status);
CREATE INDEX products_category_idx ON public.products (category_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT ON public.products TO anon;
GRANT ALL ON public.products TO service_role;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_owner_all" ON public.products
  FOR ALL TO authenticated
  USING (public.owns_store(store_id))
  WITH CHECK (public.owns_store(store_id));

CREATE POLICY "products_public_read" ON public.products
  FOR SELECT TO anon, authenticated
  USING (public.store_is_published(store_id) AND status = 'active');

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. catalog_source column on stores (nullable = legacy JSONB)
ALTER TABLE public.stores ADD COLUMN catalog_source text;
