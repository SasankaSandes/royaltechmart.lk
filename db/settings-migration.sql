CREATE TABLE IF NOT EXISTS site_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL DEFAULT '',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO site_settings (key, value) VALUES
  ('whatsapp_number', '94764834970'),
  ('fb_page',         'https://facebook.com/novateksl'),
  ('instagram',       'https://instagram.com/novatek.lk'),
  ('tiktok',          ''),
  ('phone',           '+94 76 483 4970'),
  ('email',           'hello@novatek.lk'),
  ('delivery_price',  ''),
  ('delivery_sla',    ''),
  ('order_message',   E'Hi Novatek \U0001F44B\n\nI''d like to order:\n• {name}\n• Price: {price}\n• Item code: {code}\n\nPlease share availability & delivery details.')
ON CONFLICT (key) DO NOTHING;
