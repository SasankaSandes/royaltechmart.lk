import 'server-only';
import { getAllSiteSettings } from './db';
import { WHATSAPP, FB_PAGE, INSTAGRAM, EMAIL, PHONE } from './catalog';

const DEFAULTS: Record<string, string> = {
  whatsapp_number: WHATSAPP,
  fb_page:         FB_PAGE,
  instagram:       INSTAGRAM,
  tiktok:          '',
  phone:           PHONE,
  email:           EMAIL,
  delivery_price:  '',
  delivery_sla:    '',
  order_message:
    'Hi Novatek 👋\n\nI\'d like to order:\n• {name}\n• Price: {price}\n• Item code: {code}\n\nPlease share availability & delivery details.',
};

export async function getSiteSettings(): Promise<Record<string, string>> {
  try {
    const db = await getAllSiteSettings();
    return { ...DEFAULTS, ...db };
  } catch {
    return { ...DEFAULTS };
  }
}
