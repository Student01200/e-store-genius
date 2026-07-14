import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const Input = z.object({ slug: z.string().trim().min(1).max(200) });

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

function createPublicClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase not configured");
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (isNewSupabaseApiKey(key) && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

/**
 * Public catalog reader for a published store.
 * Relies on RLS: categories readable when store is published; products readable
 * when store is published AND product.status = 'active'.
 * Returns { store: null } when the store slug is missing or unpublished.
 */
export const getPublicCatalog = createServerFn({ method: "GET" })
  .inputValidator((raw: unknown) => Input.parse(raw))
  .handler(async ({ data }) => {
    const supabase = createPublicClient();

    const { data: store, error: storeErr } = await supabase
      .from("stores")
      .select("id, slug, catalog_source, currency")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (storeErr) throw new Error(storeErr.message);
    if (!store) return { store: null, categories: [], products: [] };

    const [{ data: categories, error: catErr }, { data: products, error: prodErr }] =
      await Promise.all([
        (supabase as any)
          .from("categories")
          .select("id, name, slug, position")
          .eq("store_id", store.id)
          .order("position", { ascending: true }),
        (supabase as any)
          .from("products")
          .select(
            "id, category_id, name, slug, description, base_price, currency, image_url, position, seo_title, seo_description",
          )
          .eq("store_id", store.id)
          .eq("status", "active")
          .order("position", { ascending: true }),
      ]);
    if (catErr) throw new Error(catErr.message);
    if (prodErr) throw new Error(prodErr.message);

    return {
      store,
      categories: categories ?? [],
      products: products ?? [],
    };
  });
