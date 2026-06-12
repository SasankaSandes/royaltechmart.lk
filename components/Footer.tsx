import Link from 'next/link';
import Image from 'next/image';
import { waLink, FB_PAGE, EMAIL, PHONE, CATEGORIES } from '@/lib/catalog';
import { Icons } from './Icons';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--ink)', color: '#fff', paddingBlock: 56 }}>
      <div className="wrap">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
          {/* Brand */}
          <div>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ background: '#111110', border: '1px solid #333', borderRadius: 10, width: 46, height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Image src="/rtm-logo.png" alt="RTM" width={32} height={32} style={{ objectFit: 'contain' }} />
              </span>
              <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 16 }}>Royal Tech Mart</span>
            </Link>
            <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 14, lineHeight: 1.65, marginBottom: 20 }}>
              Genuine mobile accessories, royally priced. Island-wide delivery. Order on WhatsApp.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <a href={FB_PAGE} target="_blank" rel="noopener noreferrer"
                style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                {Icons.facebook}
              </a>
              <a href={waLink()} target="_blank" rel="noopener noreferrer"
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
              <a href={waLink()} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--wa)', fontSize: 14, fontWeight: 600 }}>
                {Icons.whatsapp} Order on WhatsApp
              </a>
              <a href={`tel:${PHONE}`} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,.7)', fontSize: 14 }}>
                {Icons.phone} {PHONE}
              </a>
              <a href={`mailto:${EMAIL}`} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,.7)', fontSize: 14 }}>
                {Icons.mail} {EMAIL}
              </a>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,.55)', fontSize: 14 }}>
                {Icons.pin} Island-wide delivery · COD
              </span>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,.1)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ color: 'rgba(255,255,255,.35)', fontSize: 13 }}>
            © {new Date().getFullYear()} Royal Tech Mart. All rights reserved.
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
