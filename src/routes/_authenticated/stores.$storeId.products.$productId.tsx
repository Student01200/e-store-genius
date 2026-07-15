import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/products.functions";
import { listCategories } from "@/lib/categories.functions";
import {
  ProductForm,
  emptyProductForm,
  type CategoryOption,
  type ProductFormValues,
} from "@/components/products/ProductForm";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute(
  "/_authenticated/stores/$storeId/products/$productId",
)({
  component: EditProductPage,
});

function EditProductPage() {
  const { storeId, productId } = Route.useParams();
  const navigate = useNavigate();

  const [initial, setInitial] = useState<ProductFormValues | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      getProduct({ data: { id: productId } }),
      listCategories({ data: { storeId } }),
    ])
      .then(([p, c]: any) => {
        if (cancelled) return;
        if (!p) throw new Error("Product not found");
        setInitial({
          ...emptyProductForm,
          name: p.name ?? "",
          slug: p.slug ?? "",
          description: p.description ?? "",
          basePrice: Number(p.base_price ?? 0),
          currency: p.currency ?? "USD",
          categoryId: p.category_id ?? "",
          sku: p.sku ?? "",
          status: p.status,
          imageUrl: p.image_url ?? "",
          seoTitle: p.seo_title ?? "",
          seoDescription: p.seo_description ?? "",
        });
        setCategories(
          (c as any[]).map((x) => ({ id: x.id, name: x.name })),
        );
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load product");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId, storeId]);

  async function handleSubmit(values: ProductFormValues) {
    setSaving(true);
    try {
      await updateProduct({
        data: {
          id: productId,
          name: values.name,
          slug: values.slug,
          description: values.description || null,
          basePrice: Number(values.basePrice),
          currency: values.currency,
          status: values.status,
          categoryId: values.categoryId || null,
          sku: values.sku || null,
          imageUrl: values.imageUrl || null,
          seoTitle: values.seoTitle || null,
          seoDescription: values.seoDescription || null,
        },
      });
      toast.success("Product updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await deleteProduct({ data: { id: productId } });
      toast.success("Product deleted");
      navigate({ to: "/stores/$storeId/products", params: { storeId } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          to="/stores/$storeId/products"
          params={{ storeId }}
          className="text-xs uppercase tracking-widest text-ink/50 hover:text-ink"
        >
          ← Back to products
        </Link>
        <h2 className="mt-2 font-serif text-2xl italic">Edit Product</h2>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : error ? (
        <div className="rounded-xl bg-white p-8 ring-1 ring-black/5 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <Link
            to="/stores/$storeId/products"
            params={{ storeId }}
            className="mt-4 inline-block text-xs uppercase tracking-widest text-ink/60 hover:text-ink"
          >
            Back to products
          </Link>
        </div>
      ) : initial ? (
        <ProductForm
          initial={initial}
          categories={categories}
          submitLabel="Save Changes"
          saving={saving}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
          deleting={deleting}
        />
      ) : null}
    </div>
  );
}
