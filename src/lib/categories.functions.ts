import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { slugify } from "@/lib/slugify";

const StoreIdInput = z.object({ storeId: z.string().uuid() });

export const listCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => StoreIdInput.parse(raw))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await (context.supabase as any)
      .from("categories")
      .select("id, store_id, name, slug, position, created_at, updated_at")
      .eq("store_id", data.storeId)
      .order("position", { ascending: true });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

const CreateInput = z.object({
  storeId: z.string().uuid(),
  name: z.string().trim().min(1).max(80),
  slug: z.string().trim().min(1).max(80).optional(),
  position: z.number().int().min(0).max(9999).optional(),
});

export const createCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => CreateInput.parse(raw))
  .handler(async ({ data, context }) => {
    const slug = slugify(data.slug ?? data.name);
    if (!slug) throw new Error("Invalid slug");
    const { data: row, error } = await (context.supabase as any)
      .from("categories")
      .insert({
        store_id: data.storeId,
        name: data.name,
        slug,
        position: data.position ?? 0,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

const UpdateInput = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(80).optional(),
  slug: z.string().trim().min(1).max(80).optional(),
  position: z.number().int().min(0).max(9999).optional(),
});

export const updateCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => UpdateInput.parse(raw))
  .handler(async ({ data, context }) => {
    const patch: Record<string, unknown> = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.slug !== undefined) patch.slug = slugify(data.slug);
    if (data.position !== undefined) patch.position = data.position;
    if (Object.keys(patch).length === 0) throw new Error("No fields to update");
    const { data: row, error } = await (context.supabase as any)
      .from("categories")
      .update(patch)
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

const DeleteInput = z.object({ id: z.string().uuid() });

export const deleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => DeleteInput.parse(raw))
  .handler(async ({ data, context }) => {
    const { error } = await (context.supabase as any)
      .from("categories")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

const ReorderInput = z.object({
  storeId: z.string().uuid(),
  orderedIds: z.array(z.string().uuid()).min(1).max(200),
});

export const reorderCategories = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => ReorderInput.parse(raw))
  .handler(async ({ data, context }) => {
    // RLS ensures only owner can update these rows.
    const updates = data.orderedIds.map((id, index) =>
      (context.supabase as any)
        .from("categories")
        .update({ position: index })
        .eq("id", id)
        .eq("store_id", data.storeId),
    );
    const results = await Promise.all(updates);
    const firstError = results.find((r: any) => r.error);
    if (firstError) throw new Error(firstError.error.message);
    return { ok: true as const };
  });
