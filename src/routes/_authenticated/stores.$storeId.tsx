import { createFileRoute, Outlet, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/stores/$storeId")({
  component: StoreLayout,
});

function StoreLayout() {
  const { storeId } = Route.useParams();

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="font-serif text-3xl italic">
          Store Management
        </h1>

        <p className="text-sm text-ink/50">
          Store ID: {storeId}
        </p>
      </header>


      <nav className="flex gap-4 border-b pb-4 mb-6">
        <Link
          to="/stores/$storeId/products"
          params={{ storeId }}
          className="text-sm"
        >
          Products
        </Link>

        <Link
          to="/stores/$storeId/categories"
          params={{ storeId }}
          className="text-sm"
        >
          Categories
        </Link>
      </nav>


      <Outlet />
    </div>
  );
}