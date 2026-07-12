import type { StoreConfig } from "@/lib/store-config";
import { currencySymbol } from "@/lib/store-config";
import { adaptFor, type CategoryAdapt } from "@/lib/category-adapt";

interface Props {
  config: StoreConfig;
  device?: "desktop" | "tablet" | "mobile";
}

// Wrapper: chooses a template by config.template, then adapts to category.
export function StorefrontPreview({ config, device = "desktop" }: Props) {
  const widthClass =
    device === "mobile" ? "max-w-[380px]" : device === "tablet" ? "max-w-[720px]" : "max-w-full";
  const adapt = adaptFor(config.category);

  return (
    <div className={`mx-auto w-full ${widthClass} transition-all`}>
      <div
        className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
        style={{ fontFamily: adapt.bodyFont }}
      >
        {config.template === "luxury" && <LuxuryTemplate config={config} adapt={adapt} />}
        {config.template === "minimal" && <MinimalTemplate config={config} adapt={adapt} />}
        {config.template === "modern" && <ModernTemplate config={config} adapt={adapt} />}
        {config.template === "marketplace" && <MarketplaceTemplate config={config} adapt={adapt} />}
      </div>
    </div>
  );
}

type TplProps = { config: StoreConfig; adapt: CategoryAdapt };

// Shared adaptive product card.
function ProductCard({
  product,
  adapt,
  sym,
  variant = "default",
}: {
  product: StoreConfig["products"][number];
  adapt: CategoryAdapt;
  sym: string;
  variant?: "default" | "compact" | "wide";
}) {
  const frame =
    adapt.cardStyle === "framed"
      ? "ring-1 ring-black/10 p-2 bg-white"
      : adapt.cardStyle === "shadow"
        ? "shadow-md p-2 bg-white"
        : adapt.cardStyle === "tile"
          ? "bg-stone-50 p-3"
          : "";

  return (
    <div className={`${frame} ${adapt.productRadius} relative overflow-hidden`}>
      <div className={`${adapt.productAspect} overflow-hidden ${adapt.productRadius} bg-stone-100`}>
        {product.image && (
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        )}
        {adapt.showBadge && (
          <span
            className="absolute left-3 top-3 rounded-full bg-black/80 px-2 py-0.5 text-[9px] font-semibold tracking-widest text-white"
          >
            {adapt.badgeLabel}
          </span>
        )}
      </div>
      <div
        className={`mt-2 flex ${
          variant === "wide" ? "flex-col" : "items-baseline justify-between"
        } gap-1 text-xs`}
      >
        <span className="truncate font-medium">{product.name}</span>
        <span className="text-black/50">{sym}{product.price}</span>
      </div>
    </div>
  );
}

// ---------- Luxury / Editorial ----------
function LuxuryTemplate({ config, adapt }: TplProps) {
  const sym = currencySymbol(config.currency);
  const headingStyle = {
    fontFamily: adapt.headingFont,
    fontWeight: adapt.headingWeight,
  } as const;
  return (
    <div style={{ background: "#ffffff", color: config.primaryColor }}>
      <nav className="flex items-center justify-between border-b border-black/5 px-8 py-6">
        <span
          className={`text-xl ${adapt.headingTracking}`}
          style={headingStyle}
        >
          {config.name.toUpperCase() || "MAISON"}
        </span>
        <div className="hidden gap-6 text-[10px] font-semibold tracking-[0.2em] sm:flex">
          {adapt.navLinks.map((l) => (
            <span key={l}>{l.toUpperCase()}</span>
          ))}
          <span>CART (0)</span>
        </div>
      </nav>
      <section className={`${adapt.heroPadding} ${adapt.heroAlign === "center" ? "text-center" : ""}`}>
        <p className="eyebrow mb-6" style={{ color: config.secondaryColor }}>
          {config.category} · {adapt.eyebrowSuffix}
        </p>
        <h1
          className={`${adapt.heroAlign === "center" ? "mx-auto" : ""} max-w-2xl text-4xl leading-tight md:text-6xl ${adapt.headingTracking}`}
          style={headingStyle}
        >
          {config.heroHeadline}
        </h1>
        <p
          className={`${adapt.heroAlign === "center" ? "mx-auto" : ""} mt-6 max-w-md text-sm leading-relaxed text-black/50`}
        >
          {config.heroSubheadline}
        </p>
        <button
          className="mt-8 rounded-full px-6 py-2.5 text-xs font-semibold tracking-widest"
          style={{ background: config.primaryColor, color: "#fff" }}
        >
          {adapt.ctaLabel.toUpperCase()}
        </button>
      </section>
      <section className="px-8 pb-4">
        <p className="eyebrow mb-4" style={{ color: config.secondaryColor }}>
          {adapt.sectionLabel}
        </p>
      </section>
      <section className={`grid gap-6 px-8 pb-12 ${adapt.productGridCols}`}>
        {config.products.slice(0, 4).map((p) => (
          <ProductCard key={p.id} product={p} adapt={adapt} sym={sym} />
        ))}
      </section>
      <footer className="border-t border-black/5 px-8 py-8 text-[10px] tracking-widest text-black/40">
        © {config.name || "Maison"} · {config.contactEmail || "hello@maison.co"}
      </footer>
    </div>
  );
}

