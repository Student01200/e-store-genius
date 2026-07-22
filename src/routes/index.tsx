import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-editorial.jpg";
import luxuryImg from "@/assets/template-luxury.jpg";
import minimalImg from "@/assets/template-minimal.jpg";
import modernImg from "@/assets/template-modern.jpg";
import marketplaceImg from "@/assets/template-marketplace.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Atelier — Generate specialized e-commerce stores in minutes" },
      {
        name: "description",
        content:
          "A boutique SaaS platform for creating, customizing, and shipping AI-generated online stores across fashion, beauty, food, jewelry, and more.",
      },
    ],
  }),
  component: Landing,
});

const TEMPLATES = [
  { name: "Maison", tag: "Editorial luxury", img: luxuryImg },
  { name: "Blanc", tag: "Minimal", img: minimalImg },
  { name: "Kinetic", tag: "Modern", img: modernImg },
  { name: "Bazaar", tag: "Marketplace", img: marketplaceImg },
];

function Landing() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link to="/" className="font-serif text-2xl italic tracking-tight">
          Atelier
        </Link>
        <nav className="hidden gap-8 text-sm text-ink/60 md:flex">
          <a href="#templates" className="hover:text-ink">
            Templates
          </a>
          <a href="#how" className="hover:text-ink">
            How it works
          </a>
          <a href="#pricing" className="hover:text-ink">
            Pricing
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/auth" className="text-sm text-ink/70 hover:text-ink">
            Sign in
          </Link>
          <Link
            to="/auth"
            className="rounded-full bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-widest text-canvas hover:bg-ink/90"
          >
            Open Studio
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 pb-24 pt-12 lg:grid-cols-[1.1fr_1fr] lg:pt-24">
        <div className="flex flex-col justify-center">
          <p className="eyebrow mb-6">A store studio, not a builder</p>
          <h1 className="font-serif text-5xl leading-[1.02] tracking-tight md:text-7xl">
            Generate specialized <em className="italic text-accent">e-commerce</em> stores in
            minutes.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-ink/60">
            Describe your brand once. Atelier composes a complete storefront — homepage, product
            pages, cart, checkout, FAQ — tailored to your category, your palette, and your voice.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/auth"
              className="rounded-full bg-ink px-6 py-3 text-xs font-semibold uppercase tracking-widest text-canvas hover:bg-ink/90"
            >
              Start generating
            </Link>
            <a
              href="#templates"
              className="rounded-full border border-ink/20 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-ink hover:bg-ink/5"
            >
              Browse templates
            </a>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-8 text-sm">
            {[
              ["04", "Templates, tuned per category"],
              ["12+", "Currencies & languages"],
              ["∞", "Stores per workspace"],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="font-serif text-3xl italic">{k}</p>
                <p className="mt-1 text-xs text-ink/50">{v}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <img
            src={heroImg}
            alt="Editorial still life with ceramic vase, candle, and folded linen"
            width={1600}
            height={1000}
            className="aspect-[4/5] w-full rounded-2xl object-cover shadow-2xl"
          />
          <div className="absolute -bottom-6 -left-6 hidden max-w-[220px] rounded-xl bg-white p-4 shadow-xl ring-1 ring-black/5 md:block">
            <p className="eyebrow mb-2">Live preview</p>
            <p className="font-serif text-lg italic leading-tight">
              "Curating the quiet moments of life."
            </p>
          </div>
        </div>
      </section>

      <section id="templates" className="border-t border-ink/5 bg-stone-warm/40 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <p className="eyebrow">Templates</p>
              <h2 className="mt-3 font-serif text-4xl md:text-5xl">Four points of view.</h2>
            </div>
            <p className="hidden max-w-sm text-sm text-ink/60 md:block">
              Each template is a full storefront system — nav, hero, listings, PDP, cart, checkout,
              about, contact, FAQ — tuned to a distinct voice.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {TEMPLATES.map((t) => (
              <article key={t.name} className="group">
                <div className="aspect-[4/5] overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
                  <img
                    src={t.img}
                    alt={t.name + " template preview"}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="mt-4">
                  <p className="eyebrow">{t.tag}</p>
                  <h3 className="mt-1 font-serif text-2xl italic">{t.name}</h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="eyebrow">The process</p>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl">Three steps to a shop.</h2>
          <div className="mt-16 grid grid-cols-1 gap-12 text-left md:grid-cols-3">
            {[
              ["01", "Describe", "Name, category, audience, palette, logo. Two minutes."],
              ["02", "Generate", "Atelier composes copy, structure, and a full storefront."],
              ["03", "Refine & ship", "Tweak sections, swap products, publish."],
            ].map(([n, t, d]) => (
              <div key={n}>
                <p className="font-serif text-4xl italic text-accent">{n}</p>
                <h3 className="mt-3 font-serif text-2xl">{t}</h3>
                <p className="mt-2 text-sm text-ink/60">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="border-t border-ink/5 bg-ink py-24 text-canvas">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="eyebrow" style={{ color: "#ffffff70" }}>
            Ready when you are
          </p>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl">Open your studio.</h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-canvas/70">
            Free during preview. Generate as many stores as you need — publish when the palette
            feels right.
          </p>
          <Link
            to="/auth"
            className="mt-8 inline-block rounded-full bg-canvas px-8 py-3 text-xs font-semibold uppercase tracking-widest text-ink hover:bg-canvas/90"
          >
            Create your first store
          </Link>
        </div>
      </section>

      <footer className="mx-auto max-w-7xl px-6 py-10 text-xs text-ink/40">
        © {new Date().getFullYear()} Atelier Studio · A store generator platform
      </footer>
    </div>
  );
}
