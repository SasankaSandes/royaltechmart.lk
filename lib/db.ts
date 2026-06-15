import 'server-only';
import { neon } from '@neondatabase/serverless';
import type {
  Product, Category, StockStatus, Badge, Banner, AdminUser, AdminRole,
  Order, OrderItem, OrderStatus, DeliveryMethod, PaymentType,
} from './types';
import { slugify } from './catalog';

const sql = neon(process.env.DATABASE_URL!);

// ─── Products ─────────────────────────────────────────────────────────────────

function rowToProduct(r: Record<string, unknown>): Product {
  return {
    id:        r.id as number,
    name:      r.name as string,
    slug:      r.slug as string,
    category:  r.category as Category,
    price:     r.price as number,
    oldPrice:  (r.old_price ?? undefined) as number | undefined,
    badge:     (r.badge ?? undefined) as Badge | undefined,
    rating:    Number(r.rating),
    reviews:   r.reviews as number,
    stock:     r.stock as StockStatus,
    warranty:  r.warranty as string,
    short:     r.short as string,
    tone:      r.tone as [string, string],
    specs:     r.specs as [string, string][],
    image:     (r.image ?? undefined) as string | undefined,
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const rows = await sql`SELECT * FROM products ORDER BY id`;
  return rows.map(rowToProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const rows = await sql`SELECT * FROM products WHERE slug = ${slug} LIMIT 1`;
  return rows[0] ? rowToProduct(rows[0]) : undefined;
}

export async function getProductById(id: number): Promise<Product | undefined> {
  const rows = await sql`SELECT * FROM products WHERE id = ${id} LIMIT 1`;
  return rows[0] ? rowToProduct(rows[0]) : undefined;
}

export async function getProductsByCategory(category: Category): Promise<Product[]> {
  const rows = await sql`SELECT * FROM products WHERE category = ${category} ORDER BY id`;
  return rows.map(rowToProduct);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const rows = await sql`
    SELECT * FROM products
    WHERE category = ${product.category} AND id != ${product.id}
    ORDER BY id
    LIMIT ${limit}
  `;
  return rows.map(rowToProduct);
}

export async function getAllSlugs(): Promise<{ slug: string }[]> {
  const rows = await sql`SELECT slug FROM products`;
  return rows as { slug: string }[];
}

export async function getProductCount(): Promise<number> {
  const rows = await sql`SELECT COUNT(*) as count FROM products`;
  return Number(rows[0].count);
}

export async function getStockCounts(): Promise<{ in: number; low: number; out: number }> {
  const rows = await sql`
    SELECT stock, COUNT(*) as count FROM products GROUP BY stock
  `;
  const map: Record<string, number> = {};
  for (const r of rows) map[r.stock as string] = Number(r.count);
  return { in: map['in'] ?? 0, low: map['low'] ?? 0, out: map['out'] ?? 0 };
}

export async function createProduct(fields: {
  name: string;
  category: Category;
  price: number;
  oldPrice?: number | null;
  stock: StockStatus;
  badge?: Badge | null;
  warranty: string;
  short: string;
  image?: string | null;
  specs?: [string, string][];
  tone?: [string, string];
}): Promise<Product> {
  // Auto-assign next ID
  const idRows = await sql`SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM products`;
  const id = Number(idRows[0].next_id);
  const slug = slugify(fields.name);
  const tone = fields.tone ?? ['#FDEA0A', '#222222'];
  const specs = fields.specs ?? [];

  const rows = await sql`
    INSERT INTO products
      (id, name, slug, category, price, old_price, stock, badge, warranty, short, image, specs, tone)
    VALUES
      (${id}, ${fields.name}, ${slug}, ${fields.category}, ${fields.price},
       ${fields.oldPrice ?? null}, ${fields.stock}, ${fields.badge ?? null},
       ${fields.warranty}, ${fields.short}, ${fields.image ?? null},
       ${JSON.stringify(specs)}::jsonb, ARRAY[${tone[0]}, ${tone[1]}])
    RETURNING *
  `;
  return rowToProduct(rows[0]);
}

export async function updateProduct(id: number, fields: {
  name?: string;
  category?: Category;
  price?: number;
  oldPrice?: number | null;
  stock?: StockStatus;
  badge?: Badge | null;
  short?: string;
  warranty?: string;
  image?: string | null;
  specs?: [string, string][];
  tone?: [string, string];
}): Promise<Product> {
  const rows = await sql`
    UPDATE products SET
      name      = COALESCE(${fields.name ?? null}::text, name),
      category  = COALESCE(${fields.category ?? null}::text, category),
      price     = COALESCE(${fields.price ?? null}::int, price),
      old_price = ${fields.oldPrice !== undefined ? fields.oldPrice : null},
      stock     = COALESCE(${fields.stock ?? null}::text, stock),
      badge     = ${fields.badge !== undefined ? fields.badge : null},
      short     = COALESCE(${fields.short ?? null}::text, short),
      warranty  = COALESCE(${fields.warranty ?? null}::text, warranty),
      image     = ${fields.image !== undefined ? fields.image : null},
      specs     = COALESCE(${fields.specs ? JSON.stringify(fields.specs) : null}::jsonb, specs),
      tone      = COALESCE(${fields.tone ? `{${fields.tone[0]},${fields.tone[1]}}` : null}::text[], tone)
    WHERE id = ${id}
    RETURNING *
  `;
  return rowToProduct(rows[0]);
}

// ─── Banners ──────────────────────────────────────────────────────────────────

function rowToBanner(r: Record<string, unknown>): Banner {
  return {
    id:        r.id as number,
    eyebrow:   (r.eyebrow ?? undefined) as string | undefined,
    title:     r.title as string,
    subtitle:  (r.subtitle ?? undefined) as string | undefined,
    ctaText:   r.cta_text as string,
    ctaUrl:    r.cta_url as string,
    bgFrom:    r.bg_from as string,
    bgTo:      r.bg_to as string,
    active:    r.active as boolean,
    sortOrder: r.sort_order as number,
  };
}

export async function getActiveBanners(): Promise<Banner[]> {
  const rows = await sql`SELECT * FROM banners WHERE active = true ORDER BY sort_order`;
  return rows.map(rowToBanner);
}

export async function getAllBanners(): Promise<Banner[]> {
  const rows = await sql`SELECT * FROM banners ORDER BY sort_order`;
  return rows.map(rowToBanner);
}

export async function createBanner(fields: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  ctaText: string;
  ctaUrl: string;
  bgFrom: string;
  bgTo: string;
}): Promise<Banner> {
  const rows = await sql`
    INSERT INTO banners (eyebrow, title, subtitle, cta_text, cta_url, bg_from, bg_to, sort_order)
    SELECT ${fields.eyebrow ?? null}, ${fields.title}, ${fields.subtitle ?? null},
           ${fields.ctaText}, ${fields.ctaUrl}, ${fields.bgFrom}, ${fields.bgTo},
           COALESCE(MAX(sort_order) + 1, 0)
    FROM banners
    RETURNING *
  `;
  return rowToBanner(rows[0]);
}

export async function updateBanner(id: number, fields: Partial<{
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaUrl: string;
  bgFrom: string;
  bgTo: string;
  active: boolean;
}>): Promise<Banner> {
  const rows = await sql`
    UPDATE banners SET
      eyebrow  = COALESCE(${fields.eyebrow ?? null}::text, eyebrow),
      title    = COALESCE(${fields.title ?? null}::text, title),
      subtitle = COALESCE(${fields.subtitle ?? null}::text, subtitle),
      cta_text = COALESCE(${fields.ctaText ?? null}::text, cta_text),
      cta_url  = COALESCE(${fields.ctaUrl ?? null}::text, cta_url),
      bg_from  = COALESCE(${fields.bgFrom ?? null}::text, bg_from),
      bg_to    = COALESCE(${fields.bgTo ?? null}::text, bg_to),
      active   = COALESCE(${fields.active ?? null}::boolean, active)
    WHERE id = ${id}
    RETURNING *
  `;
  return rowToBanner(rows[0]);
}

export async function deleteBanner(id: number): Promise<void> {
  await sql`DELETE FROM banners WHERE id = ${id}`;
}

export async function moveBanner(id: number, direction: 'up' | 'down'): Promise<void> {
  // Swap sort_order with adjacent banner
  const rows = await sql`SELECT id, sort_order FROM banners ORDER BY sort_order`;
  const idx = rows.findIndex(r => r.id === id);
  if (idx === -1) return;
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= rows.length) return;
  const a = rows[idx], b = rows[swapIdx];
  await sql`UPDATE banners SET sort_order = ${b.sort_order as number} WHERE id = ${a.id as number}`;
  await sql`UPDATE banners SET sort_order = ${a.sort_order as number} WHERE id = ${b.id as number}`;
}

