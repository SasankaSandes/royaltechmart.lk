# Novatek App — Progress Log

> Living status of the Novatek storefront (Next.js App Router + Neon + Vercel).
> WhatsApp is the checkout — no cart, no payment. See CLAUDE.md / PROJECT.md for context.

_Last updated: 2026-06-13_

## Production
- **Live URL:** https://novatek.lk (custom domain connected in Vercel) — also reachable at rtm-app-one.vercel.app
- **Vercel project:** `novatek` (team `sasankasandes-projects`)
- **Deploys:** auto-deploy on push to `main` via GitHub integration
  (`SasankaSandes/royaltechmart.lk` → Vercel). No manual `vercel --prod` needed.
- **DB:** Neon Postgres (connection string in `app/.env.local`; same vars set in Vercel).

## Done (committed + deployed)
- **Server-only DB fix** (`87217fa`) — Neon driver was leaking into the client bundle and
  crashing the site ("This page couldn't load"). `lib/db.ts` now `import 'server-only'`;
  DB re-exports removed from `catalog.ts`; server pages import from `lib/db` directly.
- **Copy rewrite + RTM→Novatek rebrand** (`c7cceb7`) — removed all "100% Genuine" boasts
  (quality implied, not claimed); plain sentence-case copy; brand, meta, WhatsApp greeting
  ("Hi Novatek 👋"), and item codes (`RTM-###` → `NVT-###`) all rebranded.
- **Design-system reskin + icons** (`f9b9045`) — applied the Novatek Design System
  (near-monochrome, quiet-premium). Variable fonts **Funnel Display** + **Stack Sans Text**
  (replaced the 3 Google fonts); real **novatek-logo.svg** wordmark; dropped yellow but kept
  **WhatsApp green** for order CTAs; restyled Header/Footer/TrustStrip/ProductCard/hero/
  category cards/Facebook band/About. New 16-icon set in `public/icons/` + `components/Icons.tsx`
  (converted to `currentColor`; `headset` dropped).
- **Favicons** — full set in `public/` (`.ico`, `.svg`, apple-touch, android-chrome 192/512,
  `site.webmanifest`), wired via Next `metadata.icons` + `manifest` and `viewport.themeColor`
  (#F7F8FA). Removed the leftover create-next-app `app/favicon.ico`.
- **Infra:** Vercel CLI updated; project renamed `rtm-app` → `novatek`; Git→Vercel integration wired.
- **Shared component library** — ported the design system's primitives into the app under
  `components/ui/`: `Button` (primary/secondary/ghost/mist/whatsapp, polymorphic Link/anchor/button),
  `Badge`, `Pill`, `SearchField`, `SectionHeader`. Migrated all inline buttons, badges, shop
  filter chips, search box, and section headers to use them. Pure refactor — pixel-identical.
  (Deliberately kept the app's own `Icons.tsx` and feature-rich `ProductCard`; skipped DS
  `Icon`/`IconButton`/simple `ProductCard`.)

## Open / TODO
**Still a placeholder:**
- Email — `hello@novatek.lk` is not a real mailbox yet (`lib/catalog.ts` `EMAIL`). Set up a
  domain mailbox or repoint to a working address.

**Cleanups / nice-to-have:**
- Footer kept dark (vs. design system's light footer-with-watermark) — switch if desired.
- Real product photos for items currently showing neutral haze placeholders.

**Resolved this session:** custom domain `novatek.lk` live in Vercel; Facebook set to
`facebook.com/novateksl`; unused `public/rtm-logo.png` deleted.

## Untouched (working, out of scope so far)
Product catalog data, DB schema, admin panel logic, WhatsApp-as-checkout flow.
