import { useState } from "react";
import { toast } from "sonner";
import type { StoreConfig } from "@/lib/store-config";
import { currencySymbol } from "@/lib/store-config";
import { adaptFor, type CategoryAdapt } from "@/lib/category-adapt";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Plus, Minus, Trash2 } from "lucide-react";

interface Props {
  config: StoreConfig;
  device?: "desktop" | "tablet" | "mobile";
}

type Product = StoreConfig["products"][number];

interface CartItem {
  product: Product;
  quantity: number;
}

// Wrapper: chooses a template by config.template, then adapts to category.
export function StorefrontPreview({ config, device = "desktop" }: Props) {
  const widthClass =
    device === "mobile" ? "max-w-[380px]" : device === "tablet" ? "max-w-[720px]" : "max-w-full";
  const adapt = adaptFor(config.category);
  const sym = currencySymbol(config.currency);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    toast.success(`${product.name} added to cart`);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item)),
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const filteredProducts =
    activeCategory === "All"
      ? config.products
      : config.products.filter((p) => p.category?.toLowerCase() === activeCategory.toLowerCase());

  const tplProps = {
    config,
    adapt,
    activeCategory,
    setActiveCategory,
    filteredProducts,
    cartCount,
    onOpenCart: () => setIsCartOpen(true),
    onSelectProduct: (p: Product) => setSelectedProduct(p),
  };

  return (
    <div className={`mx-auto w-full ${widthClass} transition-all`}>
      <div
        className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 relative"
        style={{ fontFamily: adapt.bodyFont }}
      >
        {config.template === "luxury" && <LuxuryTemplate {...tplProps} />}
        {config.template === "minimal" && <MinimalTemplate {...tplProps} />}
        {config.template === "modern" && <ModernTemplate {...tplProps} />}
        {config.template === "marketplace" && <MarketplaceTemplate {...tplProps} />}
      </div>

      {/* Cart Drawer */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-white p-0 flex flex-col h-full z-[100]"
        >
          <div className="p-6 border-b border-stone-100 flex items-center justify-between">
            <SheetTitle className="font-serif text-xl italic flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" /> Your Bag
            </SheetTitle>
            <span className="text-xs bg-stone-100 px-2 py-1 rounded-full font-medium">
              {cartCount} items
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-stone-400 text-center py-20">
                <ShoppingBag className="h-10 w-10 text-stone-300 stroke-[1.5] mb-3" />
                <p className="font-serif italic text-lg">Your bag is empty</p>
                <p className="text-xs mt-1">Explore our catalog to add items.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 border-b border-stone-50 pb-4 last:border-0 last:pb-0"
                >
                  <div className="w-20 h-24 bg-stone-50 rounded-lg overflow-hidden shrink-0">
                    {item.product.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-stone-300 text-[10px]">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <h4 className="font-medium text-sm text-stone-900 truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {item.product.category || config.category}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 border border-stone-100 rounded-full px-2 py-0.5 bg-stone-50">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 hover:text-black text-stone-400 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-semibold w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 hover:text-black text-stone-400 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-stone-900">
                          {sym}
                          {(item.product.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-stone-300 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-6 border-t border-stone-100 bg-stone-50/50 space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-stone-500 font-medium">Subtotal</span>
                <span className="text-xl font-bold text-stone-900">
                  {sym}
                  {cartTotal.toFixed(2)}
                </span>
              </div>
              <p className="text-[10px] text-stone-400 leading-normal">
                Shipping and taxes are calculated at checkout. Click checkout to simulate order.
              </p>
              <Button
                onClick={() => {
                  toast.success("Order simulated successfully! Cart cleared.");
                  setCart([]);
                  setIsCartOpen(false);
                }}
                className="w-full rounded-full py-6 font-semibold text-white tracking-wide transition-all shadow-md active:scale-[0.98]"
                style={{ background: config.primaryColor }}
              >
                Proceed to Simulated Checkout
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Product Details Modal */}
      <Dialog
        open={selectedProduct !== null}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
      >
        <DialogContent className="max-w-2xl overflow-hidden rounded-2xl bg-white p-0 md:flex z-[100] gap-0">
          {selectedProduct && (
            <>
              <DialogTitle className="sr-only">{selectedProduct.name}</DialogTitle>
              <DialogDescription className="sr-only">
                Product details for {selectedProduct.name}
              </DialogDescription>
              <div className="w-full md:w-1/2 aspect-[4/5] bg-stone-50 overflow-hidden relative shrink-0">
                {selectedProduct.image ? (
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-stone-300 font-serif">
                    No Image
                  </div>
                )}
                {adapt.showBadge && (
                  <span className="absolute left-4 top-4 rounded-full bg-black/80 px-2.5 py-1 text-[10px] font-semibold tracking-widest text-white">
                    {adapt.badgeLabel}
                  </span>
                )}
              </div>
              <div
                className="w-full md:w-1/2 p-6 flex flex-col justify-between"
                style={{ fontFamily: adapt.bodyFont }}
              >
                <div>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold">
                      {selectedProduct.category || config.category}
                    </span>
                    <span className="text-lg font-bold text-stone-900">
                      {sym}
                      {selectedProduct.price}
                    </span>
                  </div>
                  <h2
                    className="mt-2 text-2xl font-semibold leading-tight text-stone-950"
                    style={{ fontFamily: adapt.headingFont, fontWeight: adapt.headingWeight }}
                  >
                    {selectedProduct.name}
                  </h2>
                  <p className="mt-4 text-sm text-stone-500 leading-relaxed max-h-[160px] overflow-y-auto">
                    {selectedProduct.description ||
                      `${selectedProduct.name} - A premium selection from our catalog, crafted with care and designed to fit perfectly in your collection.`}
                  </p>
                </div>
                <div className="mt-6">
                  <Button
                    onClick={() => {
                      addToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="w-full rounded-full py-6 font-semibold text-white tracking-wide transition-all shadow-md active:scale-[0.98] cursor-pointer"
                    style={{ background: config.primaryColor }}
                  >
                    Add to Bag
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

type TplProps = {
  config: StoreConfig;
  adapt: CategoryAdapt;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  filteredProducts: Product[];
  cartCount: number;
  onOpenCart: () => void;
  onSelectProduct: (p: Product) => void;
};

// Shared adaptive product card.
function ProductCard({
  product,
  adapt,
  sym,
  variant = "default",
  onClick,
}: {
  product: Product;
  adapt: CategoryAdapt;
  sym: string;
  variant?: "default" | "compact" | "wide";
  onClick: () => void;
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
    <div
      onClick={onClick}
      className={`${frame} ${adapt.productRadius} relative overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}
    >
      <div
        className={`${adapt.productAspect} overflow-hidden ${adapt.productRadius} bg-stone-100 relative`}
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-stone-300 font-serif text-sm">
            No Image
          </div>
        )}
        {adapt.showBadge && (
          <span className="absolute left-3 top-3 rounded-full bg-black/80 px-2 py-0.5 text-[9px] font-semibold tracking-widest text-white">
            {adapt.badgeLabel}
          </span>
        )}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
      <div
        className={`mt-2 flex ${
          variant === "wide" ? "flex-col" : "items-baseline justify-between"
        } gap-1 text-xs`}
      >
        <span className="truncate font-medium group-hover:text-black transition-colors">
          {product.name}
        </span>
        <span className="text-black/50 font-semibold">
          {sym}
          {product.price}
        </span>
      </div>
    </div>
  );
}

// ---------- Luxury / Editorial ----------
function LuxuryTemplate({
  config,
  adapt,
  activeCategory,
  setActiveCategory,
  filteredProducts,
  cartCount,
  onOpenCart,
  onSelectProduct,
}: TplProps) {
  const sym = currencySymbol(config.currency);
  const headingStyle = {
    fontFamily: adapt.headingFont,
    fontWeight: adapt.headingWeight,
  } as const;

  return (
    <div style={{ background: "#ffffff", color: config.primaryColor }}>
      <nav className="flex items-center justify-between border-b border-black/5 px-8 py-6">
        <span className={`text-xl ${adapt.headingTracking}`} style={headingStyle}>
          {config.name.toUpperCase() || "MAISON"}
        </span>
        <div className="hidden gap-6 text-[10px] font-semibold tracking-[0.2em] sm:flex items-center">
          {adapt.navLinks.slice(0, 3).map((l) => (
            <span key={l} className="cursor-pointer hover:opacity-75 transition-opacity">
              {l.toUpperCase()}
            </span>
          ))}
          <button
            onClick={onOpenCart}
            className="cursor-pointer hover:opacity-75 transition-opacity font-semibold flex items-center gap-1.5 uppercase"
          >
            Cart ({cartCount})
          </button>
        </div>
        <button
          onClick={onOpenCart}
          className="sm:hidden cursor-pointer relative hover:opacity-75 transition-opacity"
        >
          <ShoppingBag className="h-4 w-4" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[8px] font-bold rounded-full size-3.5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </nav>

      <section
        className={`${adapt.heroPadding} ${adapt.heroAlign === "center" ? "text-center" : ""}`}
      >
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
          className="mt-8 rounded-full px-6 py-2.5 text-xs font-semibold tracking-widest cursor-pointer"
          style={{ background: config.primaryColor, color: "#fff" }}
        >
          {adapt.ctaLabel.toUpperCase()}
        </button>
      </section>

      <section className="px-8 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/5 mb-8">
        <p className="eyebrow" style={{ color: config.secondaryColor }}>
          {adapt.sectionLabel}
        </p>
        <div className="flex flex-wrap gap-4 text-[10px] tracking-[0.2em] font-semibold">
          {["All", ...config.productCategories].map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`cursor-pointer transition-colors uppercase ${
                activeCategory === c
                  ? "text-black border-b border-blackpb-0.5"
                  : "text-black/40 hover:text-black"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {filteredProducts.length === 0 ? (
        <div className="px-8 py-16 text-center text-sm text-black/40 font-serif italic">
          No products found in this category.
        </div>
      ) : (
        <section className={`grid gap-6 px-8 pb-12 ${adapt.productGridCols}`}>
          {filteredProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              adapt={adapt}
              sym={sym}
              onClick={() => onSelectProduct(p)}
            />
          ))}
        </section>
      )}

      <footer className="border-t border-black/5 px-8 py-8 text-[10px] tracking-widest text-black/40">
        © {config.name || "Maison"} · {config.contactEmail || "hello@maison.co"}
      </footer>
    </div>
  );
}

// ---------- Minimal / Blanc ----------
function MinimalTemplate({
  config,
  adapt,
  activeCategory,
  setActiveCategory,
  filteredProducts,
  cartCount,
  onOpenCart,
  onSelectProduct,
}: TplProps) {
  const sym = currencySymbol(config.currency);
  const headingStyle = {
    fontFamily: adapt.headingFont,
    fontWeight: adapt.headingWeight,
  } as const;

  return (
    <div className="bg-white text-black">
      <nav className="flex items-center justify-between px-6 py-5">
        <span className="text-sm font-semibold tracking-tight">{config.name || "Blanc"}</span>
        <div className="hidden gap-5 text-xs text-black/60 sm:flex items-center">
          {adapt.navLinks.slice(0, 3).map((l) => (
            <span key={l} className="cursor-pointer hover:text-black transition-colors">
              {l}
            </span>
          ))}
          <button
            onClick={onOpenCart}
            className="cursor-pointer hover:text-black transition-colors font-medium"
          >
            Cart ({cartCount})
          </button>
        </div>
        <button
          onClick={onOpenCart}
          className="sm:hidden cursor-pointer relative hover:opacity-75 transition-opacity"
        >
          <ShoppingBag className="h-4 w-4" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[8px] font-bold rounded-full size-3.5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
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
            className={`mt-8 w-fit cursor-pointer ${
              adapt.productRadius === "rounded-full"
                ? "rounded-full px-5 py-2 text-white"
                : "rounded-none border-b-2 pb-1"
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
        <div
          className={`${adapt.productAspect} overflow-hidden bg-stone-100 ${adapt.productRadius}`}
        >
          {config.products[0]?.image && (
            <img src={config.products[0].image} alt="" className="h-full w-full object-cover" />
          )}
        </div>
      </section>

      <section className="px-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className={`text-lg ${adapt.headingTracking}`} style={headingStyle}>
          {adapt.sectionLabel}
        </h2>
        <div className="flex flex-wrap gap-2">
          {["All", ...config.productCategories].map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`text-[9px] tracking-widest uppercase border px-3 py-1 transition-all cursor-pointer ${
                activeCategory === c
                  ? "border-black bg-black text-white"
                  : "border-black/10 hover:border-black/35 hover:bg-black/[0.02] text-black/60 hover:text-black"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {filteredProducts.length === 0 ? (
        <div className="px-6 py-16 text-center text-sm text-black/40">
          No products found in this category.
        </div>
      ) : (
        <section className={`grid gap-4 px-6 pb-12 ${adapt.productGridCols}`}>
          {filteredProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              adapt={adapt}
              sym={sym}
              onClick={() => onSelectProduct(p)}
            />
          ))}
        </section>
      )}
    </div>
  );
}

// ---------- Modern / Kinetic ----------
function ModernTemplate({
  config,
  adapt,
  activeCategory,
  setActiveCategory,
  filteredProducts,
  cartCount,
  onOpenCart,
  onSelectProduct,
}: TplProps) {
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
        <div className="hidden gap-5 text-xs font-semibold sm:flex items-center">
          {adapt.navLinks.slice(0, 3).map((l) => (
            <span key={l} className="cursor-pointer hover:opacity-85 transition-opacity">
              {l}
            </span>
          ))}
          <button
            onClick={onOpenCart}
            className="cursor-pointer hover:opacity-85 transition-opacity font-bold"
          >
            Cart ({cartCount})
          </button>
        </div>
        <button
          onClick={onOpenCart}
          className="sm:hidden cursor-pointer relative hover:opacity-75 transition-opacity"
        >
          <ShoppingBag className="h-4 w-4" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-white text-black text-[8px] font-bold rounded-full size-3.5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
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
        <div className={`mt-8 flex gap-3 ${adapt.heroAlign === "center" ? "justify-center" : ""}`}>
          <button
            className="rounded-full px-6 py-3 text-sm font-semibold cursor-pointer"
            style={{ background: config.primaryColor, color: "#fff" }}
          >
            {adapt.ctaLabel}
          </button>
          <button className="rounded-full border border-black/20 px-6 py-3 text-sm font-semibold cursor-pointer">
            Learn more
          </button>
        </div>
      </section>

      <section className="px-6 py-10">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className={`text-2xl ${adapt.headingTracking}`} style={headingStyle}>
            {adapt.sectionLabel}
          </h2>
          <div className="flex flex-wrap gap-2">
            {["All", ...config.productCategories].map((c) => {
              const active = activeCategory === c;
              return (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? "text-white shadow-sm"
                      : "bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900"
                  }`}
                  style={active ? { background: config.primaryColor } : undefined}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-sm text-black/40">
            No products found in this category.
          </div>
        ) : (
          <div className={`grid gap-4 ${adapt.productGridCols}`}>
            {filteredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                adapt={adapt}
                sym={sym}
                onClick={() => onSelectProduct(p)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ---------- Marketplace / Bazaar ----------
function MarketplaceTemplate({
  config,
  adapt,
  activeCategory,
  setActiveCategory,
  filteredProducts,
  cartCount,
  onOpenCart,
  onSelectProduct,
}: TplProps) {
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
        <div className="flex items-center gap-4 text-xs">
          <span className="text-black/60 hover:text-black cursor-pointer hidden sm:inline">
            Sign in
          </span>
          <button
            onClick={onOpenCart}
            className="flex items-center gap-1.5 font-medium hover:opacity-85 cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Cart ({cartCount})</span>
          </button>
        </div>
      </nav>

      <div className="flex gap-4 overflow-x-auto border-b border-black/5 bg-white px-6 py-2 text-xs">
        {[
          "All",
          ...(config.productCategories.length ? config.productCategories : adapt.navLinks),
        ].map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`whitespace-nowrap font-medium transition-colors cursor-pointer ${
              activeCategory === c
                ? "text-ink border-b-2 border-ink pb-2"
                : "text-black/50 hover:text-black"
            }`}
          >
            {c}
          </button>
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
          <button className="mt-5 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/30 cursor-pointer">
            {adapt.ctaLabel}
          </button>
        </div>
        <div
          className={`col-span-3 hidden p-8 md:col-span-1 md:block ${adapt.productRadius}`}
          style={{ background: config.secondaryColor, color: "#fff" }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest">{adapt.sectionLabel}</p>
          <p className="mt-2 text-2xl" style={headingStyle}>
            {config.name || "Studio 03"}
          </p>
        </div>
      </section>

      <section className="px-6 pb-10">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className={`text-lg ${adapt.headingTracking}`} style={headingStyle}>
            {adapt.sectionLabel}
          </h2>
          <span className="text-xs text-black/50">Sort ↓</span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-sm text-black/40">
            No products found in this category.
          </div>
        ) : (
          <div className={`grid gap-3 ${adapt.productGridCols}`}>
            {filteredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                adapt={adapt}
                sym={sym}
                onClick={() => onSelectProduct(p)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
