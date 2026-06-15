/**
 * Applies the Sprint 2 (Orders & Invoices) migration to Neon.
 * Usage: npm run migrate-orders
 *
 * Reads DATABASE_URL from .env.local (or the environment). Idempotent —
 * uses CREATE TABLE IF NOT EXISTS, so it is safe to re-run.
 *
 * The neon HTTP driver does not run multi-statement strings in one call, so
 * each DDL statement is issued separately. db/orders-migration.sql is the
 * canonical source-of-truth artifact; keep the two in sync.
 */

import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

// Load DATABASE_URL from .env.local if it isn't already in the environment.
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
    CREATE TABLE IF NOT EXISTS orders (
      id              SERIAL PRIMARY KEY,
      ref             TEXT NOT NULL UNIQUE,
      customer_name   TEXT NOT NULL,
      customer_phone  TEXT NOT NULL,
      address         TEXT,
      delivery_method TEXT NOT NULL DEFAULT 'courier' CHECK (delivery_method IN ('self','courier')),
      courier_name    TEXT,
      payment_type    TEXT NOT NULL DEFAULT 'cod' CHECK (payment_type IN ('cod','paid')),
      status          TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','returned')),
      notes           TEXT,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log('✓ orders table ready');

  await sql`
    CREATE TABLE IF NOT EXISTS order_items (
      id          SERIAL PRIMARY KEY,
      order_id    INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id  INTEGER NOT NULL REFERENCES products(id),
      qty         INTEGER NOT NULL DEFAULT 1,
      unit_price  INTEGER NOT NULL
    )
  `;
  console.log('✓ order_items table ready');

  // Sprint 2.1 columns — additive, safe on existing installs.
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS city            TEXT`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS postal_code     TEXT`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT`;
  console.log('✓ city / postal_code / tracking_number columns ready');

  await sql`
    CREATE OR REPLACE FUNCTION set_orders_updated_at()
    RETURNS TRIGGER LANGUAGE plpgsql AS $$
    BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
    $$
  `;
  await sql`DROP TRIGGER IF EXISTS orders_updated_at ON orders`;
  await sql`
    CREATE TRIGGER orders_updated_at
      BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION set_orders_updated_at()
  `;
  console.log('✓ updated_at trigger ready');

  console.log('✓ Sprint 2 migration complete.');
}

migrate().catch((err) => {
  console.error('✗ Migration failed:', err);
  process.exit(1);
});
