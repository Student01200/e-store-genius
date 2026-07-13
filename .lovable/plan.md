
# Atelier → Real E-Commerce: Architecture & Migration Plan

Analysis + phased plan only. No feature code is written in this step. Existing generator, AI copy, public `/s/:slug` rendering, and RLS on `stores` stay intact and keep working throughout.

---

## 1. Current State (what we're evolving from)

- **DB:** single `public.stores` row per store. Catalog lives in two JSONB columns: `product_categories` (`string[]`) and `products` (`Product[]` = `{id, name, price, image?, category?}`).
- **Auth:** Supabase Auth (email + Google via Lovable Cloud). `_authenticated/route.tsx` gates dashboard routes; `attachSupabaseAuth` forwards bearer to server fns.
- **Generator:** `_authenticated/generator.tsx` writes the whole store (including embedded JSONB catalog) in one upsert to `stores`.
- **AI:** `src/lib/ai-generate.functions.ts` returns `{tagline, heroHeadline, heroSubheadline, productCategories[], products[]}` — currently persisted directly into the JSONB fields.
- **Public rendering:** `s.$slug.tsx` → `getPublicStore(slug)` → `<StorefrontPreview>` reads `config.products` / `config.productCategories` in-memory.
- **RLS today:** `Users manage own stores` (`auth.uid() = user_id`), `Anyone can view published stores` (`status = 'published'`).

Constraint: any relational rewrite MUST keep the JSONB path readable for existing stores until they're migrated, so the preview never breaks.

---

## 2. Target Relational Schema

New tables (all in `public`, all with RLS + explicit GRANTs):

```text
stores (existing)
 └── categories        (store_id, name, slug, position)
 └── products          (store_id, category_id?, name, slug, description,
                        base_price, currency, status, seo fields)
      └── product_variants  (product_id, sku UNIQUE, name, price_override?,
                             attributes jsonb  -- {size, color, ...})
      └── product_images    (product_id, url, alt, position, is_primary)
      └── inventory         (variant_id UNIQUE, quantity, low_stock_threshold,
                             reserved_quantity, updated_at)
 └── customers        (store_id, user_id?, email, name, phone, addresses jsonb)
 └── orders           (store_id, customer_id, status enum, currency,
                       subtotal, tax_total, shipping_total, grand_total,
                       shipping_address jsonb, billing_address jsonb,
                       placed_at, notes)
      └── order_items (order_id, variant_id, product_snapshot jsonb,
                       unit_price, quantity, line_total)
```

Enums:
- `order_status`: `pending | confirmed | preparing | shipped | delivered | cancelled`
- `product_status`: `draft | active | archived`

Key rules:
- Money as `numeric(12,2)`; every monetary row carries `currency` to avoid cross-store mixing.
- `slug` unique **per store** (`UNIQUE (store_id, slug)`) so `/s/:storeSlug/p/:productSlug` is collision-free.
- Inventory is per **variant**, not per product. Products always have ≥1 variant (a "default" variant seeded on create).
- Use validation triggers (not CHECK) for time-dependent rules (e.g. `reserved <= quantity`).
- `updated_at` trigger reused from existing `update_updated_at_column()`.

### RLS model