// ─── Admin Users ──────────────────────────────────────────────────────────────

function rowToAdminUser(r: Record<string, unknown>): AdminUser {
  return {
    id:        r.id as number,
    name:      r.name as string,
    username:  r.username as string,
    role:      r.role as AdminRole,
    createdAt: new Date(r.created_at as string),
  };
}

export async function getAdminUserByUsername(username: string): Promise<(AdminUser & { passwordHash: string }) | null> {
  const rows = await sql`SELECT * FROM admin_users WHERE username = ${username} LIMIT 1`;
  if (!rows[0]) return null;
  return { ...rowToAdminUser(rows[0]), passwordHash: rows[0].password_hash as string };
}

export async function getAdminUserById(id: number): Promise<(AdminUser & { passwordHash: string }) | null> {
  const rows = await sql`SELECT * FROM admin_users WHERE id = ${id} LIMIT 1`;
  if (!rows[0]) return null;
  return { ...rowToAdminUser(rows[0]), passwordHash: rows[0].password_hash as string };
}

export async function updateAdminPassword(id: number, passwordHash: string): Promise<void> {
  await sql`UPDATE admin_users SET password_hash = ${passwordHash} WHERE id = ${id}`;
}

export async function getAllAdminUsers(): Promise<AdminUser[]> {
  const rows = await sql`SELECT * FROM admin_users ORDER BY created_at`;
  return rows.map(rowToAdminUser);
}

