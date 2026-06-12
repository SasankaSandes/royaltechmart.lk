'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { waLink } from '@/lib/catalog';
import { Icons } from './Icons';

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      height: 76, display: 'flex', alignItems: 'center',
      background: 'var(--head-bg)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--line)',
    }}>
      <div className="wrap" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{
            background: '#111110', borderRadius: 10,
            width: 46, height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Image src="/rtm-logo.png" alt="Novatek" width={32} height={32} style={{ objectFit: 'contain' }} />
          </span>
          <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em' }}>
            Novatek
          </span>
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

        {/* WhatsApp CTA */}
        <a href={waLink()} target="_blank" rel="noopener noreferrer"
          className="wa-btn"
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--wa)', color: '#fff',
            padding: '9px 18px', borderRadius: 'var(--pill)',
            fontWeight: 600, fontSize: 14, flexShrink: 0,
          }}>
          <span style={{ display: 'flex' }}>{Icons.whatsapp}</span>
          <span className="hide-mobile">Chat to order</span>
        </a>

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
        </div>
      )}

      <style>{`
        @media (max-width: 720px) {
          .desktop-nav { display: none !important; }
          .hide-mobile { display: none; }
          .hamburger { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
