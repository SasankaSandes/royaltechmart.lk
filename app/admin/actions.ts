'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { getAdminUserByUsername, updateProduct, getProductById, createProduct, createBanner, updateBanner, deleteBanner, moveBanner } from '@/lib/db';
import { serializeSession, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/admin-auth';
import type { StockStatus, Badge, Category } from '@/lib/types';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function loginAction(formData: FormData) {
  const username = (formData.get('username') as string).trim().toLowerCase();
  const password = formData.get('password') as string;

  const user = await getAdminUserByUsername(username);
  if (!user) redirect('/admin/login?error=1');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) redirect('/admin/login?error=1');

  const jar = await cookies();
  jar.set(SESSION_COOKIE, serializeSession({ userId: user.id, name: user.name, role: user.role }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
  redirect('/admin');
}

export async function logoutAction() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect('/admin/login');
}

// ─── Products ─────────────────────────────────────────────────────────────────

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
  const category = formData.get('category') as Category;
  const image = (formData.get('image') as string) || null;
  const toneFrom = (formData.get('tone_from') as string) || '#FDEA0A';
  const toneTo = (formData.get('tone_to') as string) || '#222222';

  // Parse specs from key_0/val_0 pairs
  const specs: [string, string][] = [];
  let i = 0;
  while (formData.has(`spec_key_${i}`)) {
    const k = (formData.get(`spec_key_${i}`) as string).trim();
    const v = (formData.get(`spec_val_${i}`) as string).trim();
    if (k && v) specs.push([k, v]);
    i++;
  }

  await updateProduct(id, {
    name, category, price, oldPrice, stock, badge, short, warranty,
    image, specs: specs.length ? specs : undefined,
    tone: [toneFrom, toneTo],
  });

  const product = await getProductById(id);
  if (product?.slug) revalidatePath(`/product/${product.slug}`);
  revalidatePath('/');
  revalidatePath('/shop');

  redirect('/admin/products');
}

export async function addProductAction(formData: FormData) {
  const price = Number(formData.get('price'));
  const oldPriceRaw = formData.get('old_price') as string;
  const oldPrice = oldPriceRaw ? Number(oldPriceRaw) : null;
  const stock = formData.get('stock') as StockStatus;
  const badgeRaw = formData.get('badge') as string;
  const badge = (badgeRaw || null) as Badge | null;
  const short = formData.get('short') as string;
  const warranty = formData.get('warranty') as string;
  const name = formData.get('name') as string;
  const category = formData.get('category') as Category;
  const image = (formData.get('image') as string) || null;
  const toneFrom = (formData.get('tone_from') as string) || '#FDEA0A';
  const toneTo = (formData.get('tone_to') as string) || '#222222';

  const specs: [string, string][] = [];
  let i = 0;
  while (formData.has(`spec_key_${i}`)) {
    const k = (formData.get(`spec_key_${i}`) as string).trim();
    const v = (formData.get(`spec_val_${i}`) as string).trim();
    if (k && v) specs.push([k, v]);
    i++;
  }

  const product = await createProduct({
    name, category, price, oldPrice, stock, badge, warranty, short, image, specs,
    tone: [toneFrom, toneTo],
  });

  revalidatePath('/');
  revalidatePath('/shop');
  revalidatePath(`/product/${product.slug}`);

  redirect('/admin/products');
}

// ─── Banners ──────────────────────────────────────────────────────────────────

export async function addBannerAction(formData: FormData) {
  await createBanner({
    eyebrow: (formData.get('eyebrow') as string) || undefined,
    title: formData.get('title') as string,
    subtitle: (formData.get('subtitle') as string) || undefined,
    ctaText: formData.get('cta_text') as string,
    ctaUrl: formData.get('cta_url') as string,
    bgFrom: formData.get('bg_from') as string,
    bgTo: formData.get('bg_to') as string,
  });
  revalidatePath('/');
  redirect('/admin/banners');
}

export async function editBannerAction(formData: FormData) {
  const id = Number(formData.get('id'));
  await updateBanner(id, {
    eyebrow: (formData.get('eyebrow') as string) || undefined,
    title: formData.get('title') as string,
    subtitle: (formData.get('subtitle') as string) || undefined,
    ctaText: formData.get('cta_text') as string,
    ctaUrl: formData.get('cta_url') as string,
    bgFrom: formData.get('bg_from') as string,
    bgTo: formData.get('bg_to') as string,
  });
  revalidatePath('/');
  redirect('/admin/banners');
}

export async function toggleBannerAction(formData: FormData) {
  const id = Number(formData.get('id'));
  const active = formData.get('active') === 'true';
  await updateBanner(id, { active: !active });
  revalidatePath('/');
  revalidatePath('/admin/banners');
}

export async function deleteBannerAction(formData: FormData) {
  const id = Number(formData.get('id'));
  await deleteBanner(id);
  revalidatePath('/');
  redirect('/admin/banners');
}

export async function moveBannerAction(formData: FormData) {
  const id = Number(formData.get('id'));
  const direction = formData.get('direction') as 'up' | 'down';
  await moveBanner(id, direction);
  revalidatePath('/');
  revalidatePath('/admin/banners');
}
