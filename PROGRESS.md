# Novatek App — Progress Log

> Living status of the Novatek storefront (Next.js App Router + Neon + Vercel).
> WhatsApp is the checkout — no cart, no payment. See CLAUDE.md / PROJECT.md for context.

_Last updated: 2026-06-13_

## Production
- **Live URL:** https://rtm-app-one.vercel.app (no custom domain attached yet)
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
- **Infra:** Vercel CLI updated; project renamed `rtm-app` → `novatek`; Git→Vercel integration wired.

## Open / TODO
**Needs real values (currently placeholders, marked `// TODO` in code):**
- Facebook page URL — placeholder `facebook.com/novatek` (`lib/catalog.ts` `FB_PAGE`)
- Email — placeholder `hello@novatek.lk` (`lib/catalog.ts` `EMAIL`)
- Domain — placeholder `novatek.lk` (`app/layout.tsx` metadataBase, `product/[slug]` SITE_URL)
- Attach a **custom domain** in Vercel (currently on `rtm-app-one.vercel.app`).
  Owned domains: `glomo.lk`, `betterdesigners.club`; no `novatek.lk` registered yet.

**Cleanups / nice-to-have:**
- Delete unused `public/rtm-logo.png` (replaced by the wordmark).
- Footer kept dark (vs. design system's light footer-with-watermark) — switch if desired.
- Real product photos for items currently showing neutral haze placeholders.
- Optionally extract a reusable `Button` component (styles currently inline).

## Untouched (working, out of scope so far)
Product catalog data, DB schema, admin panel logic, WhatsApp-as-checkout flow.
