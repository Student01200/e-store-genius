import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createProduct } from "@/lib/products.functions";
import { listCategories } from "@/lib/categories.functions";
import {
  ProductForm,
  emptyProductForm,
  type CategoryOption,
  type ProductFormValues,
} from "@/components/products/ProductForm";

export const Route = createFileRoute(
  "/_authenticated/stores/$storeId/products/new",
)({
  component: NewProductPage,
});

function NewProductPage() {
  const { storeId } = Route.useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listCategories({ data: { storeId } })
      .then((rows: any) =>
        setCategories(rows.map((r: any) => ({ id: r.id, name: r.name }))),
      )
      .catch(() => toast.error("Failed to load categories"));
  }, [storeId]);

  async function handleSubmit(values: ProductFormValues) {
    setSaving(true);
    try {
      const created: any = await createProduct({
        data: {
          storeId,
          name: values.name,
          slug: values.slug || undefined,
          description: values.description || undefined,
          basePrice: Number(values.basePrice),
          currency: values.currency,
          status: values.status,
          categoryId: values.categoryId || null,
          sku: values.sku || undefined,
          imageUrl: values.imageUrl || undefined,
          seoTitle: values.seoTitle || undefined,
          seoDescription: values.seoDescription || undefined,
        },
      });
      toast.success("Product created");
      navigate({
        to: "/stores/$storeId/products/$productId",
        params: { storeId, productId: created.id },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setSaving(false);
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
        <h2 className="mt-2 font-serif text-2xl italic">New Product</h2>
      </div>
      <ProductForm
        initial={emptyProductForm}
        categories={categories}
        submitLabel="Create Product"
        saving={saving}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
