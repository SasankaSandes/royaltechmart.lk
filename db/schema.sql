-- Royal Tech Mart — product catalog schema
-- Run once against your Neon database to initialise.
-- Re-run safely (IF NOT EXISTS / ON CONFLICT DO NOTHING).

CREATE TABLE IF NOT EXISTS products (
  id              INTEGER PRIMARY KEY,
  name            TEXT    NOT NULL,
  slug            TEXT    NOT NULL UNIQUE,
  category        TEXT    NOT NULL CHECK (category IN ('earbuds','chargers','powerbanks','holders','cables')),
  price           INTEGER NOT NULL,          -- LKR, whole numbers
  old_price       INTEGER,
  badge           TEXT    CHECK (badge IN ('Trending','Featured','New')),
  rating          NUMERIC(2,1) NOT NULL DEFAULT 4.5,
  reviews         INTEGER      NOT NULL DEFAULT 0,
  stock           TEXT    NOT NULL DEFAULT 'in' CHECK (stock IN ('in','low','out')),
  warranty        TEXT    NOT NULL DEFAULT '1 Year Warranty',
  short           TEXT    NOT NULL,
  tone            TEXT[2] NOT NULL DEFAULT ARRAY['#FDEA0A','#222222'],
  specs           JSONB   NOT NULL DEFAULT '[]',  -- [[key,value], ...]
  image           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
