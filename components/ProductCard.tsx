'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { money, itemCode, productUrl } from '@/lib/catalog';
import { Badge, PRODUCT_BADGE_TONE } from './ui/Badge';


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
    <article className="product-card" style={{
      background: 'var(--surface-card)',
      borderRadius: 16,
      overflow: 'hidden',
      display: 'flex',
      cursor: 'pointer',
    }}
    >
      {/* Image */}
      <Link className="product-card-img" href={productUrl(product)} style={{ position: 'relative', aspectRatio: '1', display: 'block', overflow: 'hidden' }}>
        <ProductImage product={product} />
        {product.badge && (
          <Badge tone={PRODUCT_BADGE_TONE[product.badge] ?? 'neutral'} size="sm"
            style={{ position: 'absolute', top: 12, left: 12 }}>
            {product.badge}
          </Badge>
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
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <svg viewBox="0 0 24 24" fill="#FDEA0A" width="14" height="14"><path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z" /></svg>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{product.rating}</span>
          </span>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>({product.reviews})</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 'var(--pill)' }} className={stockClass}>{stockLabel}</span>
        </div>
      </div>

      {/* Price + CTA */}
      <div className="shop-cta" style={{ padding: '0 16px 16px', marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 20, fontWeight: 600, fontFamily: 'var(--font-head)', letterSpacing: '-0.01em' }}>{money(product.price)}</span>
          {product.oldPrice && (
            <span style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'line-through' }}>{money(product.oldPrice)}</span>
          )}
        </div>
      </div>
    </article>
  );
}