export async function createAdminUser(fields: {
  name: string;
  username: string;
  passwordHash: string;
  role: AdminRole;
}): Promise<AdminUser> {
  const rows = await sql`
    INSERT INTO admin_users (name, username, password_hash, role)
    VALUES (${fields.name}, ${fields.username}, ${fields.passwordHash}, ${fields.role})
    RETURNING *
  `;
  return rowToAdminUser(rows[0]);
}

export async function deleteAdminUser(id: number): Promise<void> {
  await sql`DELETE FROM admin_users WHERE id = ${id}`;
}

// ─── Orders ─────────────────────────────────────────────────────────────────

function rowToOrderItem(r: Record<string, unknown>): OrderItem {
  return {
    id:        r.id as number,
    orderId:   r.order_id as number,
    productId: r.product_id as number,
    name:      (r.name ?? '(deleted product)') as string,
    qty:       r.qty as number,
    unitPrice: r.unit_price as number,
  };
}

function rowToOrder(r: Record<string, unknown>, items: OrderItem[] = []): Order {
  return {
    id:             r.id as number,
    ref:            r.ref as string,
    customerName:   r.customer_name as string,
    customerPhone:  r.customer_phone as string,
    address:        (r.address ?? undefined) as string | undefined,
    city:           (r.city ?? undefined) as string | undefined,
    postalCode:     (r.postal_code ?? undefined) as string | undefined,
    deliveryMethod: r.delivery_method as DeliveryMethod,
    courierName:    (r.courier_name ?? undefined) as string | undefined,
    trackingNumber: (r.tracking_number ?? undefined) as string | undefined,
    paymentType:    r.payment_type as PaymentType,
    status:         r.status as OrderStatus,
    notes:          (r.notes ?? undefined) as string | undefined,
    createdAt:      new Date(r.created_at as string),
    updatedAt:      new Date(r.updated_at as string),
    items,
    total:          items.reduce((sum, it) => sum + it.qty * it.unitPrice, 0),
  };
}

