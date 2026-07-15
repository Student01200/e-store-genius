import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in · Atelier Studio" },
      { name: "description", content: "Sign in or create your Atelier account to start generating stores." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/dashboard" },
        });
        if (error) throw error;
        toast.success("Account created. You can sign in now.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

 async function handleGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin,
    },
  });

  if (error) {
    toast.error("Google sign-in failed");
  }
}

  return (
    <div className="min-h-screen bg-canvas">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link to="/" className="font-serif text-2xl italic tracking-tight text-ink">Atelier</Link>
        <Link to="/" className="text-xs text-ink/50 hover:text-ink">← Back to home</Link>
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 py-12 lg:grid-cols-2 lg:py-24">
        <div className="hidden flex-col justify-center lg:flex">
          <p className="eyebrow mb-6">Store Studio</p>
          <h1 className="font-serif text-5xl leading-[1.05] italic tracking-tight text-ink">
            Sign in to your atelier.
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-ink/60">
            Every store you generate, every template you save, every draft you
            leave — waiting exactly where you left it.
          </p>
        </div>

        <div className="flex flex-col justify-center">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-8 flex gap-6 border-b border-ink/10 text-sm">
              {(["signin", "signup"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`-mb-px border-b-2 pb-3 font-medium transition-colors ${
                    mode === m ? "border-ink text-ink" : "border-transparent text-ink/40"
                  }`}
                >
                  {m === "signin" ? "Sign in" : "Create account"}
                </button>
              ))}
            </div>

            <button
              onClick={handleGoogle}
              className="mb-6 flex w-full items-center justify-center gap-3 rounded-lg border border-ink/15 bg-white px-4 py-2.5 text-sm font-medium hover:bg-ink/5"
            >
              <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
                <path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.4-.2-2.1H12v3.9h5.9c-.1 1-.8 2.6-2.3 3.6l3.4 2.6c2-1.9 3.5-4.7 3.5-8z"/>
                <path fill="#34A853" d="M12 23c3 0 5.6-1 7.4-2.7l-3.4-2.6c-1 .6-2.2 1.1-4 1.1-3 0-5.6-2-6.5-4.8L2 16.6C3.8 20.4 7.6 23 12 23z"/>
                <path fill="#FBBC05" d="M5.5 14c-.2-.6-.4-1.3-.4-2s.1-1.4.4-2L2 7.4C1.4 8.8 1 10.3 1 12s.4 3.2 1 4.6l3.5-2.6z"/>
                <path fill="#EA4335" d="M12 5.4c1.7 0 2.9.7 3.6 1.3L18.6 4c-1.8-1.6-4-2.7-6.6-2.7C7.6 1.3 3.8 3.9 2 7.4l3.5 2.6C6.4 7.3 9 5.4 12 5.4z"/>
              </svg>
              Continue with Google
            </button>

            <div className="mb-6 flex items-center gap-3 text-[10px] uppercase tracking-widest text-ink/30">
              <span className="h-px flex-1 bg-ink/10" /> or email <span className="h-px flex-1 bg-ink/10" />
            </div>

            <form onSubmit={handleEmail} className="space-y-4">
              <div>
                <label className="eyebrow mb-1 block">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-ink/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
                  placeholder="you@studio.co"
                />
              </div>
              <div>
                <label className="eyebrow mb-1 block">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-ink/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
                  placeholder="At least 6 characters"
                />
              </div>
              <button
                disabled={loading}
                className="mt-2 w-full rounded-full bg-ink px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-canvas hover:bg-ink/90 disabled:opacity-50"
              >
                {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