// ---------- Minimal / Blanc ----------
function MinimalTemplate({ config, adapt }: TplProps) {
  const sym = currencySymbol(config.currency);
  const headingStyle = {
    fontFamily: adapt.headingFont,
    fontWeight: adapt.headingWeight,
  } as const;
  return (
    <div className="bg-white text-black">
      <nav className="flex items-center justify-between px-6 py-5">
        <span className="text-sm font-semibold tracking-tight">{config.name || "Blanc"}</span>
        <div className="hidden gap-5 text-xs text-black/60 sm:flex">
          {adapt.navLinks.slice(0, 3).map((l) => (
            <span key={l}>{l}</span>
          ))}
          <span>Cart</span>
        </div>
      </nav>
      <section
        className={`grid grid-cols-1 gap-6 px-6 py-12 md:grid-cols-2 ${
          adapt.heroAlign === "center" ? "text-center" : ""
        }`}
      >
        <div className="flex flex-col justify-center">
          <p className="eyebrow" style={{ color: config.secondaryColor }}>
            {config.category} · {adapt.eyebrowSuffix}
          </p>
          <h1
            className={`mt-4 text-4xl leading-tight md:text-5xl ${adapt.headingTracking}`}
            style={headingStyle}
          >
            {config.heroHeadline}
          </h1>
          <p className="mt-4 max-w-sm text-sm text-black/50">{config.heroSubheadline}</p>
          <button
            className={`mt-8 w-fit ${
              adapt.productRadius === "rounded-full" ? "rounded-full px-5 py-2 text-white" : "rounded-none border-b-2 pb-1"
            } text-sm font-semibold`}
            style={
              adapt.productRadius === "rounded-full"
                ? { background: config.primaryColor }
                : { borderColor: config.primaryColor, color: config.primaryColor }
            }
          >
            {adapt.ctaLabel} →
          </button>
        </div>
        <div className={`${adapt.productAspect} overflow-hidden bg-stone-100 ${adapt.productRadius}`}>
          {config.products[0]?.image && (
            <img src={config.products[0].image} alt="" className="h-full w-full object-cover" />
          )}
        </div>
      </section>
      <section className="px-6 pb-2">
        <h2 className={`text-lg ${adapt.headingTracking}`} style={headingStyle}>
          {adapt.sectionLabel}
        </h2>
      </section>
      <section className={`grid gap-4 px-6 pb-12 ${adapt.productGridCols}`}>
        {config.products.slice(0, 4).map((p) => (
          <ProductCard key={p.id} product={p} adapt={adapt} sym={sym} />
        ))}
      </section>
    </div>
  );
}

