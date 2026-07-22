import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { currencySymbol } from "@/lib/store-config";

type StoreRow = {
  id: string;
  slug: string | null;
  name: string;
  category: string;
  template: string;
  status: string;
  currency: string;
  primary_color: string;
  secondary_color: string;
  updated_at: string;
};

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [{ title: "My Stores · Atelier" }, { name: "robots", content: "noindex" }],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const [stores, setStores] = useState<StoreRow[] | null>(null);

  useEffect(() => {
    supabase
      .from("stores")
      .select(
        "id,slug,name,category,template,status,currency,primary_color,secondary_color,updated_at",
      )
      .order("updated_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        setStores(data ?? []);
      });
  }, []);

  async function duplicate(id: string) {
    const { data: src, error } = await supabase.from("stores").select("*").eq("id", id).single();
    if (error || !src) return toast.error("Could not duplicate");
    const { id: _id, created_at, updated_at, user_id: _u, ...rest } = src;
    void _id;
    void created_at;
    void updated_at;
    void _u;
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const { error: insertErr } = await supabase.from("stores").insert({
      ...rest,
      name: rest.name + " (copy)",
      status: "draft",
      user_id: user.user.id,
    });
    if (insertErr) toast.error(insertErr.message);
    else {
      toast.success("Duplicated");
      const { data } = await supabase
        .from("stores")
        .select(
          "id,slug,name,category,template,status,currency,primary_color,secondary_color,updated_at",
        )
        .order("updated_at", { ascending: false });
      setStores(data ?? []);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this store?")) return;
    const { error } = await supabase.from("stores").delete().eq("id", id);
    if (error) toast.error(error.message);
    else setStores((s) => s?.filter((x) => x.id !== id) ?? null);
  }

  return (
    <div>
      <header className="flex items-center justify-between border-b border-ink/5 bg-white/40 px-8 py-5 backdrop-blur">
        <div>
          <p className="eyebrow">Studio</p>
          <h1 className="mt-1 font-serif text-2xl italic">My Stores</h1>
        </div>
        <Link
          to="/generator"
          className="rounded-full bg-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-canvas hover:bg-ink/90"
        >
          + New store
        </Link>
      </header>

      <div className="p-8">
        {stores === null ? (
          <p className="text-sm text-ink/40">Loading your stores…</p>
        ) : stores.length === 0 ? (
          <EmptyState onCreate={() => navigate({ to: "/generator" })} />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((s) => (
              <article
                key={s.id}
                className="group overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-md"
              >
                <div
                  className="relative aspect-[16/10] overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${s.primary_color} 0%, ${s.secondary_color} 100%)`,
                  }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white/95">
                    <p className="eyebrow" style={{ color: "#ffffff90" }}>
                      {s.template}
                    </p>
                    <p className="mt-2 font-serif text-2xl italic">{s.name}</p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold">{s.name}</h3>
                      <p className="mt-0.5 text-xs text-ink/50">
                        {s.category} · {currencySymbol(s.currency)}
                        {s.currency}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${
                        s.status === "published"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-ink/5 text-ink/60"
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>
                  <div className="mt-4 flex gap-2 text-xs">
                    <Link
                      to="/generator"
                      search={{ id: s.id }}
                      className="flex-1 rounded-full border border-ink/15 py-1.5 text-center font-medium hover:bg-ink/5"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => duplicate(s.id)}
                      className="rounded-full border border-ink/15 px-3 py-1.5 font-medium hover:bg-ink/5"
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={() => remove(s.id)}
                      className="rounded-full border border-ink/15 px-3 py-1.5 font-medium text-destructive hover:bg-destructive/5"
                    >
                      Delete
                    </button>
                  </div>
                  {s.status === "published" && s.slug && (
                    <a
                      href={`/s/${s.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 block truncate text-[10px] font-semibold uppercase tracking-widest text-ink/50 hover:text-ink"
                    >
                      ↗ /s/{s.slug}
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="mx-auto max-w-lg py-24 text-center">
      <p className="eyebrow">No stores yet</p>
      <h2 className="mt-4 font-serif text-4xl italic">Your first storefront awaits.</h2>
      <p className="mt-3 text-sm text-ink/60">
        Describe your brand and Atelier composes a complete e-commerce site — homepage, catalog,
        cart, checkout, and more.
      </p>
      <button
        onClick={onCreate}
        className="mt-8 rounded-full bg-ink px-6 py-3 text-xs font-semibold uppercase tracking-widest text-canvas hover:bg-ink/90"
      >
        Generate a store
      </button>
    </div>
  );
}
