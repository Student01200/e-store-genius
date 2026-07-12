# Atelier — AI-Powered E-Commerce Store Generator

Atelier is a SaaS platform that generates complete, customizable e-commerce storefronts from a short brief. Users describe their business, pick a template and brand colors, and Atelier composes a live storefront with hero, catalog, product cards, and contact sections — publishable at a shareable URL.

Built with **TanStack Start v1**, **React 19**, **Tailwind v4**, and **Lovable Cloud** (Supabase) for auth and data. AI copywriting runs through the **Lovable AI Gateway** (Google Gemini 2.5 Flash).

---

## Table of Contents

- [Overview](#overview)
- [Current Features](#current-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [AI Content Generation](#ai-content-generation)
- [Store Generator Workflow](#store-generator-workflow)
- [Public Storefronts](#public-storefronts)
- [Setup & Local Development](#setup--local-development)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Security](#security)
- [Roadmap](#roadmap-not-yet-implemented)

---

## Overview

**Business idea.** Small brands and independent creators need an online store fast, without hiring a designer or wrestling with a page builder. Atelier turns a one-paragraph business description into a full storefront: brand copy, product categories, sample catalog, layout, typography, and a live public URL — in minutes.

**How it differs from generic builders.** Templates are **category-adaptive**: the same template (Maison, Blanc, Kinetic, Bazaar) renders differently for Fashion vs. Electronics vs. Beauty — different typography, grid density, product-card treatment, section labels, and CTA copy — so stores don't look interchangeable.

---

## Current Features

**Implemented and shipping today:**

- 🔐 **Authentication** — Email/password + Google OAuth via Lovable Cloud.
- 🛡️ **Protected dashboard** — `/_authenticated/*` routes gated by session middleware.
- 🧙 **Multi-step generator wizard** — Identity → Style → Catalog → Contact.
- 🤖 **AI copywriter** — Generates tagline, hero headline, subheadline, product categories, and 4 sample products from the business brief (Lovable AI Gateway, Gemini 2.5 Flash, strict JSON).
- 🎨 **Four templates, category-adaptive:**
  - **Maison** — editorial luxury, serif-forward.
  - **Blanc** — minimal, white-space driven.
  - **Kinetic** — bold, product-first.
  - **Bazaar** — dense marketplace grids.
- 📱 **Live split-pane preview** — Desktop / tablet / mobile toggles update as you edit.
- 🗂️ **Store management dashboard** — List, edit, publish, and view your stores.
- 🌍 **Public storefronts** — Every published store gets a shareable `/s/:slug` URL, server-rendered with per-store SEO metadata (title, description, og:title, og:description, twitter:card).
- 💱 **Localization primitives** — 6 currencies (USD, EUR, GBP, JPY, AED, SAR) and 6 languages (en, fr, es, de, ar, ja) selectable per store.
- 🎨 **Boutique editorial design system** — Warm canvas, deep ink, Cormorant Garamond + Plus Jakarta Sans, custom Tailwind v4 tokens.

---

## Tech Stack

| Layer | Choice |
| --- | --- |
| Framework | TanStack Start v1 (React 19, SSR, file-based routing, server functions) |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 with custom theme tokens in `src/styles.css` |
| UI primitives | Radix UI + shadcn/ui patterns |
| Backend | Lovable Cloud (Supabase — Postgres, Auth, RLS) |
| AI | Lovable AI Gateway (`google/gemini-2.5-flash`) |
| Client state | React hooks + TanStack Query |
| Forms | React Hook Form + Zod |
| Notifications | Sonner |
| Runtime | Cloudflare Workers (via TanStack Start) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser (React 19)                                             │
│  ├── Marketing (/)                                              │
│  ├── Auth (/auth)                                               │
│  ├── Dashboard, Generator, Templates, Settings  (protected)     │
│  └── Public storefront  (/s/:slug, SSR)                         │
└──────────────┬──────────────────────────────┬───────────────────┘
               │ createServerFn RPC           │ direct Supabase JS
               ▼                              ▼
┌───────────────────────────────┐   ┌──────────────────────────┐
│ TanStack Start Server Functions│   │ Supabase (Lovable Cloud) │
│  ├── generateStoreContent      │──▶│  auth.users              │
│  │   → Lovable AI Gateway      │   │  public.stores (RLS)     │
│  └── getPublicStore(slug)      │   └──────────────────────────┘
└───────────────────────────────┘
```

- **Client → DB** for authenticated CRUD (RLS scopes rows by `auth.uid()`).
- **Server functions** for the AI call (keeps `LOVABLE_API_KEY` server-side) and for the public-store fetch (uses the anon-scoped SELECT policy).
- **SSR** renders `/s/:slug` with per-store `<head>` metadata for share previews.

---

## Folder Structure

```
src/
  assets/                       # Hero + product + template preview images
  components/
    app-sidebar.tsx             # Authenticated dashboard sidebar
    storefront-preview.tsx      # Renders the 4 templates, category-adaptive
    ui/                         # shadcn/ui primitives
  hooks/
  integrations/
    lovable/                    # Lovable Cloud OAuth helper
    supabase/                   # Auto-generated client, types, middleware
  lib/
    ai-generate.functions.ts    # createServerFn — AI copywriter
    public-store.functions.ts   # createServerFn — public store fetch
    category-adapt.ts           # Per-category style/copy tokens
    store-config.ts             # Types, defaults, templates, currencies
  routes/
    __root.tsx                  # HTML shell, fonts, global metadata
    index.tsx                   # Marketing landing
    auth.tsx                    # Sign in / sign up
    s.$slug.tsx                 # SSR public storefront
    _authenticated/
      route.tsx                 # Session gate
      dashboard.tsx             # My Stores grid
      generator.tsx             # Store wizard
      templates.tsx             # Template gallery
      settings.tsx              # Account settings
  styles.css                    # Design tokens + Tailwind v4 config
  router.tsx, server.ts, start.ts
supabase/
  migrations/                   # Schema + RLS
  config.toml
```

---

## Database Schema

Single table: **`public.stores`** — RLS enabled.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | `gen_random_uuid()` |
| `user_id` | uuid | Owner, references `auth.users` |
| `slug` | text | Unique, used for `/s/:slug` |
| `name`, `category`, `description`, `target_audience` | text | Identity |
| `design_style`, `template` | text | Visual system |
| `primary_color`, `secondary_color`, `logo_url` | text | Branding |
| `currency`, `language` | text | Localization |
| `tagline`, `hero_headline`, `hero_subheadline` | text | Marketing copy (AI-fillable) |
| `product_categories` | jsonb | `string[]` |
| `products` | jsonb | `Product[]` |
| `contact_email`, `contact_phone`, `contact_address` | text | Contact block |
| `social_instagram`, `social_twitter`, `social_facebook` | text | Social links |
| `status` | text | `draft` \| `published` |
| `created_at`, `updated_at` | timestamptz | `update_updated_at_column()` trigger |

**Row Level Security policies:**

- `Users manage own stores` — `auth.uid() = user_id` for all operations.
- `Anyone can view published stores` — `SELECT` for `anon` + `authenticated` when `status = 'published'`.

Explicit `GRANT`s are issued to `authenticated` (full CRUD), `anon` (SELECT), and `service_role`.

---

## Authentication

- **Provider:** Supabase Auth via Lovable Cloud.
- **Methods:** Email + password, Google OAuth (`@lovable.dev/cloud-auth-js`).
- **Session storage:** `localStorage` (auto-refresh enabled).
- **Route protection:** `src/routes/_authenticated/route.tsx` redirects unauthenticated users to `/auth` before any child loader runs.
- **Server-function auth:** `attachSupabaseAuth` middleware in `src/start.ts` forwards the bearer token to `createServerFn` calls that use `requireSupabaseAuth`.

---

## AI Content Generation

Server function: `src/lib/ai-generate.functions.ts` → `generateStoreContent`.

- **Provider:** Lovable AI Gateway, `google/gemini-2.5-flash`.
- **Input (Zod-validated):** name, category, description, target audience, design style, currency.
- **Output (strict JSON):** `tagline`, `heroHeadline`, `heroSubheadline`, `productCategories[]`, `products[]` (name, price, category).
- **Prompted for:** ≤ 8-word taglines, poetic 5–10-word hero headlines, currency-appropriate prices, exactly 3 categories and 4 products.
- **Error handling:** 429 → "AI is busy", 402 → "AI credits exhausted", other failures surface a generic message.
- **Trigger:** "Generate with AI" button on Step 1 of the wizard, once name + category + description are set.

The API key (`LOVABLE_API_KEY`) is read inside the handler and never reaches the client.

---

## Store Generator Workflow

Route: `/generator` (or `/generator?id=…` to edit).

1. **Identity** — Name, category, description, target audience, currency, language. Selecting a category applies **category defaults** (recommended template + starter copy). AI generation available here.
2. **Style** — Template pick (Maison / Blanc / Kinetic / Bazaar), design style, brand colors, optional logo URL.
3. **Catalog** — Product categories + products (name, price, category).
4. **Contact** — Email, phone, address, social links.

Throughout every step, a **split-pane live preview** renders `<StorefrontPreview>` with desktop / tablet / mobile toggles.

**Save behavior:**
- **Draft** — Persists to `stores` with `status = 'draft'`.
- **Publish** — Persists with `status = 'published'`, generates a unique slug (retrying with a random suffix on collision), and toasts the public URL with an "Open" action.

---

## Public Storefronts

Route: `/s/:slug` (SSR).

- Loader calls `getPublicStore({ slug })`, which queries `stores` scoped to `status = 'published'` using a server-side Supabase client with the publishable key.
- Returns `notFound()` if the store is missing or unpublished.
- Renders the selected template via `<StorefrontPreview>` in desktop layout.
- Per-store `<head>` metadata: `title`, `description`, `og:title`, `og:description`, `og:type`, `twitter:card` — populated from tagline / hero subheadline / description.
- Footer: "Powered by Atelier · Create your own store" linking home.

---

## Setup & Local Development

**Prerequisites:** [Bun](https://bun.sh/), a Lovable Cloud–enabled project (auto-provisions Supabase credentials).

```bash
bun install
bun run dev            # http://localhost:8080
bun run build          # production build
bun run build:dev      # dev-mode build (source maps)
bun run preview        # preview production build
bun run lint
bun run format
```

---

## Environment Variables

Managed automatically by Lovable Cloud — no manual setup required.

| Variable | Where | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | client + server | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | client + server | Anon/publishable key |
| `VITE_SUPABASE_PROJECT_ID` | client | Project identifier |
| `SUPABASE_URL` | server | Same URL, server-side reads |
| `SUPABASE_PUBLISHABLE_KEY` | server | Same key, server-side reads |
| `SUPABASE_SERVICE_ROLE_KEY` | server | Reserved for privileged admin ops |
| `LOVABLE_API_KEY` | server | Lovable AI Gateway auth |

---

## Deployment

- **Runtime:** Cloudflare Workers via the TanStack Start Vite plugin (`nodejs_compat` enabled).
- **Publish flow:** Use Lovable's built-in publish action. Preview URL is provisioned automatically; a custom domain can be attached from the workspace.
- No `entry-client.tsx` / `entry-server.tsx` needed — TanStack Start v1 handles SSR entry points internally.

---

## Security

Currently implemented:

- **Row Level Security** on `public.stores` — users only see and mutate their own rows; only `published` rows are visible anonymously.
- **Explicit GRANTs** per role (`anon`, `authenticated`, `service_role`) — no implicit PostgREST exposure.
- **Zod input validation** on every `createServerFn` handler.
- **Server-only secrets** — `LOVABLE_API_KEY` and service-role credentials are read inside handlers and never bundled to the client.
- **Auth-scoped API calls** — bearer token attached via `attachSupabaseAuth` middleware; publishable key on the client is safe by design.
- **Protected route boundary** — `_authenticated` layout redirects before child loaders execute.
- **SSR-safe error/notFound boundaries** on the public storefront route.

---

## Roadmap (Not Yet Implemented)

Explicitly **not** in the current codebase — noted here as candidates for future work:

- 🛒 **Real cart & checkout** — Storefronts today are marketing/catalog only; no add-to-cart, payments, or orders.
- 💳 **Payment integration** — Stripe / Paddle wiring, tax, invoicing.
- 📦 **Inventory & order management** — Stock levels, fulfillment, order history.
- 🖼️ **Media uploads** — Logo and product images are currently URLs only; no Supabase Storage bucket for user assets.
- 🏷️ **Custom domains per store** — Storefronts live at `/s/:slug`; no per-store domain mapping.
- 👤 **Full user profile** — Only auth session today; no avatar / display-name / preferences.
- ✉️ **Transactional email** — Order confirmations, password reset customization.
- 🌐 **Real i18n** — Language selector persists to config but UI strings aren't translated.
- 📊 **Store analytics** — Views, conversions, best-selling products per store.
- 🧩 **More templates & sections** — Blog, FAQ, testimonials, lookbook, size guides.
- 🤝 **Team / multi-seat** — Sharing a store across collaborators.
- 🔍 **SEO tooling per store** — Sitemap, canonical URLs, structured product data (JSON-LD).
- 🧪 **Automated tests** — No test suite is set up yet.

---

## License

Proprietary — portfolio / demo project.
