import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { StorefrontPreview } from "@/components/storefront-preview";
import {
  CATEGORIES,
  CURRENCIES,
  DESIGN_STYLES,
  LANGUAGES,
  TEMPLATES,
  categoryDefaults,
  defaultStoreConfig,
  type StoreConfig,
  type TemplateId,
} from "@/lib/store-config";

const searchSchema = z.object({ id: z.string().optional() });

export const Route = createFileRoute("/_authenticated/generator")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({ meta: [{ title: "Generator · Atelier" }, { name: "robots", content: "noindex" }] }),
  component: Generator,
});

const STEPS = [
  { id: "identity", label: "Identity" },
  { id: "style", label: "Style" },
  { id: "catalog", label: "Catalog" },
  { id: "contact", label: "Contact" },
] as const;

function Generator() {
  const { id } = Route.useSearch();
  const navigate = useNavigate();
  const [config, setConfig] = useState<StoreConfig>(defaultStoreConfig());
  const [step, setStep] = useState(0);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase.from("stores").select("*").eq("id", id).single().then(({ data, error }) => {
      if (error || !data) return;
      setConfig({
        id: data.id,
        name: data.name,
        category: data.category,
        description: data.description ?? "",
        targetAudience: data.target_audience ?? "",
        designStyle: (data.design_style as StoreConfig["designStyle"]) ?? "minimal",
        template: (data.template as TemplateId) ?? "luxury",
        primaryColor: data.primary_color,
        secondaryColor: data.secondary_color,
        logoUrl: data.logo_url ?? undefined,
        currency: data.currency,
        language: data.language,
        tagline: data.tagline ?? "",
        heroHeadline: data.hero_headline ?? "",
        heroSubheadline: data.hero_subheadline ?? "",
        productCategories: (data.product_categories as unknown as string[]) ?? [],
        products: (data.products as unknown as StoreConfig["products"]) ?? [],
        contactEmail: data.contact_email ?? "",
        contactPhone: data.contact_phone ?? "",
        contactAddress: data.contact_address ?? "",
        socialInstagram: data.social_instagram ?? "",
        socialTwitter: data.social_twitter ?? "",
        socialFacebook: data.social_facebook ?? "",
      });
    });
  }, [id]);

  const update = <K extends keyof StoreConfig>(k: K, v: StoreConfig[K]) =>
    setConfig((c) => ({ ...c, [k]: v }));

  function applyCategory(cat: string) {
    const suggested = categoryDefaults(cat);
    setConfig((c) => ({ ...c, category: cat, ...suggested }));
  }

  async function save(status: "draft" | "published") {
    if (!config.name.trim()) return toast.error("Give your store a name first.");
    setSaving(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not signed in");
      const payload = {
        user_id: user.user.id,
        name: config.name,
        category: config.category,
        description: config.description,
        target_audience: config.targetAudience,
        design_style: config.designStyle,
        template: config.template,
        primary_color: config.primaryColor,
        secondary_color: config.secondaryColor,
        logo_url: config.logoUrl,
        currency: config.currency,
        language: config.language,
        tagline: config.tagline,
        hero_headline: config.heroHeadline,
        hero_subheadline: config.heroSubheadline,
        product_categories: config.productCategories as unknown as never,
        products: config.products as unknown as never,
        contact_email: config.contactEmail,
        contact_phone: config.contactPhone,
        contact_address: config.contactAddress,
        social_instagram: config.socialInstagram,
        social_twitter: config.socialTwitter,
        social_facebook: config.socialFacebook,
        status,
      };
      if (config.id) {
        const { error } = await supabase.from("stores").update(payload).eq("id", config.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("stores").insert(payload).select("id").single();
        if (error) throw error;
        setConfig((c) => ({ ...c, id: data!.id }));
      }
      toast.success(status === "published" ? "Store published" : "Draft saved");
      if (status === "published") navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const totalProducts = useMemo(() => config.products.length, [config.products]);

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-ink/5 bg-white/50 px-8 py-4 backdrop-blur">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-ink/40">Generator</span>
          <span className="text-ink/20">/</span>
          <span className="font-medium">{config.name || "New Storefront"}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => save("draft")}
            disabled={saving}
            className="rounded-full border border-ink/15 px-4 py-2 text-xs font-semibold uppercase tracking-widest hover:bg-ink/5 disabled:opacity-50"
          >
            Save draft
          </button>
          <button
            onClick={() => save("published")}
            disabled={saving}
            className="rounded-full bg-ink px-5 py-2 text-xs font-semibold uppercase tracking-widest text-canvas shadow-lg shadow-ink/10 hover:bg-ink/90 disabled:opacity-50"
          >
            Publish store
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Controls */}
        <div className="w-[420px] shrink-0 overflow-y-auto border-r border-ink/5 bg-white p-8">
          <div className="mb-6 flex items-center gap-2">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setStep(i)}
                className={`flex flex-1 items-center gap-2 rounded-md p-2 text-left ${
                  step === i ? "bg-ink/5" : "hover:bg-ink/5"
                }`}
              >
                <span
                  className={`grid size-6 place-items-center rounded-full text-[10px] font-semibold ${
                    step === i ? "bg-ink text-canvas" : "border border-ink/20 text-ink/50"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="text-xs font-medium">{s.label}</span>
              </button>
            ))}
          </div>

          {step === 0 && (
            <div className="space-y-5">
              <h2 className="font-serif text-3xl">Build your essence.</h2>
              <p className="text-sm text-ink/50">The foundation of your storefront.</p>
              <Field label="Store name">
                <input
                  value={config.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="e.g. Maison de Verre"
                  className="w-full border-b border-ink/10 bg-transparent py-2 font-serif text-lg outline-none focus:border-ink"
                />
              </Field>
              <Field label="Business category">
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => applyCategory(c)}
                      className={`rounded-lg border p-2.5 text-xs font-medium ${
                        config.category === c
                          ? "border-ink bg-ink text-canvas"
                          : "border-ink/10 hover:bg-ink/5"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Short description">
                <textarea
                  value={config.description}
                  onChange={(e) => update("description", e.target.value)}
                  rows={3}
                  placeholder="What do you sell, and to whom?"
                  className="w-full rounded-lg border border-ink/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
                />
              </Field>
              <Field label="Target audience">
                <input
                  value={config.targetAudience}
                  onChange={(e) => update("targetAudience", e.target.value)}
                  placeholder="e.g. Design-conscious homeowners, 28–45"
                  className="w-full rounded-lg border border-ink/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
                />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-serif text-3xl">Compose the atmosphere.</h2>
              <Field label="Template">
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => update("template", t.id)}
                      className={`rounded-lg border p-3 text-left ${
                        config.template === t.id
                          ? "border-ink bg-ink text-canvas"
                          : "border-ink/10 hover:bg-ink/5"
                      }`}
                    >
                      <p className="font-serif text-lg italic">{t.name}</p>
                      <p className={`text-[10px] ${config.template === t.id ? "text-canvas/60" : "text-ink/50"}`}>
                        {t.tagline}
                      </p>
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Design style">
                <div className="grid grid-cols-3 gap-2">
                  {DESIGN_STYLES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => update("designStyle", s.id)}
                      className={`rounded-lg border p-2 text-xs font-medium ${
                        config.designStyle === s.id
                          ? "border-ink bg-ink text-canvas"
                          : "border-ink/10 hover:bg-ink/5"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Primary color">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.primaryColor}
                      onChange={(e) => update("primaryColor", e.target.value)}
                      className="h-10 w-14 shrink-0 rounded-md border border-ink/10 bg-white p-1"
                    />
                    <input
                      value={config.primaryColor}
                      onChange={(e) => update("primaryColor", e.target.value)}
                      className="w-full rounded-lg border border-ink/10 px-2 py-2 text-xs"
                    />
                  </div>
                </Field>
                <Field label="Secondary color">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.secondaryColor}
                      onChange={(e) => update("secondaryColor", e.target.value)}
                      className="h-10 w-14 shrink-0 rounded-md border border-ink/10 bg-white p-1"
                    />
                    <input
                      value={config.secondaryColor}
                      onChange={(e) => update("secondaryColor", e.target.value)}
                      className="w-full rounded-lg border border-ink/10 px-2 py-2 text-xs"
                    />
                  </div>
                </Field>
              </div>
              <Field label="Logo URL (optional)">
                <input
                  value={config.logoUrl ?? ""}
                  onChange={(e) => update("logoUrl", e.target.value)}
                  placeholder="https://…"
                  className="w-full rounded-lg border border-ink/10 px-3 py-2 text-sm outline-none focus:border-ink"
                />
              </Field>
              <Field label="Hero headline">
                <input
                  value={config.heroHeadline}
                  onChange={(e) => update("heroHeadline", e.target.value)}
                  className="w-full rounded-lg border border-ink/10 px-3 py-2 text-sm outline-none focus:border-ink"
                />
              </Field>
              <Field label="Hero subheadline">
                <textarea
                  value={config.heroSubheadline}
                  onChange={(e) => update("heroSubheadline", e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-ink/10 px-3 py-2 text-sm outline-none focus:border-ink"
                />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-serif text-3xl">Your catalog.</h2>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Currency">
                  <select
                    value={config.currency}
                    onChange={(e) => update("currency", e.target.value)}
                    className="w-full rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Language">
                  <select
                    value={config.language}
                    onChange={(e) => update("language", e.target.value)}
                    className="w-full rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>{l.label}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Product categories (comma-separated)">
                <input
                  value={config.productCategories.join(", ")}
                  onChange={(e) =>
                    update(
                      "productCategories",
                      e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    )
                  }
                  className="w-full rounded-lg border border-ink/10 px-3 py-2 text-sm outline-none focus:border-ink"
                />
              </Field>
              <Field label={`Products (${totalProducts})`}>
                <div className="space-y-2">
                  {config.products.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-2">
                      <input
                        value={p.name}
                        onChange={(e) => {
                          const next = [...config.products];
                          next[i] = { ...p, name: e.target.value };
                          update("products", next);
                        }}
                        className="flex-1 rounded-md border border-ink/10 px-2 py-1.5 text-xs"
                      />
                      <input
                        type="number"
                        value={p.price}
                        onChange={(e) => {
                          const next = [...config.products];
                          next[i] = { ...p, price: Number(e.target.value) };
                          update("products", next);
                        }}
                        className="w-20 rounded-md border border-ink/10 px-2 py-1.5 text-xs"
                      />
                      <button
                        onClick={() =>
                          update("products", config.products.filter((_, j) => j !== i))
                        }
                        className="text-xs text-ink/40 hover:text-destructive"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      update("products", [
                        ...config.products,
                        { id: crypto.randomUUID(), name: "New product", price: 40 },
                      ])
                    }
                    className="w-full rounded-md border border-dashed border-ink/20 py-2 text-xs font-medium text-ink/60 hover:bg-ink/5"
                  >
                    + Add product
                  </button>
                </div>
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="font-serif text-3xl">Contact & social.</h2>
              <Field label="Email">
                <input
                  type="email"
                  value={config.contactEmail}
                  onChange={(e) => update("contactEmail", e.target.value)}
                  className="w-full rounded-lg border border-ink/10 px-3 py-2 text-sm outline-none focus:border-ink"
                />
              </Field>
              <Field label="Phone">
                <input
                  value={config.contactPhone}
                  onChange={(e) => update("contactPhone", e.target.value)}
                  className="w-full rounded-lg border border-ink/10 px-3 py-2 text-sm outline-none focus:border-ink"
                />
              </Field>
              <Field label="Address">
                <textarea
                  value={config.contactAddress}
                  onChange={(e) => update("contactAddress", e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-ink/10 px-3 py-2 text-sm outline-none focus:border-ink"
                />
              </Field>
              <Field label="Instagram">
                <input
                  value={config.socialInstagram}
                  onChange={(e) => update("socialInstagram", e.target.value)}
                  placeholder="@handle"
                  className="w-full rounded-lg border border-ink/10 px-3 py-2 text-sm outline-none focus:border-ink"
                />
              </Field>
              <Field label="Twitter / X">
                <input
                  value={config.socialTwitter}
                  onChange={(e) => update("socialTwitter", e.target.value)}
                  className="w-full rounded-lg border border-ink/10 px-3 py-2 text-sm outline-none focus:border-ink"
                />
              </Field>
              <Field label="Facebook">
                <input
                  value={config.socialFacebook}
                  onChange={(e) => update("socialFacebook", e.target.value)}
                  className="w-full rounded-lg border border-ink/10 px-3 py-2 text-sm outline-none focus:border-ink"
                />
              </Field>
            </div>
          )}

          <div className="mt-8 flex justify-between border-t border-ink/5 pt-6">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="text-xs font-semibold uppercase tracking-widest text-ink/50 hover:text-ink disabled:opacity-30"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              disabled={step === STEPS.length - 1}
              className="rounded-full bg-ink px-5 py-2 text-xs font-semibold uppercase tracking-widest text-canvas hover:bg-ink/90 disabled:opacity-30"
            >
              Continue →
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="flex flex-1 flex-col overflow-hidden bg-stone-warm/40">
          <div className="flex items-center justify-between border-b border-ink/5 bg-white/40 px-6 py-3 backdrop-blur">
            <p className="eyebrow">Live storefront preview</p>
            <div className="flex gap-1 rounded-full bg-white p-1 ring-1 ring-black/5">
              {(["desktop", "tablet", "mobile"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDevice(d)}
                  className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${
                    device === d ? "bg-ink text-canvas" : "text-ink/50 hover:text-ink"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-8">
            <StorefrontPreview config={config} device={device} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="eyebrow block">{label}</label>
      {children}
    </div>
  );
}