| Table | Owner (store's user) | Anon / customer |
|---|---|---|
| categories, products, product_variants, product_images | full CRUD where `store_id` belongs to `auth.uid()` via `stores` | `SELECT` when parent `store.status='published'` AND `product.status='active'` |
| inventory | owner read/write only | no direct read; exposed via a `SECURITY DEFINER` function that returns only `in_stock: boolean` |
| customers | owner reads customers of own store; customer reads own row (`user_id = auth.uid()`) | none |
| orders, order_items | owner reads/writes for own store; customer reads own orders | none |

All cross-table ownership checks go through a `SECURITY DEFINER` helper `public.owns_store(_store_id uuid)` to avoid recursive RLS. Every `CREATE TABLE` migration ends with the mandatory `GRANT ... TO authenticated / anon / service_role` block per project rules.

### Backward compatibility strategy

1. Add new tables without touching `stores.products` / `stores.product_categories`.
2. Ship a one-shot migration function `public.migrate_store_catalog(store_id)` that reads the JSONB and inserts categories + products + a default variant + inventory row per product. Idempotent (skip if products already exist).
3. Reads: `StorefrontPreview` gains a `catalog` prop. Loader prefers relational rows and falls back to JSONB when the relational catalog is empty — no visual change for un-migrated stores.
4. Once all stores are migrated (background job or on next edit), the JSONB columns become read-only legacy and can be dropped in a later migration.

---

## 3. File-by-file impact

### Modify

- `src/lib/store-config.ts` — extend `Product` (variants, images, sku, stock), add `Category`, `Variant`, `Order`, `Customer` types. Keep old shape as `LegacyProduct` for the fallback reader.
- `src/components/storefront-preview.tsx` — accept `catalog: { categories, products }` prop; keep current JSONB path as fallback.
- `src/routes/s.$slug.tsx` — loader also fetches active products via a new public server fn.
- `src/lib/public-store.functions.ts` — add `getPublicCatalog(slug)` (anon-scoped, published+active only).
- `src/routes/_authenticated/generator.tsx` — after creating the store, call the migration/seed fn so AI-generated products land in the relational tables. Leave JSONB write in place during transition.
- `src/lib/ai-generate.functions.ts` — no change to the AI call; add a small server fn `seedProductsFromAI(storeId, aiPayload)` that maps AI output → categories + products + default variants + zero-stock inventory rows.
- `src/routes/_authenticated/dashboard.tsx` — add "Products / Orders / Customers" quick-links per store.
- `src/routes/__root.tsx` / sidebar — new nav entries per phase.
- `src/integrations/supabase/types.ts` — regenerated automatically after each migration.

### New files (created phase-by-phase, not now)

**Server functions (`src/lib/*.functions.ts`):**
- `products.functions.ts` — list/get/create/update/delete + slug uniqueness.
- `categories.functions.ts` — CRUD + reorder.
- `variants.functions.ts` — CRUD + SKU uniqueness.
- `product-images.functions.ts` — signed-upload URLs against a new `product-images` Storage bucket.
- `inventory.functions.ts` — adjust stock, low-stock query, reservation on checkout.
- `cart.functions.ts` — cart lives in `localStorage` on the client, but pricing/validation runs server-side.
- `checkout.functions.ts` — creates `orders` + `order_items` transactionally, decrements inventory, returns order id.
- `customers.functions.ts` — owner list + customer self-view.
- `orders.functions.ts` — owner list, status transitions, customer order history.
- `analytics.functions.ts` — revenue, top products, order counts (owner-only, RLS via `owns_store`).

**Routes (`src/routes/`):**
- `_authenticated/stores.$storeId.products.index.tsx` + `new.tsx` + `$productId.tsx`
- `_authenticated/stores.$storeId.categories.tsx`
- `_authenticated/stores.$storeId.inventory.tsx`
- `_authenticated/stores.$storeId.orders.index.tsx` + `$orderId.tsx`
- `_authenticated/stores.$storeId.customers.tsx`
- `_authenticated/stores.$storeId.analytics.tsx`
- `_authenticated/account.orders.tsx` (customer-facing history when signed in)
- `s.$slug.p.$productSlug.tsx` — public product detail
- `s.$slug.cart.tsx` + `s.$slug.checkout.tsx` — public shop flow
- `api/public/webhooks/stripe.ts` (later, Phase 3/4) — signature-verified order updates

**Components (`src/components/`):**
- `products/` — `ProductForm`, `VariantEditor`, `ImageUploader`.
- `orders/` — `OrderStatusBadge`, `OrderTimeline`.
- `store/` — `Cart`, `CheckoutForm`, `ProductCard` (real, replacing the sample one).

### Migration file structure

One migration per logical unit, in order — each self-contained (CREATE → GRANT → RLS → POLICY → TRIGGERS):

1. `*_create_categories_products.sql`
2. `*_create_variants_images.sql`
3. `*_create_inventory.sql`
4. `*_create_customers.sql`
5. `*_create_orders_order_items.sql`
6. `*_owns_store_helper.sql` (SECURITY DEFINER)
7. `*_migrate_store_catalog_fn.sql` (backfill helper)
8. `*_drop_legacy_jsonb.sql` (only after full cutover — later phase)

---

## 4. How AI + relational products fit together

- Wizard flow becomes: AI generates → preview in memory → on save, `seedProductsFromAI` writes categories/products/variants/inventory in one transaction, then links them to the store. `stores.products` JSONB is left as an audit snapshot until cutover.
- Regenerating AI later never overwrites real products — it opens a "Replace catalog?" confirm (only allowed while status is still `draft` and no orders exist).
- Public storefront read path becomes: `getPublicStore(slug)` for shell + `getPublicCatalog(slug)` for products. `StorefrontPreview` renders identically; templates stay category-adaptive because `stores.category` still drives `category-adapt.ts`.

---

## 5. Roadmap (phased, non-breaking)

**Phase 1 — Product Management**
Tables: `categories`, `products`, `product_variants`, `product_images`. Storage bucket `product-images`. Owner CRUD UI under `/stores/:id/products`. Migration helper backfills existing JSONB catalogs. Storefront reads from relational first, JSONB as fallback.

**Phase 2 — Inventory Management**
`inventory` table per variant. Low-stock threshold + dashboard badge. `adjust_inventory(variant_id, delta, reason)` RPC with row lock. Public product page shows `in_stock` boolean only (never raw quantity to anon).

**Phase 3 — Customer Shopping Experience**
Client cart in `localStorage` keyed by store slug. Server-side price/stock revalidation before checkout. `customers` table with optional `user_id` link. Guest checkout allowed; signed-in customers see order history.

**Phase 4 — Order Management**
`orders` + `order_items` with the six-state enum. Owner dashboard with filters, status transitions (state-machine enforced by trigger), timeline view. Inventory decrement on `confirmed`, restock on `cancelled`. Stripe webhook route later under `api/public/webhooks/stripe.ts`.

**Phase 5 — Business Management**
Customer history view, analytics (revenue by day, top products, AOV, conversion), sales reports (CSV export via server fn), consolidated store settings page. All queries owner-scoped via `owns_store`.

---

## 6. Deliverable in this step

- No schema changes yet.
- No new routes / components / server fns yet.
- `README.md` updated to reflect: current state accurately, the planned relational architecture, the phased roadmap, and expanded security considerations (per-table RLS matrix, `owns_store` helper, inventory-exposure rule, Storage bucket policy, webhook signature verification for the future Stripe route).

Next turn, on approval, we start Phase 1 with the `categories` + `products` migration and the owner CRUD UI, leaving the JSONB read path in place.
