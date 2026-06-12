'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { updateProduct } from '@/lib/db';
import { getProductById } from '@/lib/db';
import type { StockStatus, Badge } from '@/lib/types';

export async function loginAction(formData: FormData) {
  const password = formData.get('password') as string;
  if (password === process.env.ADMIN_PASSWORD) {
    const jar = await cookies();
    jar.set('admin_auth', password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    });
    redirect('/admin');
  }
  redirect('/admin?error=1');
}

export async function saveProductAction(formData: FormData) {
  const id = Number(formData.get('id'));
  const price = Number(formData.get('price'));
  const oldPriceRaw = formData.get('old_price') as string;
  const oldPrice = oldPriceRaw ? Number(oldPriceRaw) : null;
  const stock = formData.get('stock') as StockStatus;
  const badgeRaw = formData.get('badge') as string;
  const badge = (badgeRaw || null) as Badge | null;
  const short = formData.get('short') as string;
  const warranty = formData.get('warranty') as string;
  const name = formData.get('name') as string;

  await updateProduct(id, { name, price, oldPrice, stock, badge, short, warranty });

  // Revalidate the product page and home/shop so changes show immediately
  const product = await getProductById(id);
  if (product?.slug) revalidatePath(`/product/${product.slug}`);
  revalidatePath('/');
  revalidatePath('/shop');

  redirect('/admin');
}
