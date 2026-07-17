import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const StoreSlugSchema = z.object({
  slug: z.string().min(1).max(200),
});

const StoreIdSchema = z.object({
  id: z.string().uuid(),
});

const UpdateStoreSchema = z.object({
  id: z.string().uuid(),

  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),

  description: z.string().nullable(),

  primaryColor: z.string(),
  secondaryColor: z.string(),

  logoUrl: z.string().nullable(),

  contactEmail: z.string().nullable(),
  contactPhone: z.string().nullable(),
  contactAddress: z.string().nullable(),

  socialInstagram: z.string().nullable(),
  socialFacebook: z.string().nullable(),
  socialTwitter: z.string().nullable(),

  status: z.string(),

  currency: z.string(),
  language: z.string(),

  template: z.string(),
  designStyle: z.string(),

  tagline: z.string().nullable(),
  heroHeadline: z.string().nullable(),
  heroSubheadline: z.string().nullable(),
});

export const getStore = createServerFn({
  method: "GET",
})
  .inputValidator((data: unknown) => StoreSlugSchema.parse(data))
  .handler(async ({ data }) => {
    const { data: store, error } = await supabase
      .from("stores")
      .select("*")
      .eq("slug", data.slug)
      .single();

    if (error) throw error;

    return store;
  });

export const updateStore = createServerFn({
  method: "POST",
})
  .inputValidator((data: unknown) => UpdateStoreSchema.parse(data))
  .handler(async ({ data }) => {
    const { error } = await supabase
      .from("stores")
      .update({
        name: data.name,
        slug: data.slug,

        description: data.description,

        primary_color: data.primaryColor,
        secondary_color: data.secondaryColor,

        logo_url: data.logoUrl,

        contact_email: data.contactEmail,
        contact_phone: data.contactPhone,
        contact_address: data.contactAddress,

        social_instagram: data.socialInstagram,
        social_facebook: data.socialFacebook,
        social_twitter: data.socialTwitter,

        status: data.status,

        currency: data.currency,
        language: data.language,

        template: data.template,
        design_style: data.designStyle,

        tagline: data.tagline,
        hero_headline: data.heroHeadline,
        hero_subheadline: data.heroSubheadline,
      })
      .eq("id", data.id);

    if (error) throw error;

    return true;
  });