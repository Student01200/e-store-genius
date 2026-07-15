import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listProducts } from "@/lib/products.functions";

export const Route = createFileRoute(
  "/_authenticated/stores/$storeId/products/"
)({
  component: ProductsPage,
});

type Product = {
  id: string;
  name: string;
  base_price: number;
  currency: string;
  status: string;
};

function ProductsPage() {
  const { storeId } = Route.useParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await listProducts({
          data: {
            storeId,
          },
        });

        setProducts(data);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();

  }, [storeId]);


  if (loading) {
    return <p>Loading products...</p>;
  }


  return (
    <div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-2xl italic">
          Products
        </h2>

        <Link
          to="/stores/$storeId/products/new"
          params={{ storeId }}
          className="rounded-full bg-ink px-5 py-2 text-xs font-semibold uppercase tracking-widest text-canvas"
        >
          + New Product
        </Link>
      </div>


      {products.length === 0 ? (
        <p className="text-sm text-ink/50">
          No products yet.
        </p>
      ) : (

        <div className="space-y-3">

          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between rounded-xl bg-white p-4 ring-1 ring-black/5"
            >

              <div>
                <h3 className="font-medium">
                  {product.name}
                </h3>

                <p className="text-sm text-ink/50">
                  {product.currency} {product.base_price}
                </p>
              </div>


              <span className="rounded-full bg-ink/5 px-3 py-1 text-xs">
                {product.status}
              </span>

            </div>
          ))}

        </div>

      )}

    </div>
  );
}