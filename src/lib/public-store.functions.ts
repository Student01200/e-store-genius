import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const Input = z.object({ slug: z.string().min(1).max(200) });

export const getPublicStore = createServerFn({ method: "GET" })
  .inputValidator((raw: unknown) => Input.parse(raw))
  .handler(async ({ data }) => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) throw new Error("Supabase not configured");

    const supabase = createClient<Database>(url, key, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });

    const { data: store, error } = await supabase
      .from("stores")
      .select("*")
      .eq("slug", data.slug)
      .eq("status", "published")
      .single();

    if (error) throw error;

    const { data: categories, error: categoryError } = await supabase
      .from("categories")
      .select("id, name, slug, position")
      .eq("store_id", store.id)
      .order("position");

    if (categoryError) throw categoryError;

    const { data: products, error: productError } = await supabase
      .from("products")
      .select(
        "id, name, slug, base_price, currency, image_url, description, category_id, sku, position"
      )
      .eq("store_id", store.id)
      .eq("status", "active")
      .order("position");

    if (productError) throw productError;

    return {
      ...store,
      categories: categories ?? [],
      products: products ?? [],
    }
  });