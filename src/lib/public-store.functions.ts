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
      .select(
        "id,slug,name,category,tagline,hero_headline,hero_subheadline,primary_color,secondary_color,logo_url,currency,language,template,design_style,product_categories,products,contact_email,contact_phone,contact_address,social_instagram,social_twitter,social_facebook,description",
      )
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();

    if (error) throw error;
    return store;
  });