export async function createOrder(fields: {
  customerName: string;
  customerPhone: string;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  deliveryMethod: DeliveryMethod;
  courierName?: string | null;
  trackingNumber?: string | null;
  paymentType: PaymentType;
  notes?: string | null;
  items: { productId: number; qty: number; unitPrice: number }[];
}): Promise<Order> {
  // Generate next ref: NVT-ORD-001
  const refRows = await sql`
    SELECT 'NVT-ORD-' || LPAD((COUNT(*) + 1)::text, 3, '0') AS ref FROM orders
  `;
  const ref = refRows[0].ref as string;

  const orderRows = await sql`
    INSERT INTO orders
      (ref, customer_name, customer_phone, address, city, postal_code,
       delivery_method, courier_name, tracking_number, payment_type, notes)
    VALUES
      (${ref}, ${fields.customerName}, ${fields.customerPhone}, ${fields.address ?? null},
       ${fields.city ?? null}, ${fields.postalCode ?? null},
       ${fields.deliveryMethod}, ${fields.courierName ?? null}, ${fields.trackingNumber ?? null},
       ${fields.paymentType}, ${fields.notes ?? null})
    RETURNING *
  `;
  const orderId = orderRows[0].id as number;

  for (const item of fields.items) {
    await sql`
      INSERT INTO order_items (order_id, product_id, qty, unit_price)
      VALUES (${orderId}, ${item.productId}, ${item.qty}, ${item.unitPrice})
    `;
  }

  const created = await getOrderByRef(ref);
  return created!;
}

export async function getAllOrders(opts?: { status?: OrderStatus; q?: string }): Promise<(Order & { itemCount: number })[]> {
  const status = opts?.status ?? null;
  const q = opts?.q?.trim() ? `%${opts.q.trim()}%` : null;
  const rows = await sql`
    SELECT o.*,
           COALESCE(SUM(oi.qty * oi.unit_price), 0) AS total,
           COALESCE(SUM(oi.qty), 0)                 AS item_count
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE (${status}::text IS NULL OR o.status = ${status})
      AND (${q}::text IS NULL OR o.customer_name ILIKE ${q} OR o.customer_phone ILIKE ${q})
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `;
  return rows.map(r => ({
    ...rowToOrder(r),
    total: Number(r.total),
    items: [],
    itemCount: Number(r.item_count),
  })) as (Order & { itemCount: number })[];
}

export async function getOrderByRef(ref: string): Promise<Order | undefined> {
  const orderRows = await sql`SELECT * FROM orders WHERE ref = ${ref} LIMIT 1`;
  if (!orderRows[0]) return undefined;
  const itemRows = await sql`
    SELECT oi.*, p.name
    FROM order_items oi
    LEFT JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = ${orderRows[0].id as number}
    ORDER BY oi.id
  `;
  return rowToOrder(orderRows[0], itemRows.map(rowToOrderItem));
}

export async function updateOrderStatus(ref: string, status: OrderStatus): Promise<void> {
  await sql`UPDATE orders SET status = ${status} WHERE ref = ${ref}`;
}

export async function updateOrderDelivery(
  ref: string,
  fields: { courierName?: string | null; trackingNumber?: string | null },
): Promise<void> {
  await sql`
    UPDATE orders SET
      courier_name    = ${fields.courierName ?? null},
      tracking_number = ${fields.trackingNumber ?? null}
    WHERE ref = ${ref}
  `;
}

export async function getOrderStats(): Promise<{
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  total: number;
  codPendingValue: number;
}> {
  const statusRows = await sql`SELECT status, COUNT(*) AS count FROM orders GROUP BY status`;
  const map: Record<string, number> = {};
  let total = 0;
  for (const r of statusRows) {
    const c = Number(r.count);
    map[r.status as string] = c;
    total += c;
  }
  // COD still owed: COD orders that have shipped but aren't delivered/cancelled/returned.
  const codRows = await sql`
    SELECT COALESCE(SUM(oi.qty * oi.unit_price), 0) AS value
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    WHERE o.payment_type = 'cod' AND o.status = 'shipped'
  `;
  return {
    pending:    map['pending'] ?? 0,
    processing: map['processing'] ?? 0,
    shipped:    map['shipped'] ?? 0,
    delivered:  map['delivered'] ?? 0,
    total,
    codPendingValue: Number(codRows[0].value),
  };
}
