import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings · Atelier" }, { name: "robots", content: "noindex" }] }),
  component: Settings,
});

function Settings() {
  const [email, setEmail] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    supabase
      .from("stores")
      .select("id", { count: "exact", head: true })
      .then(({ count }) => setCount(count ?? 0));
  }, []);

  return (
    <div>
      <header className="border-b border-ink/5 bg-white/40 px-8 py-5 backdrop-blur">
        <p className="eyebrow">Studio</p>
        <h1 className="mt-1 font-serif text-2xl italic">Settings</h1>
      </header>

      <div className="mx-auto max-w-2xl space-y-8 p-8">
        <section className="rounded-xl bg-white p-6 ring-1 ring-black/5">
          <p className="eyebrow">Account</p>
          <p className="mt-2 font-serif text-2xl">{email ?? "—"}</p>
          <p className="mt-1 text-xs text-ink/50">{count ?? "—"} stores generated</p>
        </section>

        <section className="rounded-xl bg-white p-6 ring-1 ring-black/5">
          <p className="eyebrow">Session</p>
          <p className="mt-2 text-sm text-ink/60">
            Signed in on this device. Sign out to end your session.
          </p>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              toast.success("Signed out");
              window.location.href = "/auth";
            }}
            className="mt-4 rounded-full border border-ink/15 px-5 py-2 text-xs font-semibold uppercase tracking-widest hover:bg-ink/5"
          >
            Sign out
          </button>
        </section>

        <section className="rounded-xl bg-ink p-6 text-canvas">
          <p className="eyebrow" style={{ color: "#ffffff70" }}>Preview build</p>
          <p className="mt-2 font-serif text-2xl italic">Everything free during preview.</p>
          <p className="mt-2 text-sm text-canvas/70">
            All templates, unlimited stores, live preview. Pricing arrives with public launch.
          </p>
        </section>
      </div>
    </div>
  );
}
