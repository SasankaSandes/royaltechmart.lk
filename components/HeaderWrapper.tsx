import { getSiteSettings } from '@/lib/site-settings';
import { waLink } from '@/lib/catalog';
import { Icons } from './Icons';
import Header from './Header';

export default async function HeaderWrapper() {
  const s = await getSiteSettings();
  const socials = [
    { label: 'WhatsApp', href: waLink(undefined, s), icon: Icons.whatsapp, color: '#25D366' },
    ...(s.fb_page    ? [{ label: 'Facebook',  href: s.fb_page,   icon: Icons.facebook,  color: '#1877F2' }] : []),
    ...(s.instagram  ? [{ label: 'Instagram', href: s.instagram, icon: Icons.instagram, color: '#E1306C' }] : []),
    ...(s.tiktok     ? [{ label: 'TikTok',    href: s.tiktok,    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.95a8.27 8.27 0 004.84 1.54V7.05a4.85 4.85 0 01-1.07-.36z"/></svg>, color: '#000' }] : []),
  ];
  return <Header socials={socials} />;
}
