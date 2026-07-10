export type DesignStyle = "luxury" | "minimal" | "modern" | "creative" | "professional";
export type TemplateId = "luxury" | "minimal" | "modern" | "marketplace";

export type BusinessCategory =
  | "Fashion"
  | "Electronics"
  | "Beauty"
  | "Food"
  | "Furniture"
  | "Jewelry"
  | "Services"
  | "Home";

export interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
}

export interface StoreConfig {
  id?: string;
  name: string;
  category: BusinessCategory | string;
  description: string;
  targetAudience: string;
  designStyle: DesignStyle;
  template: TemplateId;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  currency: string;
  language: string;
  tagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  productCategories: string[];
  products: Product[];
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  socialInstagram: string;
  socialTwitter: string;
  socialFacebook: string;
}

import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

export const SAMPLE_PRODUCTS: Product[] = [
  { id: "p1", name: "Sculptural Vase", price: 120, image: product1, category: "Objects" },
  { id: "p2", name: "Ember & Moss Candle", price: 45, image: product2, category: "Home Scent" },
  { id: "p3", name: "Washed Linen Throw", price: 88, image: product3, category: "Textiles" },
  { id: "p4", name: "Brass Incense Holder", price: 32, image: product4, category: "Objects" },
];

export const CURRENCIES = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "JPY", symbol: "¥" },
  { code: "AED", symbol: "د.إ" },
  { code: "SAR", symbol: "ر.س" },
];

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
  { code: "ar", label: "العربية" },
  { code: "ja", label: "日本語" },
];

export const CATEGORIES: BusinessCategory[] = [
  "Fashion",
  "Electronics",
  "Beauty",
  "Food",
  "Furniture",
  "Jewelry",
  "Services",
  "Home",
];

export const DESIGN_STYLES: { id: DesignStyle; label: string }[] = [
  { id: "luxury", label: "Luxury" },
  { id: "minimal", label: "Minimal" },
  { id: "modern", label: "Modern" },
  { id: "creative", label: "Creative" },
  { id: "professional", label: "Professional" },
];

export const TEMPLATES: {
  id: TemplateId;
  name: string;
  tagline: string;
  best: string;
}[] = [
  { id: "luxury", name: "Maison", tagline: "Editorial. Serif-forward. Slow reveal.", best: "Beauty, Jewelry, Fashion" },
  { id: "minimal", name: "Blanc", tagline: "White space, precise typography.", best: "Home, Furniture, Objects" },
  { id: "modern", name: "Kinetic", tagline: "Bold hero, product-first.", best: "Electronics, Fashion" },
  { id: "marketplace", name: "Bazaar", tagline: "Dense grids, category-driven.", best: "Food, Marketplaces, Services" },
];

export const currencySymbol = (code: string) =>
  CURRENCIES.find((c) => c.code === code)?.symbol ?? "$";

export function defaultStoreConfig(): StoreConfig {
  return {
    name: "",
    category: "Home",
    description: "",
    targetAudience: "",
    designStyle: "minimal",
    template: "luxury",
    primaryColor: "#1c1917",
    secondaryColor: "#7c6f5d",
    currency: "USD",
    language: "en",
    tagline: "",
    heroHeadline: "Curating the quiet moments of life.",
    heroSubheadline:
      "Our seasonal drop explores the intersection of architecture and organic form.",
    productCategories: ["Objects", "Textiles", "Home Scent"],
    products: SAMPLE_PRODUCTS,
    contactEmail: "",
    contactPhone: "",
    contactAddress: "",
    socialInstagram: "",
    socialTwitter: "",
    socialFacebook: "",
  };
}

// Category-adaptive default copy suggestions.
export function categoryDefaults(category: string): Partial<StoreConfig> {
  switch (category) {
    case "Electronics":
      return {
        heroHeadline: "Engineered for the way you move.",
        heroSubheadline: "Precision hardware, obsessively refined.",
        productCategories: ["Audio", "Wearables", "Accessories"],
        template: "modern",
      };
    case "Fashion":
      return {
        heroHeadline: "Wardrobes made to last.",
        heroSubheadline: "New arrivals from independent ateliers.",
        productCategories: ["Outerwear", "Knits", "Denim"],
        template: "modern",
      };
    case "Beauty":
      return {
        heroHeadline: "A ritual, not a routine.",
        heroSubheadline: "Botanical formulations from small-batch labs.",
        productCategories: ["Skin", "Fragrance", "Body"],
        template: "luxury",
      };
    case "Food":
      return {
        heroHeadline: "Cooked with intention.",
        heroSubheadline: "Seasonal menus from our kitchen to yours.",
        productCategories: ["Small Plates", "Mains", "Pantry"],
        template: "marketplace",
      };
    case "Jewelry":
      return {
        heroHeadline: "Heirlooms in the making.",
        heroSubheadline: "Solid metals. Ethical stones. Timeless forms.",
        productCategories: ["Rings", "Necklaces", "Earrings"],
        template: "luxury",
      };
    default:
      return {};
  }
}
