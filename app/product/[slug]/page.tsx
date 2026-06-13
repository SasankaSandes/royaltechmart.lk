import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import WhatsAppFAB from '@/components/WhatsAppFAB';
import { Button } from '@/components/ui/Button';
import { Badge, PRODUCT_BADGE_TONE } from '@/components/ui/Badge';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { CATEGORIES, money, waLink, itemCode, productUrl, PHONE } from '@/lib/catalog';
import { getProductBySlug as bySlug, getRelatedProducts as related, getAllSlugs } from '@/lib/db';
import { Icons } from '@/components/Icons';

const SITE_URL = 'https://novatek.lk';

// ISR — revalidate product pages every hour so price/stock edits go live quickly
export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map(r => ({ slug: r.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const product = await bySlug(slug);
  if (!product) return { title: 'Product not found — Novatek' };
  const ogImage = product.image ? `${SITE_URL}${product.image}` : undefined;
  return {
    title: `${product.name} — Novatek`,
    description: product.short,
    openGraph: {
      title: `${product.name} — ${money(product.price)}`,
      description: product.short,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 1200, alt: product.name }] : [],
      url: `${SITE_URL}${productUrl(product)}`,
      type: 'website',
    },
  };
}

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 3, color: 'var(--nv-slate-400)', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ opacity: i <= Math.round(rating) ? 1 : 0.2 }}>{Icons.star}</span>
      ))}
    </span>
  );
}

