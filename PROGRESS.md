# Novatek App — Progress Log
> Living status of the Novatek storefront (Next.js 16 App Router + Neon + Vercel).
> WhatsApp is the checkout — no cart, no payment.

_Last updated: 2026-06-13_

---

## Production

- **Live URL:** `novatek.lk` — also `rtm-app-one.vercel.app`
- **Vercel project:** `novatek` (team `sasankasandes-projects`)
- **Deploys:** auto on push to `main` via GitHub (`SasankaSandes/royaltechmart.lk`)
- **DB:** Neon Postgres — connection string in `app/.env.local` + Vercel env vars

---

## Done

### RTM → Novatek rebrand (`c7cceb7`)
- All "Royal Tech Mart" / "RTM" replaced with "Novatek" / "NVT"
- Item codes: `RTM-###` → `NVT-###`
- WhatsApp greeting: "Hi Novatek 👋"
- FB page: `facebook.com/novateksl`
- OG tags, meta titles, layout all updated

### Design system reskin (`f9b9045`)
- Fonts: **Funnel Display** + **Stack Sans Text** (replaced 3 Google fonts)
- Real `novatek-logo.svg` wordmark
- Near-monochrome palette; WhatsApp green kept for order CTAs
- Header, Footer, TrustStrip, ProductCard, hero, category cards all restyled
- 16-icon set in `public/icons/` + `components/Icons.tsx`

### Homepage (`f9b9045` + subsequent)
- Immersive carousel hero: 3 slides, arrows, dots, auto-advance
- Search bar fixed over bottom of hero
- Sections: Hero → Trending → Trust Strip → Categories → Social strip → Fresh arrivals
- Facebook + Instagram follow buttons in social strip

### Component library
- `components/ui/`: Button, Badge, Pill, SearchField, SectionHeader
- All inline buttons, badges, filter chips, search, section headers migrated to use them

### Infrastructure
- Vercel project renamed `rtm-app` → `novatek`
- Custom domain `novatek.lk` live and connected
- Favicons: `.ico`, `.svg`, apple-touch, android-chrome 192/512, `site.webmanifest`
- Server-only DB fix — Neon driver no longer leaks into client bundle

### Admin portal — Sprint 1 (2026-06-13)
- **Auth:** Named users with bcrypt passwords + roles (`owner`/`staff`)
- **Login:** `/admin/login` (username + password, 8h session cookie)
- **Dashboard:** `/admin` — stock summary cards, alerts, quick actions
- **Products list:** `/admin/products` — full table with stock badges
- **Add product:** `/admin/products/new` — all fields including specs, image, tone colours
- **Edit product:** `/admin/products/[id]` — extended with specs editor, category, image
- **Banners:** `/admin/banners` — add/edit/delete/toggle/reorder homepage carousel banners
- **HeroBanner:** now DB-driven; falls back to static slides if no banners in DB
- **New components:** `AdminShell`, `SpecsEditor`
- **New DB tables:** `admin_users`, `banners` — migration applied to Neon ✅
- **Admin credentials:** `sasa` / `novatek2024`

---

## Open / TODO

**Email:**  
`hello@novatek.lk` is not a real mailbox (`lib/catalog.ts` `EMAIL`). Set up domain mailbox or redirect.

**Image uploads:**  
Admin product/banner image field is URL/path only. For real file uploads → Vercel Blob Storage (future sprint).

**Admin password:**  
Change from default `novatek2024` after first login. Run `tsx scripts/seed-admin.ts` to update.

**Logo:**  
App uses the existing RTM-era wordmark SVG. A Novatek-specific logo redesign is pending.

---

## Next: Admin Sprint 2 — Orders & Invoices

See `ADMIN_CONTEXT.md` for full spec. Build:
- `orders` + `order_items` DB tables
- `/admin/orders` — list with status tabs
- `/admin/orders/new` — log order from WhatsApp
- `/admin/orders/[ref]` — detail + status update
- `/admin/orders/[ref]/receipt` — printable customer receipt
- `/admin/orders/[ref]/slip` — printable delivery slip
