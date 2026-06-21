import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import HeaderWrapper from '@/components/HeaderWrapper';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/Button';
import { Badge, PRODUCT_BADGE_TONE } from '@/components/ui/Badge';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { CATEGORIES, money, waLink, itemCode, productUrl } from '@/lib/catalog';
import { getSiteSettings } from '@/lib/site-settings';
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


export default async function ProductPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const product = await bySlug(slug);
  if (!product) notFound();

  const [relatedProducts, s] = await Promise.all([related(product), getSiteSettings()]);
  const catLabel = CATEGORIES.find(c => c.id === product.category)?.label ?? product.category;
  const savings = product.oldPrice ? product.oldPrice - product.price : 0;
  const pct = product.oldPrice ? Math.round((savings / product.oldPrice) * 100) : 0;
  const stockLabel = { in: 'In stock', low: 'Low stock', out: 'Out of stock' }[product.stock];
  const stockClass = { in: 'stock-in', low: 'stock-low', out: 'stock-out' }[product.stock];
  const brand = product.specs.find(([k]) => k === 'Brand')?.[1] ?? '';
  const model = product.specs.find(([k]) => k === 'Model')?.[1] ?? '';

  return (
    <>
      <HeaderWrapper />
      <main>
        {/* Breadcrumbs */}
        <div className="wrap" style={{
          paddingBlock: 14,
          display: 'flex', gap: 6, alignItems: 'center',
          fontSize: 13, color: 'var(--muted)',
          borderBottom: '1px solid var(--line)',
          minWidth: 0,
        }}>
          <Link href="/" style={{ color: 'var(--muted)', flexShrink: 0 }}>Home</Link>
          <span style={{ opacity: 0.4, flexShrink: 0 }}>/</span>
          <Link href={`/shop?cat=${product.category}`} style={{ color: 'var(--muted)', flexShrink: 0 }}>{catLabel}</Link>
          <span style={{ opacity: 0.4, flexShrink: 0 }}>/</span>
          <span style={{ color: 'var(--ink)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{product.name}</span>
        </div>

        {/* PDP grid */}
        <section className="section--tight">
          <div className="wrap pdp-grid" style={{
            display: 'grid', gridTemplateColumns: '1.05fr .95fr',
            gap: 54, alignItems: 'start',
          }}>
            {/* ── Left — Image ── */}
            <div className="pdp-image-col" style={{ position: 'sticky', top: 96 }}>
              <div style={{
                aspectRatio: '1', borderRadius: 'var(--radius)',
                overflow: 'hidden', marginBottom: 12,
                background: 'var(--surface-card)',
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
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <svg viewBox="0 0 24 24" fill="#FDEA0A" width="14" height="14"><path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z" /></svg>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{product.rating}</span>
                </span>
                <span style={{ color: 'var(--muted)', fontSize: 13 }}>({product.reviews} reviews)</span>
                <span className={stockClass} style={{ padding: '3px 10px', borderRadius: 'var(--pill)', fontSize: 12, fontWeight: 600 }}>{stockLabel}</span>
              </div>

              <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.7, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--line)' }}>{product.short}</p>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: savings ? 10 : 24, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 'clamp(26px, 8vw, 38px)', fontFamily: 'var(--font-head)', fontWeight: 600, letterSpacing: '-0.01em' }}>{money(product.price)}</span>
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
                <Button href={waLink(product, s)} variant="whatsapp" icon={Icons.whatsapp} iconPosition="left" fullWidth>
                  Order now
                </Button>
                {/* <Button href={`tel:${PHONE}`} variant="ghost" icon={Icons.phone} iconPosition="left" fullWidth>
                  Call us
                </Button> */}
              </div>


              {product.specs.length > 0 && (
                <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: 24, border: '1px solid var(--line)' }}>
                  <p style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Key specs</p>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      {product.specs.map(([k, v], i) => (
                        <tr key={k} style={{ borderBottom: i < product.specs.length - 1 ? '1px solid var(--line)' : 'none' }}>
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
          <div className="wrap pdp-info-cards" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
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
          <section className="section" style={{ background: 'var(--surface)' }}>
            <div className="wrap">
              <SectionHeader title="You may also like" align="center"
                titleStyle={{ fontSize: 'clamp(22px,3vw,32px)' }}
                actionLabel={`View all ${catLabel}`} actionHref={`/shop?cat=${product.category}`}
                style={{ marginBottom: 32 }} />
              <div className="pdp-related-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22 }}>
                {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
      <style>{`
        .pdp-grid { display: grid; }
        @media (max-width: 980px) { .pdp-grid { grid-template-columns: 1fr !important; gap: 32px !important; } .pdp-image-col { position: static !important; } }
        @media (max-width: 720px) {
          .pdp-info-cards { grid-template-columns: 1fr !important; }
          .pdp-related-grid {
            display: flex !important;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            gap: 14px;
            padding-bottom: 4px;
          }
          .pdp-related-grid::-webkit-scrollbar { display: none; }
          .pdp-related-grid > * { flex: 0 0 72vw; scroll-snap-align: start; }
        }
      `}</style>
    </>
  );
}
