import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const NAV = [
  { to: "/dashboard", label: "My Stores" },
  { to: "/generator", label: "Generator" },
  { to: "/templates", label: "Templates" },
  { to: "/settings", label: "Settings" },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-ink/5 bg-white/40 backdrop-blur">
      <div className="p-6">
        <Link to="/dashboard" className="block">
          <h1 className="font-serif text-2xl italic tracking-tight text-ink">Atelier</h1>
          <p className="eyebrow mt-1">Store Studio</p>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-4">
        {NAV.map((item) => {
          const active = pathname === item.to || pathname.startsWith(item.to + "/");
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active ? "bg-ink/5 text-ink" : "text-ink/60 hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-ink/5 p-4">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="grid size-8 shrink-0 place-items-center rounded-full bg-accent/20 font-serif text-xs">
            {email?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold">{email ?? "Signed in"}</p>
            <p className="eyebrow mt-0.5">Studio Plan</p>
          </div>
        </div>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = "/auth";
          }}
          className="mt-2 w-full rounded-md px-2 py-1.5 text-left text-xs text-ink/50 hover:bg-ink/5 hover:text-ink"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
