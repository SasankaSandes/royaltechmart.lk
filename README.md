# Novatek — Web App

Next.js 16 (App Router) storefront for Novatek Sri Lanka.  
Live at `novatek.lk` · Auto-deploys from `main` to Vercel.

## Dev

```bash
cd app
npm install
npm run dev        # http://localhost:3000
```

Requires `app/.env.local` with `DATABASE_URL` (Neon connection string).

## Key commands

```bash
npm run dev              # local dev server
npm run build            # production build check
npm run import-catalog   # import products from Excel (tsx scripts/import-catalog.ts)
tsx scripts/seed-admin.ts <username> <password> <name>   # create admin user
```

## Structure

See `CLAUDE.md` at repo root for full architecture, admin portal patterns, and guardrails.  
See `PROGRESS.md` in this folder for what's built and what's next.

## Admin

`/admin/login` — username `sasa`, password `novatek2024` (change after first login)

Sprint 1 (done): Auth, dashboard, product CRUD, banners  
Sprint 2 (next): Orders, invoices, COD tracking  
Full spec: `ADMIN_CONTEXT.md` at repo root
