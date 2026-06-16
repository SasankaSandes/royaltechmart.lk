/**
 * Applies the Sprint 3 (Suppliers & Sales) migration to Neon.
 * Usage: npm run migrate-suppliers
 *
 * Reads DATABASE_URL from .env.local (or the environment). Idempotent —
 * uses CREATE TABLE / ADD COLUMN IF NOT EXISTS, so it is safe to re-run.
 * db/suppliers-migration.sql is the canonical source-of-truth artifact.
 */

import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

if (!process.env.DATABASE_URL) {
  const envPath = path.join(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    }
  }
}

if (!process.env.DATABASE_URL) {
  console.error('✗ DATABASE_URL not set (checked environment and .env.local).');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  await sql`
    CREATE TABLE IF NOT EXISTS suppliers (
      id          SERIAL PRIMARY KEY,
      name        TEXT NOT NULL,
      phone       TEXT,
      whatsapp    TEXT,
      email       TEXT,
      address     TEXT,
      notes       TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log('✓ suppliers table ready');

  await sql`
    CREATE TABLE IF NOT EXISTS supplier_products (
      supplier_id           INTEGER NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
      product_id            INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      supplier_product_code TEXT,
      cost_price            INTEGER NOT NULL,
      PRIMARY KEY (supplier_id, product_id)
    )
  `;
  console.log('✓ supplier_products table ready');

  await sql`
    CREATE TABLE IF NOT EXISTS supplier_purchases (
      id          SERIAL PRIMARY KEY,
      supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
      date        DATE NOT NULL DEFAULT CURRENT_DATE,
      total       INTEGER NOT NULL,
      notes       TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log('✓ supplier_purchases table ready');

  await sql`
    CREATE TABLE IF NOT EXISTS supplier_purchase_items (
      id          SERIAL PRIMARY KEY,
      purchase_id INTEGER NOT NULL REFERENCES supplier_purchases(id) ON DELETE CASCADE,
      product_id  INTEGER NOT NULL REFERENCES products(id),
      qty         INTEGER NOT NULL,
      unit_cost   INTEGER NOT NULL
    )
  `;
  console.log('✓ supplier_purchase_items table ready');

  await sql`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_cost INTEGER`;
  console.log('✓ order_items.unit_cost column ready');

  console.log('✓ Sprint 3 migration complete.');
}

migrate().catch((err) => {
  console.error('✗ Migration failed:', err);
  process.exit(1);
});
