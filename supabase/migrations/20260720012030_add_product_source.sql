-- Phase 2.5: Add product source column for ownership tracking
--
-- This migration adds a `source` column to the products table to distinguish
-- between products created by the AI generator and those created manually by
-- the store owner (or future pipelines such as CSV import or API ingestion).
--
-- Values:
--   'ai'     – product was generated or managed by the AI generator
--   'manual' – product was created directly by the store owner via the dashboard
--
-- Additional values (e.g. 'import', 'api') can be added to the CHECK constraint
-- in a future migration without breaking existing rows.
--
-- Migration strategy:
--   Step 1: Add the column with a temporary DEFAULT so Postgres can backfill
--           all existing rows without violating NOT NULL immediately.
--   Step 2: Backfill rows that belong to AI-managed stores. Any product that
--           lives in a store whose catalog_source = 'relational' was written by
--           syncStoreCatalog and therefore has source = 'ai'.
--   Step 3: Drop the column-level DEFAULT (future inserts must supply the value
--           explicitly) and tighten the constraint. The application layer always
--           passes source, so this is safe.

-- Step 1: Add column with temporary default (allows backfill of existing rows)
ALTER TABLE public.products
  ADD COLUMN source text NOT NULL DEFAULT 'manual'
  CHECK (source IN ('ai', 'manual', 'import', 'api'));

-- Step 2: Backfill — mark existing products that belong to AI-synced stores
UPDATE public.products p
SET    source = 'ai'
FROM   public.stores s
WHERE  p.store_id = s.id
AND    s.catalog_source = 'relational';

-- Step 3: Remove column-level default so application code must always be
-- explicit about the source. This prevents accidental silent defaulting.
ALTER TABLE public.products
  ALTER COLUMN source DROP DEFAULT;

-- Add an index to support efficient filtering by source in sync queries
CREATE INDEX products_store_source_idx ON public.products (store_id, source);
