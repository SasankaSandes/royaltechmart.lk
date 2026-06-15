-- Novatek Admin Portal — Sprint 2 migration (Orders & Invoices)
-- Run once against your Neon database. Safe to re-run (IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS orders (
  id              SERIAL PRIMARY KEY,
  ref             TEXT NOT NULL UNIQUE,    -- NVT-ORD-001 format
  customer_name   TEXT NOT NULL,
  customer_phone  TEXT NOT NULL,
  address         TEXT,                    -- street line
  city            TEXT,                    -- e.g. Colombo 02
  postal_code     TEXT,                    -- e.g. 00200
  delivery_method TEXT NOT NULL DEFAULT 'courier' CHECK (delivery_method IN ('self','courier')),
  courier_name    TEXT,
  tracking_number TEXT,                    -- courier AWB / tracking no.
  payment_type    TEXT NOT NULL DEFAULT 'cod' CHECK (payment_type IN ('cod','paid')),
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','returned')),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Added in Sprint 2.1 — safe for existing installs
ALTER TABLE orders ADD COLUMN IF NOT EXISTS city            TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS postal_code     TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;

CREATE TABLE IF NOT EXISTS order_items (
  id          SERIAL PRIMARY KEY,
  order_id    INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  INTEGER NOT NULL REFERENCES products(id),
  qty         INTEGER NOT NULL DEFAULT 1,
  unit_price  INTEGER NOT NULL
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_orders_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION set_orders_updated_at();
