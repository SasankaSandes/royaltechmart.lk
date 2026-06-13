-- Novatek Admin Portal — migration
-- Run once against your Neon database.

-- Named admin users (replaces single shared password)
CREATE TABLE IF NOT EXISTS admin_users (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,               -- bcrypt hash
  role          TEXT NOT NULL DEFAULT 'staff'
                CHECK (role IN ('owner','staff')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Homepage hero banners
CREATE TABLE IF NOT EXISTS banners (
  id          SERIAL PRIMARY KEY,
  eyebrow     TEXT,
  title       TEXT NOT NULL,
  subtitle    TEXT,
  cta_text    TEXT NOT NULL DEFAULT 'Shop Now',
  cta_url     TEXT NOT NULL DEFAULT '/shop',
  bg_from     TEXT NOT NULL DEFAULT '#19191a',
  bg_to       TEXT NOT NULL DEFAULT '#2d2e2f',
  active      BOOLEAN NOT NULL DEFAULT true,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed 3 default banners (skip if any already exist)
INSERT INTO banners (eyebrow, title, subtitle, cta_text, cta_url, bg_from, bg_to, sort_order)
SELECT * FROM (VALUES
  ('Sri Lanka''s tech accessories store', 'Tech accessories, delivered across Sri Lanka', 'Pay on delivery · Island-wide', 'Shop Now', '/shop', '#19191a', '#2d2e2f', 0),
  ('Everyday essentials', 'Earbuds, chargers, power banks & cables', 'Warranty-backed · Fair prices', 'Shop Now', '/shop', '#2d2e2f', '#555658', 1),
  ('Just in', 'New arrivals, every week', 'Follow us for the latest drops', 'View New', '/shop?sort=new', '#19191a', '#3a3b3d', 2)
) AS v(eyebrow, title, subtitle, cta_text, cta_url, bg_from, bg_to, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM banners LIMIT 1);
