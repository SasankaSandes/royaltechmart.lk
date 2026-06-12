import 'server-only';
import { neon } from '@neondatabase/serverless';
import type { Product, Category, StockStatus, Badge } from './types';

const sql = neon(process.env.DATABASE_URL!);

// Row from DB → typed Product
function rowToProduct(r: Record<string, unknown>): Product {
  return {
    id:        r.id as number,
    name:      r.name as string,
    slug:      r.slug as string,
    category:  r.category as Category,
    price:     r.price as number,
    oldPrice:  r.old_price as number | undefined,
    badge:     r.badge as Badge | undefined,
    rating:    Number(r.rating),
    reviews:   r.reviews as number,
    stock:     r.stock as StockStatus,
    warranty:  r.warranty as string,
    short:     r.short as string,
    tone:      r.tone as [string, string],
    specs:     r.specs as [string, string][],
    image:     r.image as string | undefined,
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

// Admin mutations
export async function updateProduct(id: number, fields: {
  name?: string;
  price?: number;
  oldPrice?: number | null;
  stock?: StockStatus;
  badge?: Badge | null;
  short?: string;
  warranty?: string;
  specs?: [string, string][];
}): Promise<Product> {
  const rows = await sql`
    UPDATE products SET
      name      = COALESCE(${fields.name ?? null}::text, name),
      price     = COALESCE(${fields.price ?? null}::int, price),
      old_price = ${fields.oldPrice !== undefined ? fields.oldPrice : null},
      stock     = COALESCE(${fields.stock ?? null}::text, stock),
      badge     = ${fields.badge !== undefined ? fields.badge : null},
      short     = COALESCE(${fields.short ?? null}::text, short),
      warranty  = COALESCE(${fields.warranty ?? null}::text, warranty),
      specs     = COALESCE(${fields.specs ? JSON.stringify(fields.specs) : null}::jsonb, specs)
    WHERE id = ${id}
    RETURNING *
  `;
  return rowToProduct(rows[0]);
}
