'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Icons } from './Icons';
import { waLink, FB_PAGE, INSTAGRAM } from '@/lib/catalog';

const SOCIALS: { label: string; href: string; icon: React.ReactNode }[] = [
  { label: 'WhatsApp', href: waLink(), icon: Icons.whatsapp },
  { label: 'Facebook', href: FB_PAGE, icon: Icons.facebook },
  { label: 'Instagram', href: INSTAGRAM, icon: Icons.instagram },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      height: 80, display: 'flex', alignItems: 'center',
      background: 'var(--surface-raised)',
      boxShadow: 'var(--shadow)',
    }}>
      <div className="wrap" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        {/* Wordmark */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }} aria-label="Novatek home">
          <Image src="/novatek-logo.svg" alt="Novatek" width={120} height={33} priority style={{ height: 30, width: 'auto' }} />
        </Link>

        {/* Nav */}
        <nav style={{ display: 'flex', gap: 4, marginLeft: 8 }} className="desktop-nav">
          {[['/', 'Home'], ['/shop', 'Shop'], ['/about', 'About']].map(([href, label]) => (
            <Link key={href} href={href} style={{
              padding: '6px 14px', borderRadius: 'var(--pill)',
              fontSize: 14, fontWeight: 500, color: 'var(--ink-2)',
              transition: 'background .15s, color .15s',
            }}
              onMouseEnter={e => { (e.target as HTMLElement).style.background = 'var(--surface)'; (e.target as HTMLElement).style.color = 'var(--ink)'; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.background = ''; (e.target as HTMLElement).style.color = 'var(--ink-2)'; }}
            >{label}</Link>
          ))}
        </nav>

        <div style={{ flex: 1 }} />

        {/* Social icons */}
        <div className="header-socials" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {SOCIALS.map(s => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
              title={s.label}
              style={{
                width: 38, height: 38, borderRadius: 'var(--pill)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--ink-2)', transition: 'background .15s, color .15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-control)'; (e.currentTarget as HTMLElement).style.color = 'var(--ink)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = 'var(--ink-2)'; }}
            >{s.icon}</a>
          ))}
        </div>

        {/* Hamburger */}
        <button className="hamburger" onClick={() => setOpen(!open)} aria-label="Menu"
          style={{ display: 'none', background: 'none', border: 'none', padding: 4, color: 'var(--ink)' }}>
          {open ? Icons.close : Icons.menu}
        </button>
      </div>

      {/* Mobile nav drawer */}
      {open && (
        <div style={{
          position: 'absolute', top: 76, left: 0, right: 0,
          background: 'var(--bg)', borderBottom: '1px solid var(--line)',
          padding: '12px 18px 20px',
        }}>
          {[['/', 'Home'], ['/shop', 'Shop'], ['/about', 'About']].map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              style={{ display: 'block', padding: '10px 0', fontWeight: 500, borderBottom: '1px solid var(--line)' }}>
              {label}
            </Link>
          ))}
          <div style={{ display: 'flex', gap: 8, paddingTop: 16 }}>
            {SOCIALS.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                style={{ width: 42, height: 42, borderRadius: 'var(--pill)', background: 'var(--surface-control)', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 720px) {
          .desktop-nav { display: none !important; }
          .hide-mobile { display: none; }
          .header-socials { display: none !important; }
          .hamburger { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
