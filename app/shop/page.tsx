// Server component — fetches products from DB, hands off to client UI
import { CATEGORIES } from '@/lib/catalog';
import { getAllProducts } from '@/lib/db';
import ShopClient from './ShopClient';

export const revalidate = 3600;

export default async function ShopPage() {
  const products = await getAllProducts();
  return <ShopClient products={products} categories={CATEGORIES} />;
}
