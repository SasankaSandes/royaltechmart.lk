-- Novatek Admin Portal — Sprint 3 migration (Suppliers & Sales)
-- Run once against your Neon database. Safe to re-run (IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS suppliers (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  phone       TEXT,
  whatsapp    TEXT,
  email       TEXT,
  address     TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supplier_products (
  supplier_id           INTEGER NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  product_id            INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  supplier_product_code TEXT,
  cost_price            INTEGER NOT NULL,
  PRIMARY KEY (supplier_id, product_id)
);

CREATE TABLE IF NOT EXISTS supplier_purchases (
  id          SERIAL PRIMARY KEY,
  supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  total       INTEGER NOT NULL,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supplier_purchase_items (
  id          SERIAL PRIMARY KEY,
  purchase_id INTEGER NOT NULL REFERENCES supplier_purchases(id) ON DELETE CASCADE,
  product_id  INTEGER NOT NULL REFERENCES products(id),
  qty         INTEGER NOT NULL,
  unit_cost   INTEGER NOT NULL
);

-- Per-line captured supplier cost on sales, for accurate margin.
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_cost INTEGER;
