'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { getAdminUserByUsername, getAdminUserById, updateAdminPassword, updateProduct, getProductById, createProduct, createBanner, updateBanner, deleteBanner, moveBanner, getAllProducts, createOrder, updateOrderStatus, updateOrderDelivery } from '@/lib/db';
import { serializeSession, SESSION_COOKIE, SESSION_MAX_AGE, getAdminSession } from '@/lib/admin-auth';
import type { StockStatus, Badge, Category, DeliveryMethod, PaymentType, OrderStatus } from '@/lib/types';

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

export async function changePasswordAction(formData: FormData) {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');

  const current = formData.get('current') as string;
  const next = formData.get('next') as string;
  const confirm = formData.get('confirm') as string;

  if (!current || !next || !confirm) redirect('/admin/account?error=missing');
  if (next.length < 8) redirect('/admin/account?error=short');
  if (next !== confirm) redirect('/admin/account?error=mismatch');

  const user = await getAdminUserById(session.userId);
  if (!user) redirect('/admin/login');

  const valid = await bcrypt.compare(current, user.passwordHash);
  if (!valid) redirect('/admin/account?error=current');

  const hash = await bcrypt.hash(next, 12);
  await updateAdminPassword(session.userId, hash);

  redirect('/admin/account?ok=1');
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

// ─── Orders ─────────────────────────────────────────────────────────────────

export async function createOrderAction(formData: FormData) {
  const customerName = (formData.get('customer_name') as string).trim();
  const customerPhone = (formData.get('customer_phone') as string).trim();
  const deliveryMethod = (formData.get('delivery_method') as DeliveryMethod) || 'courier';
  const isCourier = deliveryMethod === 'courier';
  const courierName = isCourier ? ((formData.get('courier_name') as string)?.trim() || null) : null;
  const trackingNumber = isCourier ? ((formData.get('tracking_number') as string)?.trim() || null) : null;
  const address = isCourier ? ((formData.get('address') as string)?.trim() || null) : null;
  const city = isCourier ? ((formData.get('city') as string)?.trim() || null) : null;
  const postalCode = isCourier ? ((formData.get('postal_code') as string)?.trim() || null) : null;
  const paymentType = (formData.get('payment_type') as PaymentType) || 'cod';
  const notes = (formData.get('notes') as string)?.trim() || null;

  // Catalog price is the fallback; an explicit per-line price entered by the admin wins.
  const products = await getAllProducts();
  const priceById = new Map(products.map(p => [p.id, p.price]));

  const items: { productId: number; qty: number; unitPrice: number }[] = [];
  let i = 0;
  while (formData.has(`item_product_${i}`)) {
    const productId = Number(formData.get(`item_product_${i}`));
    const qty = Number(formData.get(`item_qty_${i}`)) || 1;
    const catalogPrice = priceById.get(productId);
    const enteredRaw = formData.get(`item_price_${i}`) as string | null;
    const entered = enteredRaw != null && enteredRaw !== '' ? Number(enteredRaw) : NaN;
    const unitPrice = Number.isFinite(entered) && entered >= 0 ? entered : catalogPrice;
    if (productId && qty > 0 && unitPrice !== undefined) {
      items.push({ productId, qty, unitPrice });
    }
    i++;
  }

  if (!customerName || !customerPhone || items.length === 0) {
    redirect('/admin/orders/new?error=invalid');
  }

  const order = await createOrder({
    customerName, customerPhone, address, city, postalCode,
    deliveryMethod, courierName, trackingNumber, paymentType, notes, items,
  });

  revalidatePath('/admin/orders');
  revalidatePath('/admin');
  redirect(`/admin/orders/${order.ref}`);
}

export async function updateOrderStatusAction(formData: FormData) {
  const ref = formData.get('ref') as string;
  const status = formData.get('status') as OrderStatus;
  const redirectTo = (formData.get('redirect_to') as string) || '/admin/orders';

  await updateOrderStatus(ref, status);

  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${ref}`);
  revalidatePath('/admin');
  redirect(redirectTo);
}

export async function updateOrderDeliveryAction(formData: FormData) {
  const ref = formData.get('ref') as string;
  const courierName = (formData.get('courier_name') as string)?.trim() || null;
  const trackingNumber = (formData.get('tracking_number') as string)?.trim() || null;

  await updateOrderDelivery(ref, { courierName, trackingNumber });

  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${ref}`);
  redirect(`/admin/orders/${ref}`);
}
