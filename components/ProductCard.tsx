'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { money, waLink, itemCode, productUrl } from '@/lib/catalog';
import { Icons } from './Icons';

const BADGE_STYLE: Record<string, { background: string; color: string }> = {
  Trending: { background: 'var(--surface-ink)', color: '#fff' },
  Featured: { background: 'var(--accent-success)', color: '#fff' },
  New: { background: 'var(--surface-control)', color: 'var(--ink-2)' },
};

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 2, color: 'var(--nv-slate-400)' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ opacity: i <= Math.round(rating) ? 1 : 0.25 }}>
          {Icons.star}
        </span>
      ))}
    </span>
  );
}

function ProductImage({ product }: { product: Product }) {
  if (product.image) {
    return <Image src={product.image} alt={product.name} fill style={{ objectFit: 'cover' }} />;
  }
  // Neutral haze placeholder (monochrome — no product.tone color)
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(135deg, var(--nv-haze-400) 0%, var(--nv-haze-600) 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{
        fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.15em',
        color: 'var(--text-tertiary)',
      }}>{itemCode(product.id)}</span>
    </div>
  );
}

export default function ProductCard({ product }: { product: Product }) {
  const stockLabel = { in: 'In stock', low: 'Low stock', out: 'Out of stock' }[product.stock];
  const stockClass = { in: 'stock-in', low: 'stock-low', out: 'stock-out' }[product.stock];

  return (
    <article style={{
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)',
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      transition: 'transform var(--dur-base) var(--ease-standard), box-shadow var(--dur-base) var(--ease-standard)',
      cursor: 'pointer',
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-lg)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = '';
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      {/* Image */}
      <Link href={productUrl(product)} style={{ position: 'relative', aspectRatio: '1', display: 'block', overflow: 'hidden' }}>
        <ProductImage product={product} />
        {product.badge && (
          <span style={{
            position: 'absolute', top: 12, left: 12,
            ...BADGE_STYLE[product.badge],
            fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.15em',
            padding: '4px 10px', borderRadius: 'var(--pill)',
          }}>{product.badge}</span>
        )}
        {product.stock === 'out' && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#B43B3B' }}>Out of stock</span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div style={{ padding: '16px 16px 0' }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--muted)', marginBottom: 6 }}>
          {product.category}
        </p>
        <Link href={productUrl(product)}>
          <h3 style={{ fontSize: 17, fontFamily: 'var(--font-head)', fontWeight: 500, letterSpacing: '-0.01em', marginBottom: 6, lineHeight: 1.2 }}>
            {product.name}
          </h3>
        </Link>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10, lineHeight: 1.5 }}>
          {product.short}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <Stars rating={product.rating} />
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{product.rating} ({product.reviews})</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 'var(--pill)' }} className={stockClass}>{stockLabel}</span>
        </div>
      </div>

      {/* Price + CTA */}
      <div style={{ padding: '0 16px 16px', marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 20, fontWeight: 600, fontFamily: 'var(--font-head)', letterSpacing: '-0.01em' }}>{money(product.price)}</span>
          {product.oldPrice && (
            <span style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'line-through' }}>{money(product.oldPrice)}</span>
          )}
        </div>
        <a href={waLink(product)} target="_blank" rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: '10px 16px', borderRadius: 'var(--radius-sm)',
            background: 'var(--wa)', color: '#fff', fontWeight: 700, fontSize: 14,
            transition: 'background .15s',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--wa-deep)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--wa)'}
        >
          {Icons.whatsapp} Order on WhatsApp
        </a>
      </div>
    </article>
  );
}
