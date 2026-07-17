import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";

import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/categories.functions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


export const Route = createFileRoute(
  "/_authenticated/stores/$storeId/categories",
)({
  loader: async ({ params }) => {
    const categories = await listCategories({
      data: {
        storeId: params.storeId,
      },
    });

    return {
      categories,
    };
  },

  component: RouteComponent,
});


function RouteComponent() {
  const { categories } = Route.useLoaderData();
  const { storeId } = Route.useParams();
  const router = useRouter();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);


  async function handleCreate() {
    if (!name.trim()) return;

    setSaving(true);

    await createCategory({
      data: {
        storeId,
        name,
      },
    });

    setName("");

    // إعادة تحميل البيانات
    await router.invalidate();

    setSaving(false);
  }


  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-semibold">
        Categories
      </h1>


      <div className="flex gap-3">

        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
        />


        <Button
          onClick={handleCreate}
          disabled={saving}
        >
          {saving ? "Saving..." : "Add"}
        </Button>

      </div>


      <div className="space-y-3">

        {categories.map((item: {
          id: string;
          name: string;
          slug: string;
        }) => (

          <div
            key={item.id}
            className="rounded-lg border p-4 flex justify-between"
          >

            <div>
              <p className="font-medium">
                {item.name}
              </p>

              <p className="text-sm text-muted-foreground">
                {item.slug}
              </p>
            </div>


            <Button
              variant="outline"
              onClick={async () => {
                await deleteCategory({
                  data: {
                    id: item.id,
                  },
                });

                await router.invalidate();
              }}
            >
              Delete
            </Button>


          </div>

        ))}

      </div>

    </div>
  );
}