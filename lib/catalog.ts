import type { Product, CategoryInfo, Category } from './types';

export const WHATSAPP = '94764834970';
export const FB_PAGE = 'https://facebook.com/novateksl';
export const INSTAGRAM = 'https://instagram.com/novatek.lk';
export const EMAIL = 'hello@novatek.lk'; // TODO: set up domain mailbox (still a placeholder)
export const PHONE = '+94 76 483 4970';

export const CATEGORIES: CategoryInfo[] = [
  { id: 'earbuds',    label: 'Earbuds',        blurb: 'Wireless sound, all-day comfort' },
  { id: 'chargers',   label: 'Chargers',        blurb: 'Fast, safe, GaN-powered' },
  { id: 'powerbanks', label: 'Power Banks',     blurb: 'Top up anywhere' },
  { id: 'holders',    label: 'Phone Holders',   blurb: 'Car, desk & bedside' },
  { id: 'cables',     label: 'Cables',          blurb: 'Braided & built to last' },
];

export function money(n: number): string {
  return 'Rs. ' + Number(n).toLocaleString('en-LK');
}

export function itemCode(id: number): string {
  return 'NVT-' + String(id).padStart(3, '0');
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function productUrl(product: Product): string {
  return `/product/${product.slug ?? slugify(product.name)}`;
}

export function waLink(
  product: Product | undefined,
  settings: Record<string, string>,
): string {
  const wa = settings.whatsapp_number || WHATSAPP;
  let text: string;
  if (product) {
    const template = settings.order_message ||
      'Hi Novatek 👋\n\nI\'d like to order:\n• {name}\n• Price: {price}\n• Item code: {code}\n\nPlease share availability & delivery details.';
    text = template
      .replace('{name}',  product.name)
      .replace('{price}', money(product.price))
      .replace('{code}',  itemCode(product.id));
  } else {
    text = `Hi Novatek 👋 I'd like to know more about your products.`;
  }
  return `https://wa.me/${wa}?text=${encodeURIComponent(text)}`;
}

