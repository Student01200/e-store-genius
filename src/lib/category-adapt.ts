// Category-adaptive styling tokens. Each template reads these to shift
// typography, spacing, section labels, and product card treatment so the
// same template feels tailored per industry.

export type CategoryKey =
  | "Fashion"
  | "Electronics"
  | "Beauty"
  | "Food"
  | "Furniture"
  | "Jewelry"
  | "Services"
  | "Home"
  | "Default";

export interface CategoryAdapt {
  // Typography
  headingFont: string; // css font-family stack
  bodyFont: string;
  headingWeight: number;
  headingTracking: string; // tailwind tracking class value
  headingCase: "normal" | "uppercase";
  // Layout
  heroPadding: string; // tailwind padding classes
  heroAlign: "left" | "center";
  productGridCols: string; // tailwind grid-cols classes for product grid
  productAspect: string; // tailwind aspect ratio class
  productRadius: string; // tailwind rounded class
  cardStyle: "flat" | "framed" | "shadow" | "tile";
  // Copy
  ctaLabel: string;
  sectionLabel: string;
  eyebrowSuffix: string;
  navLinks: string[];
  // Accents
  surfaceTint: string; // hex or rgba background for secondary surfaces
  showBadge: boolean;
  badgeLabel: string;
}

const MAP: Record<CategoryKey, CategoryAdapt> = {
  Fashion: {
    headingFont: `"Playfair Display", Georgia, serif`,
    bodyFont: `"Inter", system-ui, sans-serif`,
    headingWeight: 500,
    headingTracking: "tracking-tight",
    headingCase: "normal",
    heroPadding: "px-8 py-20",
    heroAlign: "left",
    productGridCols: "grid-cols-2 md:grid-cols-4",
    productAspect: "aspect-[3/4]",
    productRadius: "rounded-none",
    cardStyle: "flat",
    ctaLabel: "Shop the collection",
    sectionLabel: "New arrivals",
    eyebrowSuffix: "Lookbook · SS",
    navLinks: ["Women", "Men", "Lookbook", "Journal"],
    surfaceTint: "#f5f1ec",
    showBadge: true,
    badgeLabel: "NEW",
  },
  Electronics: {
    headingFont: `"Inter", system-ui, sans-serif`,
    bodyFont: `"Inter", system-ui, sans-serif`,
    headingWeight: 800,
    headingTracking: "tracking-tighter",
    headingCase: "normal",
    heroPadding: "px-8 py-16",
    heroAlign: "left",
    productGridCols: "grid-cols-2 md:grid-cols-3",
    productAspect: "aspect-square",
    productRadius: "rounded-2xl",
    cardStyle: "tile",
    ctaLabel: "Buy now",
    sectionLabel: "Featured tech",
    eyebrowSuffix: "New release",
    navLinks: ["Audio", "Wearables", "Accessories", "Support"],
    surfaceTint: "#0f172a10",
    showBadge: true,
    badgeLabel: "IN STOCK",
  },
  Beauty: {
    headingFont: `"Cormorant Garamond", "Playfair Display", serif`,
    bodyFont: `"Inter", system-ui, sans-serif`,
    headingWeight: 400,
    headingTracking: "tracking-normal",
    headingCase: "normal",
    heroPadding: "px-8 py-20",
    heroAlign: "center",
    productGridCols: "grid-cols-2 md:grid-cols-3",
    productAspect: "aspect-[4/5]",
    productRadius: "rounded-full",
    cardStyle: "flat",
    ctaLabel: "Discover the ritual",
    sectionLabel: "Bestsellers",
    eyebrowSuffix: "Botanical",
    navLinks: ["Skin", "Fragrance", "Body", "Rituals"],
    surfaceTint: "#f7ecec",
    showBadge: false,
    badgeLabel: "",
  },
  Food: {
    headingFont: `"Fraunces", "Playfair Display", serif`,
    bodyFont: `"Inter", system-ui, sans-serif`,
    headingWeight: 700,
    headingTracking: "tracking-tight",
    headingCase: "normal",
    heroPadding: "px-8 py-14",
    heroAlign: "left",
    productGridCols: "grid-cols-2 md:grid-cols-3",
    productAspect: "aspect-[5/4]",
    productRadius: "rounded-xl",
    cardStyle: "shadow",
    ctaLabel: "Order today",
    sectionLabel: "On the menu",
    eyebrowSuffix: "Seasonal",
    navLinks: ["Menu", "Pantry", "Locations", "Reserve"],
    surfaceTint: "#fdf6e3",
    showBadge: true,
    badgeLabel: "FRESH",
  },
  Furniture: {
    headingFont: `"Inter", system-ui, sans-serif`,
    bodyFont: `"Inter", system-ui, sans-serif`,
    headingWeight: 500,
    headingTracking: "tracking-tight",
    headingCase: "normal",
    heroPadding: "px-8 py-24",
    heroAlign: "left",
    productGridCols: "grid-cols-1 md:grid-cols-3",
    productAspect: "aspect-[4/3]",
    productRadius: "rounded-lg",
    cardStyle: "framed",
    ctaLabel: "Shop the room",
    sectionLabel: "The collection",
    eyebrowSuffix: "Made to last",
    navLinks: ["Living", "Dining", "Bedroom", "Trade"],
    surfaceTint: "#efece6",
    showBadge: false,
    badgeLabel: "",
  },
  Jewelry: {
    headingFont: `"Cormorant Garamond", "Playfair Display", serif`,
    bodyFont: `"Inter", system-ui, sans-serif`,
    headingWeight: 300,
    headingTracking: "tracking-[0.02em]",
    headingCase: "normal",
    heroPadding: "px-8 py-24",
    heroAlign: "center",
    productGridCols: "grid-cols-2 md:grid-cols-4",
    productAspect: "aspect-square",
    productRadius: "rounded-none",
    cardStyle: "flat",
    ctaLabel: "View the pieces",
    sectionLabel: "Heirlooms",
    eyebrowSuffix: "Solid gold",
    navLinks: ["Rings", "Necklaces", "Earrings", "Bespoke"],
    surfaceTint: "#f4efe6",
    showBadge: false,
    badgeLabel: "",
  },
  Services: {
    headingFont: `"Inter", system-ui, sans-serif`,
    bodyFont: `"Inter", system-ui, sans-serif`,
    headingWeight: 700,
    headingTracking: "tracking-tight",
    headingCase: "normal",
    heroPadding: "px-8 py-16",
    heroAlign: "left",
    productGridCols: "grid-cols-1 md:grid-cols-3",
    productAspect: "aspect-[3/2]",
    productRadius: "rounded-xl",
    cardStyle: "framed",
    ctaLabel: "Book a consult",
    sectionLabel: "How we help",
    eyebrowSuffix: "Trusted since",
    navLinks: ["Services", "Case studies", "About", "Contact"],
    surfaceTint: "#eef2f6",
    showBadge: false,
    badgeLabel: "",
  },
  Home: {
    headingFont: `"Fraunces", "Playfair Display", serif`,
    bodyFont: `"Inter", system-ui, sans-serif`,
    headingWeight: 500,
    headingTracking: "tracking-tight",
    headingCase: "normal",
    heroPadding: "px-8 py-20",
    heroAlign: "left",
    productGridCols: "grid-cols-2 md:grid-cols-4",
    productAspect: "aspect-square",
    productRadius: "rounded-md",
    cardStyle: "flat",
    ctaLabel: "Shop the range",
    sectionLabel: "Objects we love",
    eyebrowSuffix: "Everyday",
    navLinks: ["Objects", "Textiles", "Scent", "Journal"],
    surfaceTint: "#f2efe9",
    showBadge: false,
    badgeLabel: "",
  },
  Default: {
    headingFont: `"Inter", system-ui, sans-serif`,
    bodyFont: `"Inter", system-ui, sans-serif`,
    headingWeight: 600,
    headingTracking: "tracking-tight",
    headingCase: "normal",
    heroPadding: "px-8 py-16",
    heroAlign: "left",
    productGridCols: "grid-cols-2 md:grid-cols-4",
    productAspect: "aspect-square",
    productRadius: "rounded-lg",
    cardStyle: "flat",
    ctaLabel: "Shop now",
    sectionLabel: "Featured",
    eyebrowSuffix: "New",
    navLinks: ["Shop", "About", "Journal", "Contact"],
    surfaceTint: "#f5f5f4",
    showBadge: false,
    badgeLabel: "",
  },
};

export function adaptFor(category: string): CategoryAdapt {
  return MAP[(category as CategoryKey) in MAP ? (category as CategoryKey) : "Default"];
}
