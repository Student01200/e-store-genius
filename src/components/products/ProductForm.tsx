import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { slugify } from "@/lib/slugify";

export type ProductStatus = "draft" | "active" | "archived";

export type ProductFormValues = {
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  currency: string;
  categoryId: string; // "" = none
  sku: string;
  status: ProductStatus;
  imageUrl: string;
  seoTitle: string;
  seoDescription: string;
};

export const emptyProductForm: ProductFormValues = {
  name: "",
  slug: "",
  description: "",
  basePrice: 0,
  currency: "USD",
  categoryId: "",
  sku: "",
  status: "draft",
  imageUrl: "",
  seoTitle: "",
  seoDescription: "",
};

export type CategoryOption = { id: string; name: string };

type Props = {
  initial: ProductFormValues;
  categories: CategoryOption[];
  submitLabel: string;
  saving: boolean;
  onSubmit: (values: ProductFormValues) => void | Promise<void>;
  onDelete?: () => void;
  deleting?: boolean;
};

export function ProductForm({
  initial,
  categories,
  submitLabel,
  saving,
  onSubmit,
  onDelete,
  deleting,
}: Props) {
  const [values, setValues] = useState<ProductFormValues>(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.slug));
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormValues, string>>>({});

  useEffect(() => {
    setValues(initial);
    setSlugTouched(Boolean(initial.slug));
  }, [initial]);

  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "name" && !slugTouched) {
        next.slug = slugify(String(value));
      }
      return next;
    });
  }

  function validate(): boolean {
    const e: Partial<Record<keyof ProductFormValues, string>> = {};
    if (!values.name.trim()) e.name = "Name is required";
    if (values.name.length > 200) e.name = "Max 200 characters";
    if (!values.slug.trim()) e.slug = "Slug is required";
    if (values.basePrice < 0 || Number.isNaN(values.basePrice))
      e.basePrice = "Enter a valid price";
    if (!values.currency.trim()) e.currency = "Currency is required";
    if (values.imageUrl) {
      try {
        new URL(values.imageUrl);
      } catch {
        e.imageUrl = "Enter a valid URL";
      }
    }
    if (values.seoTitle.length > 120) e.seoTitle = "Max 120 characters";
    if (values.seoDescription.length > 320) e.seoDescription = "Max 320 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="rounded-xl bg-white p-6 ring-1 ring-black/5 space-y-4">
        <h3 className="eyebrow">Basics</h3>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Linen Weekend Shirt"
          />
          {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={values.slug}
            onChange={(e) => {
              setSlugTouched(true);
              set("slug", slugify(e.target.value));
            }}
            placeholder="linen-weekend-shirt"
          />
          {errors.slug && <p className="text-xs text-red-600">{errors.slug}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={5}
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Tell customers what makes this product special."
          />
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 ring-1 ring-black/5 space-y-4">
        <h3 className="eyebrow">Pricing & availability</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              min={0}
              step="0.01"
              value={values.basePrice}
              onChange={(e) => set("basePrice", Number(e.target.value))}
            />
            {errors.basePrice && (
              <p className="text-xs text-red-600">{errors.basePrice}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              value={values.currency}
              onChange={(e) => set("currency", e.target.value.toUpperCase())}
              maxLength={8}
            />
            {errors.currency && (
              <p className="text-xs text-red-600">{errors.currency}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={values.sku}
              onChange={(e) => set("sku", e.target.value)}
              placeholder="SKU-0001"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={values.status}
              onValueChange={(v) => set("status", v as ProductStatus)}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 ring-1 ring-black/5 space-y-4">
        <h3 className="eyebrow">Organization</h3>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={values.categoryId || "none"}
            onValueChange={(v) => set("categoryId", v === "none" ? "" : v)}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Uncategorized" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Uncategorized</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {categories.length === 0 && (
            <p className="text-xs text-ink/50">
              No categories yet — add some from the Categories tab.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 ring-1 ring-black/5 space-y-4">
        <h3 className="eyebrow">Image</h3>
        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input
            id="imageUrl"
            value={values.imageUrl}
            onChange={(e) => set("imageUrl", e.target.value)}
            placeholder="https://…"
          />
          {errors.imageUrl && (
            <p className="text-xs text-red-600">{errors.imageUrl}</p>
          )}
        </div>
        {values.imageUrl && !errors.imageUrl && (
          <div className="aspect-square w-40 overflow-hidden rounded-lg bg-ink/5 ring-1 ring-black/5">
            <img
              src={values.imageUrl}
              alt="Preview"
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
      </section>

      <section className="rounded-xl bg-white p-6 ring-1 ring-black/5 space-y-4">
        <h3 className="eyebrow">SEO</h3>
        <div className="space-y-2">
          <Label htmlFor="seoTitle">Meta title</Label>
          <Input
            id="seoTitle"
            value={values.seoTitle}
            onChange={(e) => set("seoTitle", e.target.value)}
            maxLength={120}
          />
          <p className="text-xs text-ink/40">{values.seoTitle.length}/120</p>
          {errors.seoTitle && (
            <p className="text-xs text-red-600">{errors.seoTitle}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="seoDescription">Meta description</Label>
          <Textarea
            id="seoDescription"
            rows={3}
            value={values.seoDescription}
            onChange={(e) => set("seoDescription", e.target.value)}
            maxLength={320}
          />
          <p className="text-xs text-ink/40">{values.seoDescription.length}/320</p>
          {errors.seoDescription && (
            <p className="text-xs text-red-600">{errors.seoDescription}</p>
          )}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          disabled={saving}
          className="rounded-full bg-ink px-6 text-xs font-semibold uppercase tracking-widest text-canvas hover:bg-ink/90"
        >
          {saving ? "Saving…" : submitLabel}
        </Button>
        {onDelete && (
          <Button
            type="button"
            variant="outline"
            disabled={deleting}
            onClick={onDelete}
            className="rounded-full border-red-200 px-6 text-xs font-semibold uppercase tracking-widest text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        )}
      </div>
    </form>
  );
}