export default async function ProductPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const product = await bySlug(slug);
  if (!product) notFound();

  const [relatedProducts] = await Promise.all([related(product)]);
  const catLabel = CATEGORIES.find(c => c.id === product.category)?.label ?? product.category;
  const savings = product.oldPrice ? product.oldPrice - product.price : 0;
  const pct = product.oldPrice ? Math.round((savings / product.oldPrice) * 100) : 0;
  const stockLabel = { in: 'In stock', low: 'Low stock', out: 'Out of stock' }[product.stock];
  const stockClass = { in: 'stock-in', low: 'stock-low', out: 'stock-out' }[product.stock];
  const brand = product.specs.find(([k]) => k === 'Brand')?.[1] ?? '';
  const model = product.specs.find(([k]) => k === 'Model')?.[1] ?? '';

  return (
    <>
      <Header />
      <main>
        {/* Breadcrumbs */}
        <div className="wrap" style={{
          paddingBlock: 14,
          display: 'flex', gap: 6, alignItems: 'center',
          fontSize: 13, color: 'var(--muted)',
          borderBottom: '1px solid var(--line)',
        }}>
          <Link href="/" style={{ color: 'var(--muted)' }}>Home</Link>
          <span style={{ opacity: 0.4 }}>/</span>
          <Link href={`/shop?cat=${product.category}`} style={{ color: 'var(--muted)' }}>{catLabel}</Link>
          <span style={{ opacity: 0.4 }}>/</span>
          <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{product.name}</span>
        </div>

        {/* PDP grid */}
        <section className="section--tight">
          <div className="wrap pdp-grid" style={{
            display: 'grid', gridTemplateColumns: '1.05fr .95fr',
            gap: 54, alignItems: 'start',
          }}>
            {/* ── Left — Image ── */}
            <div style={{ position: 'sticky', top: 96 }}>
              <div style={{
                aspectRatio: '1', borderRadius: 'var(--radius-xl)',
                overflow: 'hidden', marginBottom: 12,
                background: 'var(--surface-card)', boxShadow: 'var(--shadow-sm)',
                position: 'relative',
              }}>
                {product.image ? (
                  <Image src={product.image} alt={product.name} fill sizes="(max-width: 980px) 100vw, 52vw"
                    style={{ objectFit: 'contain', padding: 16, background: '#fff' }} priority />
                ) : (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(135deg, var(--nv-haze-400) 0%, var(--nv-haze-600) 100%)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 12,
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 600,
                      color: 'var(--text-tertiary)',
                    }}>{brand || 'NVT'}</span>
                    <span style={{
                      fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600,
                      textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--text-muted, var(--nv-slate-300))',
                    }}>{itemCode(product.id)}</span>
                  </div>
                )}
              </div>
              <div style={{
                background: 'var(--surface)', borderRadius: 'var(--radius-sm)',
                padding: '12px 16px', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
              }}>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                  Item code:{' '}
                  <strong style={{ fontFamily: 'var(--mono)', color: 'var(--ink)', fontSize: 13 }}>
                    {itemCode(product.id)}
                  </strong>
                </span>
                {brand && model && (
                  <span style={{
                    fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--muted)',
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                  }}>{brand} · {model}</span>
                )}
              </div>
            </div>

            {/* ── Right — Info ── */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <p style={{ fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--muted)' }}>{catLabel}</p>
                {product.badge && (
                  <Badge tone={PRODUCT_BADGE_TONE[product.badge] ?? 'neutral'} size="sm">{product.badge}</Badge>
                )}
              </div>

              <h1 style={{ fontSize: 'clamp(26px,3.5vw,38px)', fontFamily: 'var(--font-head)', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 16 }}>{product.name}</h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
                <Stars rating={product.rating} />
                <span style={{ fontWeight: 700, fontSize: 14 }}>{product.rating}</span>
                <span style={{ color: 'var(--muted)', fontSize: 13 }}>({product.reviews} reviews)</span>
                <span className={stockClass} style={{ padding: '3px 10px', borderRadius: 'var(--pill)', fontSize: 12, fontWeight: 600 }}>{stockLabel}</span>
              </div>

              <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.7, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--line)' }}>{product.short}</p>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: savings ? 10 : 24, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 38, fontFamily: 'var(--font-head)', fontWeight: 600, letterSpacing: '-0.01em' }}>{money(product.price)}</span>
                {product.oldPrice && <span style={{ fontSize: 17, color: 'var(--muted)', textDecoration: 'line-through' }}>{money(product.oldPrice)}</span>}
              </div>
              {savings > 0 && (
                <div style={{ display: 'inline-flex', background: 'var(--accent-success-surface, var(--nv-green-50))', color: 'var(--accent-success)', borderRadius: 'var(--pill)', padding: '5px 14px', fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
                  Save {money(savings)} · {pct}% off
                </div>
              )}

              <div style={{ display: 'flex', gap: 20, marginBottom: 24, fontSize: 13, color: 'var(--muted)', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{Icons.truck} Ready to ship island-wide</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{Icons.shield} {product.warranty}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                <Button href={waLink(product)} variant="whatsapp" icon={Icons.whatsapp} iconPosition="left" fullWidth>
                  Order on WhatsApp
                </Button>
                <Button href={`tel:${PHONE}`} variant="ghost" icon={Icons.phone} iconPosition="left" fullWidth>
                  Call us
                </Button>
              </div>

              <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', marginBottom: 32 }}>
                Item code <strong style={{ color: 'var(--ink)', fontFamily: 'var(--mono)' }}>{itemCode(product.id)}</strong> is pre-filled in your WhatsApp message
              </p>

              {product.specs.length > 0 && (
                <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: 24, border: '1px solid var(--line)' }}>
                  <p style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Key specs</p>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      {product.specs.map(([k, v]) => (
                        <tr key={k} style={{ borderBottom: '1px solid var(--line)' }}>
                          <td style={{ padding: '10px 12px 10px 0', fontSize: 13, color: 'var(--muted)', width: '42%', fontWeight: 500, verticalAlign: 'top' }}>{k}</td>
                          <td style={{ padding: '10px 0', fontSize: 13, fontWeight: 600, verticalAlign: 'top' }}>{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Info cards */}
        <section className="section--tight" style={{ background: 'var(--surface)' }}>
          <div className="wrap" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 28 }}>
              <p style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 17, marginBottom: 14 }}>About this product</p>
              <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.75, marginBottom: 14 }}>{product.short}</p>
              {brand && (
                <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                  Sold by <strong style={{ color: 'var(--ink)' }}>Novatek</strong>. {brand} product from authorised distributors, covered by {product.warranty}.
                </p>
              )}
            </div>
            <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 28 }}>
              <p style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 17, marginBottom: 14 }}>Delivery &amp; warranty</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {([
                  [Icons.truck, 'Island-wide delivery — 1 to 3 business days'],
                  [Icons.shield, `${product.warranty} on this product`],
                  [Icons.return, 'Returns accepted within 7 days of delivery'],
                  [Icons.check, 'Cash on delivery (COD) available'],
                ] as [React.ReactNode, string][]).map(([icon, text], i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'var(--ink-2)' }}>
                    <span style={{ color: '#25D366', flexShrink: 0, marginTop: 1 }}>{icon}</span>
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Related */}
        {relatedProducts.length > 0 && (
          <section className="section">
            <div className="wrap">
              <SectionHeader title="You may also like" align="center"
                titleStyle={{ fontSize: 'clamp(22px,3vw,32px)' }}
                actionLabel={`View all ${catLabel}`} actionHref={`/shop?cat=${product.category}`}
                style={{ marginBottom: 32 }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22 }}>
                {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
      <WhatsAppFAB />
      <style>{`
        .pdp-grid { display: grid; }
        @media (max-width: 980px) { .pdp-grid { grid-template-columns: 1fr !important; gap: 32px !important; } }
        @media (max-width: 720px) { .pdp-grid ~ section .wrap { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  );
}
