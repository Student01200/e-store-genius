import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { listProducts } from "@/lib/products.functions";
import { listCategories } from "@/lib/categories.functions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/stores/$storeId/products/")({
  component: ProductsPage,
});

type Product = {
  id: string;
  name: string;
  slug: string;
  base_price: number | string;
  currency: string;
  status: "draft" | "active" | "archived";
  sku: string | null;
  image_url: string | null;
  category_id: string | null;
};

type Category = { id: string; name: string };

const statusStyles: Record<Product["status"], string> = {
  active: "bg-emerald-100 text-emerald-700",
  draft: "bg-amber-100 text-amber-700",
  archived: "bg-ink/10 text-ink/60",
};

function ProductsPage() {
  const { storeId } = Route.useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Product["status"]>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([listProducts({ data: { storeId } }), listCategories({ data: { storeId } })])
      .then(([p, c]) => {
        if (cancelled) return;
        setProducts(p as Product[]);
        setCategories((c as Category[]).map((x) => ({ id: x.id, name: x.name })));
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load products");
        toast.error("Failed to load products");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [storeId]);

  const categoryName = useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c.name]));
    return (id: string | null) => (id ? (map.get(id) ?? "—") : "—");
  }, [categories]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (categoryFilter !== "all" && p.category_id !== categoryFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.sku ?? "").toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
      );
    });
  }, [products, search, statusFilter, categoryFilter]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl italic">Products</h2>
          <p className="text-sm text-ink/50">{loading ? "Loading…" : `${products.length} total`}</p>
        </div>
        <Button
          asChild
          className="rounded-full bg-ink px-5 text-xs font-semibold uppercase tracking-widest text-canvas hover:bg-ink/90"
        >
          <Link to="/stores/$storeId/products/new" params={{ storeId }}>
            + New Product
          </Link>
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, SKU, or slug"
          className="max-w-xs"
        />
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl bg-white ring-1 ring-black/5 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-serif text-lg italic text-ink/70">
              {products.length === 0 ? "No products yet" : "No products match your filters"}
            </p>
            <p className="mt-1 text-sm text-ink/50">
              {products.length === 0
                ? "Create your first product to start selling."
                : "Try clearing search or filters."}
            </p>
            {products.length === 0 && (
              <Button
                asChild
                className="mt-4 rounded-full bg-ink px-5 text-xs font-semibold uppercase tracking-widest text-canvas hover:bg-ink/90"
              >
                <Link to="/stores/$storeId/products/new" params={{ storeId }}>
                  + New Product
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow
                  key={p.id}
                  className="cursor-pointer"
                  onClick={() =>
                    navigate({
                      to: "/stores/$storeId/products/$productId",
                      params: { storeId, productId: p.id },
                    })
                  }
                >
                  <TableCell>
                    <div className="h-10 w-10 overflow-hidden rounded-md bg-ink/5">
                      {p.image_url ? (
                        <img src={p.image_url} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-ink/60">{categoryName(p.category_id)}</TableCell>
                  <TableCell>
                    {p.currency} {Number(p.base_price).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${statusStyles[p.status]} border-none capitalize`}>
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-ink/60">{p.sku ?? "—"}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Link
                      to="/stores/$storeId/products/$productId"
                      params={{ storeId, productId: p.id }}
                      className="text-xs font-semibold uppercase tracking-widest text-ink/70 hover:text-ink"
                    >
                      Edit
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
