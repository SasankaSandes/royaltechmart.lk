import 'server-only';
import { neon } from '@neondatabase/serverless';
import type {
  Product, Category, StockStatus, Badge, Banner, AdminUser, AdminRole,
  Order, OrderItem, OrderStatus, DeliveryMethod, PaymentType,
  Supplier, SupplierProduct, SupplierPurchase, SupplierPurchaseItem,
  ProductSupplierInfo, SourcingItem,
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
    id:                r.id as number,
    orderId:           r.order_id as number,
    productId:         r.product_id as number,
    name:              (r.name ?? '(deleted product)') as string,
    qty:               r.qty as number,
    unitPrice:         r.unit_price as number,
    unitCost:          (r.unit_cost ?? undefined) as number | undefined,
    unitCostConfirmed: (r.unit_cost_confirmed ?? false) as boolean,
    invoiceRef:        (r.invoice_ref ?? undefined) as string | undefined,
    supplierId:        (r.supplier_id ?? undefined) as number | undefined,
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
  items: { productId: number; qty: number; unitPrice: number; unitCost?: number | null }[];
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
      INSERT INTO order_items (order_id, product_id, qty, unit_price, unit_cost)
      VALUES (${orderId}, ${item.productId}, ${item.qty}, ${item.unitPrice}, ${item.unitCost ?? null})
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

// ─── Suppliers ──────────────────────────────────────────────────────────────

function rowToSupplier(r: Record<string, unknown>): Supplier {
  return {
    id:        r.id as number,
    name:      r.name as string,
    phone:     (r.phone ?? undefined) as string | undefined,
    whatsapp:  (r.whatsapp ?? undefined) as string | undefined,
    email:     (r.email ?? undefined) as string | undefined,
    address:   (r.address ?? undefined) as string | undefined,
    notes:     (r.notes ?? undefined) as string | undefined,
    createdAt: new Date(r.created_at as string),
  };
}

export async function getAllSuppliers(): Promise<(Supplier & { productCount: number })[]> {
  const rows = await sql`
    SELECT s.*, COUNT(sp.product_id) AS product_count
    FROM suppliers s
    LEFT JOIN supplier_products sp ON sp.supplier_id = s.id
    GROUP BY s.id
    ORDER BY s.name
  `;
  return rows.map(r => ({ ...rowToSupplier(r), productCount: Number(r.product_count) }));
}

export async function getSupplierById(id: number): Promise<
  (Supplier & { products: SupplierProduct[]; purchases: SupplierPurchase[] }) | undefined
> {
  const rows = await sql`SELECT * FROM suppliers WHERE id = ${id} LIMIT 1`;
  if (!rows[0]) return undefined;

  const productRows = await sql`
    SELECT sp.*, p.name
    FROM supplier_products sp
    LEFT JOIN products p ON p.id = sp.product_id
    WHERE sp.supplier_id = ${id}
    ORDER BY p.name
  `;
  const products: SupplierProduct[] = productRows.map(r => ({
    supplierId:          r.supplier_id as number,
    productId:           r.product_id as number,
    supplierProductCode: (r.supplier_product_code ?? undefined) as string | undefined,
    costPrice:           r.cost_price as number,
    name:                (r.name ?? '(deleted product)') as string,
  }));

  const purchaseRows = await sql`
    SELECT * FROM supplier_purchases WHERE supplier_id = ${id} ORDER BY date DESC, id DESC
  `;
  const purchases: SupplierPurchase[] = [];
  for (const pr of purchaseRows) {
    const itemRows = await sql`
      SELECT spi.*, p.name
      FROM supplier_purchase_items spi
      LEFT JOIN products p ON p.id = spi.product_id
      WHERE spi.purchase_id = ${pr.id as number}
      ORDER BY spi.id
    `;
    purchases.push({
      id:        pr.id as number,
      supplierId: pr.supplier_id as number,
      date:      new Date(pr.date as string),
      total:     pr.total as number,
      notes:     (pr.notes ?? undefined) as string | undefined,
      createdAt: new Date(pr.created_at as string),
      items: itemRows.map(ir => ({
        id:        ir.id as number,
        purchaseId: ir.purchase_id as number,
        productId: ir.product_id as number,
        name:      (ir.name ?? '(deleted product)') as string,
        qty:       ir.qty as number,
        unitCost:  ir.unit_cost as number,
      })),
    });
  }

  return { ...rowToSupplier(rows[0]), products, purchases };
}

export async function createSupplier(fields: {
  name: string; phone?: string | null; whatsapp?: string | null;
  email?: string | null; address?: string | null; notes?: string | null;
}): Promise<Supplier> {
  const rows = await sql`
    INSERT INTO suppliers (name, phone, whatsapp, email, address, notes)
    VALUES (${fields.name}, ${fields.phone ?? null}, ${fields.whatsapp ?? null},
            ${fields.email ?? null}, ${fields.address ?? null}, ${fields.notes ?? null})
    RETURNING *
  `;
  return rowToSupplier(rows[0]);
}

export async function updateSupplier(id: number, fields: {
  name: string; phone?: string | null; whatsapp?: string | null;
  email?: string | null; address?: string | null; notes?: string | null;
}): Promise<void> {
  await sql`
    UPDATE suppliers SET
      name = ${fields.name}, phone = ${fields.phone ?? null}, whatsapp = ${fields.whatsapp ?? null},
      email = ${fields.email ?? null}, address = ${fields.address ?? null}, notes = ${fields.notes ?? null}
    WHERE id = ${id}
  `;
}

export async function deleteSupplier(id: number): Promise<void> {
  // supplier_products cascades on supplier delete, but supplier_purchases does not —
  // remove purchases first (their items cascade) so the delete can't be blocked by an FK.
  await sql`DELETE FROM supplier_purchases WHERE supplier_id = ${id}`;
  await sql`DELETE FROM suppliers WHERE id = ${id}`;
}

export async function setSupplierProduct(
  supplierId: number, productId: number, costPrice: number, code?: string | null,
): Promise<void> {
  await sql`
    INSERT INTO supplier_products (supplier_id, product_id, supplier_product_code, cost_price)
    VALUES (${supplierId}, ${productId}, ${code ?? null}, ${costPrice})
    ON CONFLICT (supplier_id, product_id) DO UPDATE SET
      supplier_product_code = EXCLUDED.supplier_product_code,
      cost_price = EXCLUDED.cost_price
  `;
}

export async function removeSupplierProduct(supplierId: number, productId: number): Promise<void> {
  await sql`DELETE FROM supplier_products WHERE supplier_id = ${supplierId} AND product_id = ${productId}`;
}

/** product_id → lowest recorded supplier cost. Defaults order-line cost. */
export async function getProductCostMap(): Promise<Record<number, number>> {
  const rows = await sql`
    SELECT product_id, MIN(cost_price) AS cost FROM supplier_products GROUP BY product_id
  `;
  const map: Record<number, number> = {};
  for (const r of rows) map[r.product_id as number] = Number(r.cost);
  return map;
}

export async function createPurchase(fields: {
  supplierId: number;
  date?: string | null;
  notes?: string | null;
  items: { productId: number; qty: number; unitCost: number }[];
}): Promise<number> {
  const total = fields.items.reduce((s, it) => s + it.qty * it.unitCost, 0);
  const rows = await sql`
    INSERT INTO supplier_purchases (supplier_id, date, total, notes)
    VALUES (${fields.supplierId}, ${fields.date || null}::date, ${total}, ${fields.notes ?? null})
    RETURNING id
  `;
  const purchaseId = rows[0].id as number;
  for (const it of fields.items) {
    await sql`
      INSERT INTO supplier_purchase_items (purchase_id, product_id, qty, unit_cost)
      VALUES (${purchaseId}, ${it.productId}, ${it.qty}, ${it.unitCost})
    `;
  }
  return purchaseId;
}

export async function getProductSuppliers(productId: number): Promise<ProductSupplierInfo[]> {
  const rows = await sql`
    SELECT sp.supplier_id, s.name AS supplier_name, sp.cost_price, sp.supplier_product_code,
           (SELECT MAX(pu.date)
            FROM supplier_purchases pu
            JOIN supplier_purchase_items pi2 ON pi2.purchase_id = pu.id
            WHERE pu.supplier_id = sp.supplier_id AND pi2.product_id = sp.product_id
           ) AS last_purchase_date
    FROM supplier_products sp
    JOIN suppliers s ON s.id = sp.supplier_id
    WHERE sp.product_id = ${productId}
    ORDER BY sp.cost_price ASC
  `;
  return rows.map(r => ({
    supplierId:          r.supplier_id as number,
    supplierName:        r.supplier_name as string,
    costPrice:           r.cost_price as number,
    supplierProductCode: (r.supplier_product_code ?? undefined) as string | undefined,
    lastPurchaseDate:    r.last_purchase_date ? new Date(r.last_purchase_date as string) : undefined,
  }));
}

export async function getOrdersForSourcing(date: string): Promise<SourcingItem[]> {
  const itemRows = await sql`
    SELECT oi.id, o.ref, o.customer_name, oi.product_id, p.name AS product_name,
           oi.qty, oi.supplier_id
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    LEFT JOIN products p ON p.id = oi.product_id
    WHERE DATE(o.created_at AT TIME ZONE 'Asia/Colombo') = ${date}::date
      AND o.status IN ('pending', 'confirmed', 'processing')
    ORDER BY o.id, oi.id
  `;
  if (itemRows.length === 0) return [];

  const supplierRows = await sql`
    SELECT sp.product_id, sp.supplier_id, s.name AS supplier_name, sp.cost_price,
           sp.supplier_product_code,
           (SELECT MAX(pu.date)
            FROM supplier_purchases pu
            JOIN supplier_purchase_items pi2 ON pi2.purchase_id = pu.id
            WHERE pu.supplier_id = sp.supplier_id AND pi2.product_id = sp.product_id
           ) AS last_purchase_date
    FROM supplier_products sp
    JOIN suppliers s ON s.id = sp.supplier_id
    WHERE sp.product_id IN (
      SELECT DISTINCT oi2.product_id FROM order_items oi2
      JOIN orders o2 ON o2.id = oi2.order_id
      WHERE DATE(o2.created_at AT TIME ZONE 'Asia/Colombo') = ${date}::date
        AND o2.status IN ('pending', 'confirmed', 'processing')
    )
    ORDER BY sp.product_id, sp.cost_price ASC
  `;

  const suppliersByProduct = new Map<number, ProductSupplierInfo[]>();
  for (const r of supplierRows) {
    const pid = r.product_id as number;
    if (!suppliersByProduct.has(pid)) suppliersByProduct.set(pid, []);
    suppliersByProduct.get(pid)!.push({
      supplierId:          r.supplier_id as number,
      supplierName:        r.supplier_name as string,
      costPrice:           r.cost_price as number,
      supplierProductCode: (r.supplier_product_code ?? undefined) as string | undefined,
      lastPurchaseDate:    r.last_purchase_date ? new Date(r.last_purchase_date as string) : undefined,
    });
  }

  return itemRows.map(r => {
    const pid = r.product_id as number;
    const suppliers = suppliersByProduct.get(pid) ?? [];
    return {
      orderItemId:         r.id as number,
      orderRef:            r.ref as string,
      customerName:        r.customer_name as string,
      productId:           pid,
      productName:         (r.product_name ?? '(deleted)') as string,
      qty:                 r.qty as number,
      currentSupplierId:   (r.supplier_id ?? undefined) as number | undefined,
      suppliers,
      recommendedSupplierId: suppliers[0]?.supplierId,
    };
  });
}

export async function assignSupplierToOrderItem(orderItemId: number, supplierId: number | null): Promise<void> {
  await sql`UPDATE order_items SET supplier_id = ${supplierId} WHERE id = ${orderItemId}`;
}

export async function reconcileSupplierInvoice(fields: {
  supplierId: number;
  invoiceRef: string;
  invoiceDate: string;
  items: { orderItemId?: number | null; productId: number; qty: number; unitCost: number }[];
}): Promise<void> {
  const total = fields.items.reduce((s, it) => s + it.qty * it.unitCost, 0);
  const rows = await sql`
    INSERT INTO supplier_purchases (supplier_id, date, total, notes)
    VALUES (${fields.supplierId}, ${fields.invoiceDate}::date, ${total}, ${fields.invoiceRef})
    RETURNING id
  `;
  const purchaseId = rows[0].id as number;

  for (const it of fields.items) {
    await sql`
      INSERT INTO supplier_purchase_items (purchase_id, product_id, qty, unit_cost)
      VALUES (${purchaseId}, ${it.productId}, ${it.qty}, ${it.unitCost})
    `;
    if (it.orderItemId) {
      await sql`
        UPDATE order_items
        SET unit_cost = ${it.unitCost}, unit_cost_confirmed = true, invoice_ref = ${fields.invoiceRef}
        WHERE id = ${it.orderItemId}
      `;
    }
    await sql`
      UPDATE supplier_products
      SET cost_price = ${it.unitCost}
      WHERE supplier_id = ${fields.supplierId} AND product_id = ${it.productId}
    `;
  }
}

// ─── Sales ──────────────────────────────────────────────────────────────────

export async function getSalesStats(): Promise<{
  revenueMtd: number; revenueAll: number; unitsSold: number;
  codPending: number; returnsCount: number; returnsValue: number;
  cost: number; margin: number;
}> {
  // Realised revenue/units/cost come from delivered orders.
  const deliveredRows = await sql`
    SELECT
      COALESCE(SUM(oi.qty * oi.unit_price), 0) AS revenue_all,
      COALESCE(SUM(oi.qty * oi.unit_price) FILTER (WHERE o.created_at >= date_trunc('month', NOW())), 0) AS revenue_mtd,
      COALESCE(SUM(oi.qty), 0) AS units_sold,
      COALESCE(SUM(oi.qty * oi.unit_cost) FILTER (WHERE oi.unit_cost IS NOT NULL), 0) AS cost
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    WHERE o.status = 'delivered'
  `;
  const codRows = await sql`
    SELECT COALESCE(SUM(oi.qty * oi.unit_price), 0) AS value
    FROM orders o JOIN order_items oi ON oi.order_id = o.id
    WHERE o.payment_type = 'cod' AND o.status = 'shipped'
  `;
  const returnRows = await sql`
    SELECT COUNT(DISTINCT o.id) AS cnt, COALESCE(SUM(oi.qty * oi.unit_price), 0) AS value
    FROM orders o JOIN order_items oi ON oi.order_id = o.id
    WHERE o.status = 'returned'
  `;
  const revenueAll = Number(deliveredRows[0].revenue_all);
  const cost = Number(deliveredRows[0].cost);
  return {
    revenueMtd:   Number(deliveredRows[0].revenue_mtd),
    revenueAll,
    unitsSold:    Number(deliveredRows[0].units_sold),
    codPending:   Number(codRows[0].value),
    returnsCount: Number(returnRows[0].cnt),
    returnsValue: Number(returnRows[0].value),
    cost,
    margin:       revenueAll - cost,
  };
}

export async function getRevenueByWeek(weeks = 8): Promise<{ weekStart: Date; revenue: number }[]> {
  const rows = await sql`
    SELECT date_trunc('week', o.created_at) AS week_start,
           COALESCE(SUM(oi.qty * oi.unit_price), 0) AS revenue
    FROM orders o JOIN order_items oi ON oi.order_id = o.id
    WHERE o.status = 'delivered'
      AND o.created_at >= date_trunc('week', NOW()) - (${weeks - 1} * INTERVAL '1 week')
    GROUP BY week_start
  `;
  const byKey = new Map<string, number>();
  for (const r of rows) byKey.set(new Date(r.week_start as string).toISOString().slice(0, 10), Number(r.revenue));

  // Fill all buckets so the chart always shows `weeks` bars.
  const out: { weekStart: Date; revenue: number }[] = [];
  const monday = new Date();
  const day = (monday.getUTCDay() + 6) % 7; // 0 = Monday
  monday.setUTCDate(monday.getUTCDate() - day);
  monday.setUTCHours(0, 0, 0, 0);
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(monday);
    d.setUTCDate(d.getUTCDate() - i * 7);
    const key = d.toISOString().slice(0, 10);
    out.push({ weekStart: d, revenue: byKey.get(key) ?? 0 });
  }
  return out;
}

