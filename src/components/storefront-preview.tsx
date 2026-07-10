import type { StoreConfig } from "@/lib/store-config";
import { currencySymbol } from "@/lib/store-config";

interface Props {
  config: StoreConfig;
  device?: "desktop" | "tablet" | "mobile";
}

// Wrapper: chooses a template by config.template.
export function StorefrontPreview({ config, device = "desktop" }: Props) {
  const widthClass =
    device === "mobile" ? "max-w-[380px]" : device === "tablet" ? "max-w-[720px]" : "max-w-full";

  return (
    <div className={`mx-auto w-full ${widthClass} transition-all`}>
      <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        {config.template === "luxury" && <LuxuryTemplate config={config} />}
        {config.template === "minimal" && <MinimalTemplate config={config} />}
        {config.template === "modern" && <ModernTemplate config={config} />}
        {config.template === "marketplace" && <MarketplaceTemplate config={config} />}
      </div>
    </div>
  );
}

// ---------- Luxury / Editorial ----------
function LuxuryTemplate({ config }: { config: StoreConfig }) {
  const sym = currencySymbol(config.currency);
  return (
    <div style={{ background: "#ffffff", color: config.primaryColor }}>
      <nav className="flex items-center justify-between border-b border-black/5 px-8 py-6">
        <span className="font-serif text-xl tracking-tight">{config.name.toUpperCase() || "MAISON"}</span>
        <div className="hidden gap-6 text-[10px] font-semibold tracking-[0.2em] sm:flex">
          <span>COLLECTION</span>
          <span>JOURNAL</span>
          <span>ABOUT</span>
          <span>CART (0)</span>
        </div>
      </nav>
      <section className="px-8 py-16 text-center">
        <p className="eyebrow mb-6" style={{ color: config.secondaryColor }}>
          {config.category} · Est. Today
        </p>
        <h1 className="mx-auto max-w-2xl font-serif text-4xl leading-tight md:text-6xl">
          {config.heroHeadline}
        </h1>
        <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-black/50">
          {config.heroSubheadline}
        </p>
        <button
          className="mt-8 rounded-full px-6 py-2.5 text-xs font-semibold tracking-widest"
          style={{ background: config.primaryColor, color: "#fff" }}
        >
          EXPLORE COLLECTION
        </button>
      </section>
      <section className="grid grid-cols-2 gap-6 px-8 pb-12 md:grid-cols-3">
        {config.products.slice(0, 3).map((p) => (
          <div key={p.id} className="space-y-3">
            <div className="aspect-square overflow-hidden bg-stone-100">
              {p.image ? (
                <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="flex justify-between text-xs">
              <span className="font-medium">{p.name}</span>
              <span className="text-black/40">{sym}{p.price}</span>
            </div>
          </div>
        ))}
      </section>
      <footer className="border-t border-black/5 px-8 py-8 text-[10px] tracking-widest text-black/40">
        © {config.name || "Maison"} · {config.contactEmail || "hello@maison.co"}
      </footer>
    </div>
  );
}

// ---------- Minimal / Blanc ----------
function MinimalTemplate({ config }: { config: StoreConfig }) {
  const sym = currencySymbol(config.currency);
  return (
    <div className="bg-white text-black">
      <nav className="flex items-center justify-between px-6 py-5">
        <span className="text-sm font-semibold tracking-tight">{config.name || "Blanc"}</span>
        <div className="flex gap-5 text-xs text-black/60">
          <span>Shop</span>
          <span>Story</span>
          <span>Cart</span>
        </div>
      </nav>
      <section className="grid grid-cols-1 gap-6 px-6 py-12 md:grid-cols-2">
        <div className="flex flex-col justify-center">
          <p className="eyebrow" style={{ color: config.secondaryColor }}>{config.category}</p>
          <h1 className="mt-4 text-4xl font-medium leading-tight md:text-5xl">
            {config.heroHeadline}
          </h1>
          <p className="mt-4 max-w-sm text-sm text-black/50">{config.heroSubheadline}</p>
          <button
            className="mt-8 w-fit rounded-none border-b-2 pb-1 text-sm font-semibold"
            style={{ borderColor: config.primaryColor, color: config.primaryColor }}
          >
            Shop the edit →
          </button>
        </div>
        <div className="aspect-square bg-stone-100">
          {config.products[0]?.image && (
            <img src={config.products[0].image} alt="" className="h-full w-full object-cover" />
          )}
        </div>
      </section>
      <section className="grid grid-cols-2 gap-4 px-6 pb-12 md:grid-cols-4">
        {config.products.slice(0, 4).map((p) => (
          <div key={p.id}>
            <div className="aspect-square bg-stone-50">
              {p.image && <img src={p.image} alt={p.name} className="h-full w-full object-cover" />}
            </div>
            <div className="mt-2 text-xs">
              <p className="font-medium">{p.name}</p>
              <p className="text-black/50">{sym}{p.price}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

// ---------- Modern / Kinetic ----------
function ModernTemplate({ config }: { config: StoreConfig }) {
  const sym = currencySymbol(config.currency);
  return (
    <div className="bg-white text-black">
      <nav
        className="flex items-center justify-between px-6 py-4"
        style={{ background: config.primaryColor, color: "#fff" }}
      >
        <span className="text-lg font-bold tracking-tight">{config.name || "Kinetic"}</span>
        <div className="hidden gap-5 text-xs font-semibold sm:flex">
          <span>Shop</span>
          <span>New</span>
          <span>Sale</span>
          <span>Cart · 0</span>
        </div>
      </nav>
      <section
        className="relative overflow-hidden px-6 py-16"
        style={{ background: config.secondaryColor + "20" }}
      >
        <p className="eyebrow" style={{ color: config.primaryColor }}>
          {config.category} · Now shipping
        </p>
        <h1 className="mt-4 max-w-2xl text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
          {config.heroHeadline}
        </h1>
        <p className="mt-6 max-w-md text-sm text-black/60">{config.heroSubheadline}</p>
        <div className="mt-8 flex gap-3">
          <button
            className="rounded-full px-6 py-3 text-sm font-semibold"
            style={{ background: config.primaryColor, color: "#fff" }}
          >
            Shop now
          </button>
          <button className="rounded-full border border-black/20 px-6 py-3 text-sm font-semibold">
            Watch film
          </button>
        </div>
      </section>
      <section className="px-6 py-10">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-2xl font-bold">Bestsellers</h2>
          <span className="text-xs text-black/50">View all →</span>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {config.products.slice(0, 4).map((p) => (
            <div key={p.id} className="rounded-lg bg-stone-50 p-3">
              <div className="aspect-square overflow-hidden rounded-md bg-white">
                {p.image && <img src={p.image} alt={p.name} className="h-full w-full object-cover" />}
              </div>
              <p className="mt-2 text-sm font-semibold">{p.name}</p>
              <p className="text-xs text-black/60">{sym}{p.price}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ---------- Marketplace / Bazaar ----------
function MarketplaceTemplate({ config }: { config: StoreConfig }) {
  const sym = currencySymbol(config.currency);
  return (
    <div className="bg-stone-50 text-black">
      <nav className="flex items-center justify-between border-b border-black/5 bg-white px-6 py-3">
        <span className="font-serif text-xl tracking-tight" style={{ color: config.primaryColor }}>
          {config.name || "Bazaar"}
        </span>
        <input
          placeholder="Search all shops…"
          className="hidden w-full max-w-md rounded-full border border-black/10 bg-stone-50 px-4 py-1.5 text-xs md:block"
        />
        <div className="text-xs">Sign in · Cart</div>
      </nav>
      <div className="flex gap-4 overflow-x-auto border-b border-black/5 bg-white px-6 py-2 text-xs">
        {config.productCategories.map((c) => (
          <span key={c} className="whitespace-nowrap font-medium text-black/70">{c}</span>
        ))}
      </div>
      <section className="grid grid-cols-3 gap-4 px-6 py-6">
        <div
          className="col-span-3 rounded-xl p-8 md:col-span-2"
          style={{ background: config.primaryColor, color: "#fff" }}
        >
          <p className="eyebrow" style={{ color: "#ffffff90" }}>{config.category}</p>
          <h1 className="mt-2 font-serif text-3xl md:text-4xl">{config.heroHeadline}</h1>
          <p className="mt-3 max-w-md text-sm opacity-80">{config.heroSubheadline}</p>
        </div>
        <div
          className="col-span-3 hidden rounded-xl p-8 md:col-span-1 md:block"
          style={{ background: config.secondaryColor, color: "#fff" }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest">Featured shop</p>
          <p className="mt-2 font-serif text-2xl">{config.name || "Studio 03"}</p>
        </div>
      </section>
      <section className="px-6 pb-10">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">All products</h2>
          <span className="text-xs text-black/50">Sort ↓</span>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {config.products.slice(0, 4).map((p) => (
            <div key={p.id} className="rounded-lg bg-white p-2 ring-1 ring-black/5">
              <div className="aspect-square overflow-hidden rounded-md bg-stone-100">
                {p.image && <img src={p.image} alt={p.name} className="h-full w-full object-cover" />}
              </div>
              <p className="mt-2 text-xs font-medium">{p.name}</p>
              <p className="text-xs text-black/50">{sym}{p.price}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
