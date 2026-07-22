import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { StorefrontPreview } from "@/components/storefront-preview";
import { getPublicStore } from "@/lib/public-store.functions";
import type { StoreConfig, TemplateId, DesignStyle, BrandPersonality } from "@/lib/store-config";

export const Route = createFileRoute("/s/$slug")({
  loader: async ({ params }) => {
    const store = await getPublicStore({ data: { slug: params.slug } });
    if (!store) throw notFound();
    return { store };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Store not found" }, { name: "robots", content: "noindex" }] };
    }
    const s = loaderData.store;
    const title = `${s.name} — ${s.category}`;
    const desc = s.tagline || s.hero_subheadline || s.description || `Shop ${s.name} online.`;
    return {
      meta: [
        { title: `${title} · Atelier` },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  errorComponent: () => (
    <div className="grid min-h-screen place-items-center bg-canvas p-8 text-center">
      <div>
        <p className="eyebrow">Error</p>
        <h1 className="mt-2 font-serif text-3xl italic">
          Something went wrong loading this store.
        </h1>
        <Link to="/" className="mt-6 inline-block text-sm underline">
          ← Back home
        </Link>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center bg-canvas p-8 text-center">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="mt-2 font-serif text-3xl italic">This storefront isn't available.</h1>
        <p className="mt-2 text-sm text-ink/60">It may be unpublished or the link is incorrect.</p>
        <Link to="/" className="mt-6 inline-block text-sm underline">
          ← Back home
        </Link>
      </div>
    </div>
  ),
  component: PublicStorePage,
});

function PublicStorePage() {
  const { store } = Route.useLoaderData();

  const config: StoreConfig = {
    id: store.id,
    name: store.name,
    category: store.category,
    description: store.description ?? "",
    targetAudience: "",
    designStyle: (store.design_style as DesignStyle) ?? "minimal",
    brandPersonality: (store.design_style as BrandPersonality) ?? "minimalist",
    template: (store.template as TemplateId) ?? "luxury",
    primaryColor: store.primary_color,
    secondaryColor: store.secondary_color,
    logoUrl: store.logo_url ?? undefined,
    currency: store.currency,
    language: store.language,
    tagline: store.tagline ?? "",
    heroHeadline: store.hero_headline ?? "",
    heroSubheadline: store.hero_subheadline ?? "",

    productCategories: store.categories?.map((category) => category.name) ?? [],

    products:
      store.products?.map((product) => ({
        id: product.id,
        name: product.name,
        price: Number(product.base_price),
        image: product.image_url ?? undefined,
        category: store.categories?.find((c) => c.id === product.category_id)?.name ?? undefined,
        description: product.description ?? undefined,
      })) ?? [],
    contactEmail: store.contact_email ?? "",
    contactPhone: store.contact_phone ?? "",
    contactAddress: store.contact_address ?? "",
    socialInstagram: store.social_instagram ?? "",
    socialTwitter: store.social_twitter ?? "",
    socialFacebook: store.social_facebook ?? "",
  };

  return (
    <div className="min-h-screen bg-stone-100">
      <StorefrontPreview config={config} device="desktop" />
      <div className="py-6 text-center text-[10px] uppercase tracking-widest text-ink/40">
        Powered by Atelier ·{" "}
        <Link to="/" className="underline">
          Create your own store
        </Link>
      </div>
    </div>
  );
}
