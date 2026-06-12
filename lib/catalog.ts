import type { Product, CategoryInfo, Category } from './types';

export const WHATSAPP = '94764834970';
export const FB_PAGE = 'https://facebook.com/royaltechmart';
export const EMAIL = 'hello@royaltechmart.lk';
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
  return 'RTM-' + String(id).padStart(3, '0');
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

export function waLink(product?: Product): string {
  let text: string;
  if (product) {
    text =
      `Hi Royal Tech Mart 👋\n\nI'd like to order:\n` +
      `• ${product.name}\n` +
      `• Price: ${money(product.price)}\n` +
      `• Item code: ${itemCode(product.id)}\n\n` +
      `Please share availability & delivery details.`;
  } else {
    text = `Hi Royal Tech Mart 👋 I'd like to know more about your products.`;
  }
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
}

