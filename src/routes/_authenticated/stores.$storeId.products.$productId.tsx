import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/products.functions";

export const Route = createFileRoute(
  "/_authenticated/stores/$storeId/products/$productId"
)({
  component: EditProductPage,
});


function EditProductPage() {
  const { productId, storeId } = Route.useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    basePrice: 0,
    currency: "USD",
    sku: "",
    status: "draft" as "draft" | "active" | "archived",
    imageUrl: "",
  });


  useEffect(() => {
    async function load() {
      try {
        const product = await getProduct({
          data: {
            id: productId,
          },
        });

        if (!product) {
          throw new Error("Product not found");
        }

        setForm({
          name: product.name,
          description: product.description ?? "",
          basePrice: Number(product.base_price),
          currency: product.currency,
          sku: product.sku ?? "",
          status: product.status,
          imageUrl: product.image_url ?? "",
        });

      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed loading product"
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [productId]);


  function update(
    key: keyof typeof form,
    value: string | number
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }


  async function save(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);

    try {
      await updateProduct({
        data: {
          id: productId,
          name: form.name,
          description: form.description,
          basePrice: Number(form.basePrice),
          currency: form.currency,
          sku: form.sku || null,
          status: form.status,
          imageUrl: form.imageUrl || null,
        },
      });

      toast.success("Product updated");

      navigate({
        to: "/stores/$storeId/products",
        params: {
          storeId,
        },
      });

    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed updating product"
      );
    } finally {
      setSaving(false);
    }
  }


  async function remove() {
    if (!confirm("Delete this product?")) return;

    try {
      await deleteProduct({
        data: {
          id: productId,
        },
      });

      toast.success("Product deleted");

      navigate({
        to: "/stores/$storeId/products",
        params: {
          storeId,
        },
      });

    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed deleting product"
      );
    }
  }


  if (loading) {
    return (
      <p className="text-sm text-ink/40">
        Loading product...
      </p>
    );
  }


  return (
    <div className="max-w-xl">

      <h2 className="mb-6 font-serif text-2xl italic">
        Edit Product
      </h2>


      <form
        onSubmit={save}
        className="space-y-4 rounded-xl bg-white p-6 ring-1 ring-black/5"
      >

        <input
          value={form.name}
          onChange={(e) =>
            update("name", e.target.value)
          }
          className="w-full rounded-lg border p-3"
          placeholder="Product name"
        />


        <textarea
          value={form.description}
          onChange={(e) =>
            update("description", e.target.value)
          }
          className="w-full rounded-lg border p-3"
          placeholder="Description"
        />


        <input
          type="number"
          value={form.basePrice}
          onChange={(e) =>
            update(
              "basePrice",
              Number(e.target.value)
            )
          }
          className="w-full rounded-lg border p-3"
          placeholder="Price"
        />


        <select
          value={form.status}
          onChange={(e) =>
            update(
              "status",
              e.target.value
            )
          }
          className="w-full rounded-lg border p-3"
        >
          <option value="draft">
            Draft
          </option>

          <option value="active">
            Active
          </option>

          <option value="archived">
            Archived
          </option>

        </select>


        <button
          disabled={saving}
          className="rounded-full bg-ink px-6 py-3 text-xs font-semibold uppercase tracking-widest text-canvas"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>


        <button
          type="button"
          onClick={remove}
          className="rounded-full border border-red-200 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-red-600"
        >
          Delete Product
        </button>

      </form>

    </div>
  );
}