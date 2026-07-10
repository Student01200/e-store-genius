# Atelier — AI-Powered E-Commerce Store Generator

Atelier is a boutique SaaS platform that lets users generate complete, customized e-commerce storefronts from a single dashboard. Instead of building stores manually, users describe their brand, choose a template, and Atelier composes a tailored website with homepage, catalog, product details, cart, checkout, FAQ, and contact sections.

---

## Features

- **Store Generator Dashboard** — A multi-step wizard for configuring identity, visual style, catalog, and contact details.
- **Live Split-Pane Preview** — See the storefront update in real time as you edit, with desktop / tablet / mobile device toggles.
- **Multiple Templates** — Four distinct storefront systems:
  - **Maison** — Editorial luxury, serif-forward.
  - **Blanc** — Minimal, white-space driven.
  - **Kinetic** — Modern, bold, product-first.
  - **Bazaar** — Marketplace-style, dense grids.
- **Category-Aware Defaults** — Selecting a business category (Fashion, Beauty, Food, Jewelry, Electronics, etc.) suggests copy, categories, and a recommended template.
- **Authentication** — Email/password and Google OAuth sign-in via Lovable Cloud.
- **Persistent Storage** — Generated stores are saved to a Postgres database with per-user RLS policies.
- **Store Management** — Dashboard to view, edit, duplicate, publish, and delete stores.
- **Responsive, Editorial UI** — Tailwind CSS v4 with warm, boutique design tokens; mobile, tablet, and desktop optimized.

---

## Tech Stack

- **Framework** — [TanStack Start v1](https://tanstack.com/start) (React 19, SSR/SSG, file-based routing, server functions)
- **Build Tool** — Vite 8
- **Styling** — Tailwind CSS v4 with custom CSS theme tokens
- **UI Components** — Radix UI primitives + shadcn/ui patterns
- **Backend / Auth / Database** — Lovable Cloud (Supabase under the hood)
- **Client State** — React hooks + TanStack Query
- **Forms / Validation** — React Hook Form + Zod
- **Notifications** — Sonner

---

## Project Structure

```text
src/
  assets/                   # Hero, product, and template preview images
  components/
    app-sidebar.tsx         # Authenticated dashboard sidebar
    storefront-preview.tsx  # Renders generated store templates
  integrations/
    lovable/                # Lovable Cloud auth helpers
    supabase/               # Supabase client, auth middleware, types
  lib/
    store-config.ts         # Store config types, defaults, currencies, categories
  routes/
    __root.tsx              # Root layout, fonts, global metadata
    index.tsx               # Marketing landing page
    auth.tsx                # Sign in / sign up page
    _authenticated/
      route.tsx             # Auth-protected layout
      dashboard.tsx         # My Stores grid
      generator.tsx         # Store generator wizard
      templates.tsx         # Template gallery
      settings.tsx          # User settings
  styles.css                # Global design tokens and Tailwind config
supabase/
  migrations/               # Database schema and RLS policies
```

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed
- Lovable Cloud enabled (provides `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, etc.)

### Install dependencies

```bash
bun install
```

### Run the development server

```bash
bun run dev
```

The app will be available at `http://localhost:8080`.

### Build for production

```bash
bun run build
```

---

## Database Schema

The main table is `public.stores`:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | References `auth.users` |
| `name` | Text | Store name |
| `category` | Text | Business category |
| `description` | Text | Short brand description |
| `target_audience` | Text | Audience description |
| `design_style` | Text | Visual style token |
| `template` | Text | Selected template ID |
| `primary_color` | Text | Brand primary color |
| `secondary_color` | Text | Brand secondary color |
| `logo_url` | Text | Optional logo URL |
| `currency` / `language` | Text | Localization settings |
| `tagline`, `hero_headline`, `hero_subheadline` | Text | Marketing copy |
| `product_categories` | JSONB | Array of category strings |
| `products` | JSONB | Array of product objects |
| `contact_email` / `contact_phone` / `contact_address` | Text | Contact info |
| `social_*` | Text | Social links |
| `status` | Text | `draft` or `published` |
| `created_at` / `updated_at` | TIMESTAMPTZ | Timestamps |

Row Level Security is enabled: users can only manage their own stores.

---

## Environment Variables

Managed automatically by Lovable Cloud:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_PROJECT_ID=
```

No manual Supabase credentials are required or exposed in this project.

---

## Authentication

- **Email / password** — handled via Supabase Auth.
- **Google OAuth** — configured through Lovable Cloud; redirect URI is the app origin.

Protected routes live under `/_authenticated/` and are guarded by `src/routes/_authenticated/route.tsx`.

---

## Key Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page with template showcase |
| `/auth` | Sign in / sign up |
| `/dashboard` | List of generated stores |
| `/generator` | Create or edit a store (`?id=` to edit existing) |
| `/templates` | Browse all templates |
| `/settings` | Account settings |

---

## Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start Vite dev server |
| `bun run build` | Production build |
| `bun run build:dev` | Development build |
| `bun run preview` | Preview production build |
| `bun run lint` | Run ESLint |
| `bun run format` | Format code with Prettier |

---

## Design Direction

The product follows a **"Boutique Editorial"** visual direction: warm neutral backgrounds, serif display type for headings, generous whitespace, subtle shadows, and an understated luxury palette (`ink`, `canvas`, `accent`, `stone-warm`).

---

## License

AI-powered SaaS platform for generating modern, customizable e-commerce websites with real-time preview and reusable templates
