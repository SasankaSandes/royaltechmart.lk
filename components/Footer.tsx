import Link from 'next/link';
import Image from 'next/image';
import { waLink, CATEGORIES } from '@/lib/catalog';
import { getSiteSettings } from '@/lib/site-settings';
import { Icons } from './Icons';

export default async function Footer() {
  const s = await getSiteSettings();
  return (
    <footer style={{ background: 'var(--ink)', color: '#fff', paddingBlock: 56 }}>
      <div className="wrap">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
          {/* Brand */}
          <div>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', marginBottom: 16 }} aria-label="Novatek home">
              <Image src="/novatek-logo.svg" alt="Novatek" width={120} height={33} style={{ height: 24, width: 'auto', filter: 'invert(1)' }} />
            </Link>
            <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 14, lineHeight: 1.65, marginBottom: 20 }}>
              Tech accessories, delivered island-wide. Pay on delivery, order on WhatsApp.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {s.fb_page && <a href={s.fb_page} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                {Icons.facebook}
              </a>}
              {s.instagram && <a href={s.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                {Icons.instagram}
              </a>}
              {s.tiktok && <a href={s.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok"
                style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.95a8.27 8.27 0 004.84 1.54V7.05a4.85 4.85 0 01-1.07-.36z"/></svg>
              </a>}
              <a href={waLink(undefined, s)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
                style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(37,211,102,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--wa)' }}>
                {Icons.whatsapp}
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,.4)', marginBottom: 16 }}>Shop</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link href="/shop" style={{ color: 'rgba(255,255,255,.7)', fontSize: 14, transition: 'color .15s' }}>All products</Link>
              {CATEGORIES.map(c => (
                <Link key={c.id} href={`/shop?cat=${c.id}`} style={{ color: 'rgba(255,255,255,.7)', fontSize: 14 }}>{c.label}</Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,.4)', marginBottom: 16 }}>Contact</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <a href={waLink(undefined, s)} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--wa)', fontSize: 14, fontWeight: 600 }}>
                {Icons.whatsapp} WhatsApp
              </a>
              {s.phone && <a href={`tel:${s.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,.7)', fontSize: 14 }}>
                {Icons.phone} {s.phone}
              </a>}
              {s.email && <a href={`mailto:${s.email}`} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,.7)', fontSize: 14 }}>
                {Icons.mail} {s.email}
              </a>}
              <span style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,.55)', fontSize: 14 }}>
                {Icons.pin} Island-wide delivery · COD
              </span>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,.1)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ color: 'rgba(255,255,255,.35)', fontSize: 13 }}>
            © {new Date().getFullYear()} Novatek. All rights reserved.
          </p>
          <p style={{ color: 'rgba(255,255,255,.35)', fontSize: 13 }}>
            Island-wide delivery · Cash on delivery
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          footer .wrap > div:first-child { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </footer>
  );
}