// ---------- Modern / Kinetic ----------
function ModernTemplate({ config, adapt }: TplProps) {
  const sym = currencySymbol(config.currency);
  const headingStyle = {
    fontFamily: adapt.headingFont,
    fontWeight: Math.max(adapt.headingWeight, 700),
  } as const;
  return (
    <div className="bg-white text-black">
      <nav
        className="flex items-center justify-between px-6 py-4"
        style={{ background: config.primaryColor, color: "#fff" }}
      >
        <span className="text-lg font-bold tracking-tight">{config.name || "Kinetic"}</span>
        <div className="hidden gap-5 text-xs font-semibold sm:flex">
          {adapt.navLinks.map((l) => (
            <span key={l}>{l}</span>
          ))}
          <span>Cart · 0</span>
        </div>
      </nav>
      <section
        className={`relative overflow-hidden ${adapt.heroPadding} ${
          adapt.heroAlign === "center" ? "text-center" : ""
        }`}
        style={{ background: adapt.surfaceTint }}
      >
        <p className="eyebrow" style={{ color: config.primaryColor }}>
          {config.category} · {adapt.eyebrowSuffix}
        </p>
        <h1
          className={`${adapt.heroAlign === "center" ? "mx-auto" : ""} mt-4 max-w-2xl text-5xl leading-[0.95] md:text-7xl ${adapt.headingTracking}`}
          style={headingStyle}
        >
          {config.heroHeadline}
        </h1>
        <p
          className={`${adapt.heroAlign === "center" ? "mx-auto" : ""} mt-6 max-w-md text-sm text-black/60`}
        >
          {config.heroSubheadline}
        </p>
        <div
          className={`mt-8 flex gap-3 ${adapt.heroAlign === "center" ? "justify-center" : ""}`}
        >
          <button
            className="rounded-full px-6 py-3 text-sm font-semibold"
            style={{ background: config.primaryColor, color: "#fff" }}
          >
            {adapt.ctaLabel}
          </button>
          <button className="rounded-full border border-black/20 px-6 py-3 text-sm font-semibold">
            Learn more
          </button>
        </div>
      </section>
      <section className="px-6 py-10">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className={`text-2xl ${adapt.headingTracking}`} style={headingStyle}>
            {adapt.sectionLabel}
          </h2>
          <span className="text-xs text-black/50">View all →</span>
        </div>
        <div className={`grid gap-4 ${adapt.productGridCols}`}>
          {config.products.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} adapt={adapt} sym={sym} />
          ))}
        </div>
      </section>
    </div>
  );
}

// ---------- Marketplace / Bazaar ----------
function MarketplaceTemplate({ config, adapt }: TplProps) {
  const sym = currencySymbol(config.currency);
  const headingStyle = {
    fontFamily: adapt.headingFont,
    fontWeight: adapt.headingWeight,
  } as const;
  return (
    <div className="bg-stone-50 text-black">
      <nav className="flex items-center justify-between border-b border-black/5 bg-white px-6 py-3">
        <span
          className={`text-xl ${adapt.headingTracking}`}
          style={{ ...headingStyle, color: config.primaryColor }}
        >
          {config.name || "Bazaar"}
        </span>
        <input
          placeholder={`Search ${config.category.toLowerCase()}…`}
          className="hidden w-full max-w-md rounded-full border border-black/10 bg-stone-50 px-4 py-1.5 text-xs md:block"
        />
        <div className="text-xs">Sign in · Cart</div>
      </nav>
      <div className="flex gap-4 overflow-x-auto border-b border-black/5 bg-white px-6 py-2 text-xs">
        {(config.productCategories.length ? config.productCategories : adapt.navLinks).map((c) => (
          <span key={c} className="whitespace-nowrap font-medium text-black/70">{c}</span>
        ))}
      </div>
      <section className="grid grid-cols-3 gap-4 px-6 py-6">
        <div
          className={`col-span-3 p-8 md:col-span-2 ${adapt.productRadius}`}
          style={{ background: config.primaryColor, color: "#fff" }}
        >
          <p className="eyebrow" style={{ color: "#ffffff90" }}>
            {config.category} · {adapt.eyebrowSuffix}
          </p>
          <h1 className={`mt-2 text-3xl md:text-4xl ${adapt.headingTracking}`} style={headingStyle}>
            {config.heroHeadline}
          </h1>
          <p className="mt-3 max-w-md text-sm opacity-80">{config.heroSubheadline}</p>
          <button className="mt-5 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/30">
            {adapt.ctaLabel}
          </button>
        </div>
        <div
          className={`col-span-3 hidden p-8 md:col-span-1 md:block ${adapt.productRadius}`}
          style={{ background: config.secondaryColor, color: "#fff" }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest">{adapt.sectionLabel}</p>
          <p className="mt-2 text-2xl" style={headingStyle}>{config.name || "Studio 03"}</p>
        </div>
      </section>
      <section className="px-6 pb-10">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className={`text-lg ${adapt.headingTracking}`} style={headingStyle}>
            {adapt.sectionLabel}
          </h2>
          <span className="text-xs text-black/50">Sort ↓</span>
        </div>
        <div className={`grid gap-3 ${adapt.productGridCols}`}>
          {config.products.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} adapt={adapt} sym={sym} />
          ))}
        </div>
      </section>
    </div>
  );
}