export async function getTopProducts(limit = 5): Promise<{ name: string; units: number; revenue: number }[]> {
  const rows = await sql`
    SELECT p.name,
           COALESCE(SUM(oi.qty), 0) AS units,
           COALESCE(SUM(oi.qty * oi.unit_price), 0) AS revenue
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    LEFT JOIN products p ON p.id = oi.product_id
    WHERE o.status = 'delivered'
    GROUP BY p.name
    ORDER BY units DESC
    LIMIT ${limit}
  `;
  return rows.map(r => ({ name: (r.name ?? '(deleted)') as string, units: Number(r.units), revenue: Number(r.revenue) }));
}

export async function getSalesOrders(opts?: { from?: string; to?: string }): Promise<{
  ref: string; date: Date; customer: string; status: OrderStatus; paymentType: PaymentType;
  revenue: number; cost: number; margin: number;
}[]> {
  const from = opts?.from || null;
  const to = opts?.to || null;
  const rows = await sql`
    SELECT o.ref, o.created_at, o.customer_name, o.status, o.payment_type,
           COALESCE(SUM(oi.qty * oi.unit_price), 0) AS revenue,
           COALESCE(SUM(oi.qty * oi.unit_cost) FILTER (WHERE oi.unit_cost IS NOT NULL), 0) AS cost
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE (${from}::date IS NULL OR o.created_at >= ${from}::date)
      AND (${to}::date IS NULL OR o.created_at < (${to}::date + INTERVAL '1 day'))
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `;
  return rows.map(r => {
    const revenue = Number(r.revenue);
    const cost = Number(r.cost);
    return {
      ref: r.ref as string,
      date: new Date(r.created_at as string),
      customer: r.customer_name as string,
      status: r.status as OrderStatus,
      paymentType: r.payment_type as PaymentType,
      revenue, cost, margin: revenue - cost,
    };
  });
}

// ─── Site Settings ─────────────────────────────────────────────────────────────

export async function getAllSiteSettings(): Promise<Record<string, string>> {
  const rows = await sql`SELECT key, value FROM site_settings`;
  return Object.fromEntries(rows.map(r => [r.key as string, r.value as string]));
}

export async function upsertSiteSettings(entries: Record<string, string>): Promise<void> {
  for (const [key, value] of Object.entries(entries)) {
    await sql`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES (${key}, ${value}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `;
  }
}
