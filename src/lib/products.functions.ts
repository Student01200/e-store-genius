import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { slugify } from "@/lib/slugify";

const ProductStatus = z.enum(["draft", "active", "archived"]);

const PRODUCT_COLUMNS =
  "id, store_id, category_id, name, slug, description, base_price, currency, status, sku, image_url, position, seo_title, seo_description, created_at, updated_at";

const ListInput = z.object({
  storeId: z.string().uuid(),
  status: ProductStatus.optional(),
  categoryId: z.string().uuid().optional(),
});

export const listProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => ListInput.parse(raw))
  .handler(async ({ data, context }) => {
    let query = (context.supabase as any)
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("store_id", data.storeId)
      .order("position", { ascending: true })
      .order("created_at", { ascending: false });
    if (data.status) query = query.eq("status", data.status);
    if (data.categoryId) query = query.eq("category_id", data.categoryId);
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

const GetInput = z.object({ id: z.string().uuid() });

export const getProduct = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => GetInput.parse(raw))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await (context.supabase as any)
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

const CreateInput = z.object({
  storeId: z.string().uuid(),
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(80).optional(),
  categoryId: z.string().uuid().nullable().optional(),
  description: z.string().trim().max(4000).optional(),
  basePrice: z.number().min(0).max(1_000_000_000).default(0),
  currency: z.string().trim().min(3).max(8),
  status: ProductStatus.default("draft"),
  sku: z.string().trim().min(1).max(80).optional(),
  imageUrl: z.string().trim().url().max(2000).optional(),
  position: z.number().int().min(0).max(99999).optional(),
  seoTitle: z.string().trim().max(120).optional(),
  seoDescription: z.string().trim().max(320).optional(),
});

export const createProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => CreateInput.parse(raw))
  .handler(async ({ data, context }) => {
    const slug = slugify(data.slug ?? data.name);
    if (!slug) throw new Error("Invalid slug");
    const { data: row, error } = await (context.supabase as any)
      .from("products")
      .insert({
        store_id: data.storeId,
        category_id: data.categoryId ?? null,
        name: data.name,
        slug,
        description: data.description ?? null,
        base_price: data.basePrice,
        currency: data.currency,
        status: data.status,
        sku: data.sku ?? null,
        image_url: data.imageUrl ?? null,
        position: data.position ?? 0,
        seo_title: data.seoTitle ?? null,
        seo_description: data.seoDescription ?? null,
      })
      .select(PRODUCT_COLUMNS)
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

const UpdateInput = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(200).optional(),
  slug: z.string().trim().min(1).max(80).optional(),
  categoryId: z.string().uuid().nullable().optional(),
  description: z.string().trim().max(4000).nullable().optional(),
  basePrice: z.number().min(0).max(1_000_000_000).optional(),
  currency: z.string().trim().min(3).max(8).optional(),
  status: ProductStatus.optional(),
  sku: z.string().trim().min(1).max(80).nullable().optional(),
  imageUrl: z.string().trim().url().max(2000).nullable().optional(),
  position: z.number().int().min(0).max(99999).optional(),
  seoTitle: z.string().trim().max(120).nullable().optional(),
  seoDescription: z.string().trim().max(320).nullable().optional(),
});

export const updateProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => UpdateInput.parse(raw))
  .handler(async ({ data, context }) => {
    const patch: Record<string, unknown> = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.slug !== undefined) patch.slug = slugify(data.slug);
    if (data.categoryId !== undefined) patch.category_id = data.categoryId;
    if (data.description !== undefined) patch.description = data.description;
    if (data.basePrice !== undefined) patch.base_price = data.basePrice;
    if (data.currency !== undefined) patch.currency = data.currency;
    if (data.status !== undefined) patch.status = data.status;
    if (data.sku !== undefined) patch.sku = data.sku;
    if (data.imageUrl !== undefined) patch.image_url = data.imageUrl;
    if (data.position !== undefined) patch.position = data.position;
    if (data.seoTitle !== undefined) patch.seo_title = data.seoTitle;
    if (data.seoDescription !== undefined) patch.seo_description = data.seoDescription;
    if (Object.keys(patch).length === 0) throw new Error("No fields to update");
    const { data: row, error } = await (context.supabase as any)
      .from("products")
      .update(patch)
      .eq("id", data.id)
      .select(PRODUCT_COLUMNS)
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

const SetStatusInput = z.object({ id: z.string().uuid(), status: ProductStatus });

export const setProductStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => SetStatusInput.parse(raw))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await (context.supabase as any)
      .from("products")
      .update({ status: data.status })
      .eq("id", data.id)
      .select(PRODUCT_COLUMNS)
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

const DeleteInput = z.object({ id: z.string().uuid() });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => DeleteInput.parse(raw))
  .handler(async ({ data, context }) => {
    const { error } = await (context.supabase as any).from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
