-- Track which supplier fulfilled each order item
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS supplier_id INTEGER REFERENCES suppliers(id);
