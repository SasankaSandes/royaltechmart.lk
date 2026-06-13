import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TrustStrip from '@/components/TrustStrip';
import ProductCard from '@/components/ProductCard';
import { CATEGORIES, FB_PAGE } from '@/lib/catalog';
import { getAllProducts } from '@/lib/db';
import { Icons } from '@/components/Icons';
import type { Product } from '@/lib/types';

export const revalidate = 3600;

const CAT_NUMS = ['01', '02', '03', '04', '05'];

export default async function Home() {
  const allProducts = await getAllProducts();
  const trending: Product[] = allProducts.filter(p => p.badge === 'Trending').length
    ? allProducts.filter(p => p.badge === 'Trending').slice(0, 4)
    : allProducts.slice(0, 4);
  const fresh: Product[] = allProducts.filter(p => p.badge === 'New' || p.badge === 'Featured').length
    ? allProducts.filter(p => p.badge === 'New' || p.badge === 'Featured').slice(0, 4)
    : allProducts.slice(4, 8);
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="section">
          <div className="wrap" style={{ display: 'grid', gridTemplateColumns: '1.05fr .95fr', gap: 48, alignItems: 'center' }}>
            {/* Left */}
            <div>
              <p className="eyebrow" style={{ marginBottom: 20 }}>Sri Lanka&apos;s mobile accessories store</p>
              <h1 style={{ fontSize: 'clamp(40px,6vw,69px)', fontFamily: 'var(--font-head)', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1, marginBottom: 24, color: 'var(--text-strong)' }}>
                Tech accessories, delivered across Sri Lanka
              </h1>
              <p style={{ fontSize: 19, color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: 36, maxWidth: 480 }}>
                Pay on delivery, order on WhatsApp.
              </p>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <Button href="/shop" variant="primary" icon={Icons.arrow}>Browse the shop</Button>
              </div>
            </div>

            {/* Right — hero art (haze panel) */}
            <div style={{
              aspectRatio: '4/4.2', borderRadius: 'var(--radius-lg)',
              background: 'var(--surface-raised)', boxShadow: 'var(--shadow-sm)',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Image src="/novatek-logo.svg" alt="Novatek" width={260} height={71} style={{ width: '52%', height: 'auto', opacity: 0.9 }} />
              </div>
              <div style={{
                position: 'absolute', top: 24, right: 24,
                background: 'var(--surface-card)', borderRadius: 16, padding: '10px 16px',
                boxShadow: 'var(--shadow)', color: 'var(--text-default)', display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ color: 'var(--text-strong)' }}>{Icons.truck}</span>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-strong)' }}>Island-wide</p>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>COD available</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <TrustStrip />

        {/* Categories */}
        <section className="section" style={{ background: 'var(--surface)' }}>
          <div className="wrap">
            <SectionHeader eyebrow="What we carry" title="Shop by category" actionLabel="View all" actionHref="/shop" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
              {CATEGORIES.map((cat, i) => (
                <Link key={cat.id} href={`/shop?cat=${cat.id}`} className="cat-card"
                  style={{
                    background: 'var(--surface-card)', boxShadow: 'var(--shadow-sm)',
                    borderRadius: 'var(--radius-lg)', padding: '28px 24px',
                    display: 'flex', flexDirection: 'column', gap: 12,
                  }}
                >
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: '0.1em' }}>{CAT_NUMS[i]}</span>
                  <div>
                    <p style={{ fontFamily: 'var(--font-head)', fontWeight: 500, fontSize: 16, marginBottom: 6 }}>{cat.label}</p>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{cat.blurb}</p>
                  </div>
                  <span style={{ color: 'var(--text-tertiary)', marginTop: 'auto', display: 'flex' }}>{Icons.arrow}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Trending */}
        <section className="section">
          <div className="wrap">
            <SectionHeader eyebrow="Hot right now" title="Trending products" actionLabel="View all" actionHref="/shop?sort=popular" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22 }}>
              {trending.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>

        {/* Facebook band — single dark feature panel */}
        <section style={{ paddingBlock: 84, background: 'var(--surface-ink)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ maxWidth: 680 }}>
              <p className="eyebrow" style={{ marginBottom: 16, color: 'rgba(255,255,255,.5)' }}>How it works</p>
              <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', marginBottom: 20, color: '#fff' }}>
                See it on Facebook.<br />Order on WhatsApp.
              </h2>
              <p style={{ fontSize: 19, color: 'rgba(255,255,255,.72)', lineHeight: 1.45, marginBottom: 36, maxWidth: 520 }}>
                We post every new arrival on our Facebook page. Click the link to see the full spec & price, then tap &ldquo;Order on WhatsApp&rdquo; to place your order in seconds — no account, no checkout, no hassle.
              </p>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <Button href={FB_PAGE} variant="secondary" icon={Icons.facebook} iconPosition="left"
                  style={{ background: 'var(--surface-card)', color: 'var(--text-strong)', border: 'none' }}>
                  Follow on Facebook
                </Button>
              </div>
            </div>
          </div>
          {/* Watermark wordmark */}
          <Image src="/novatek-logo.svg" alt="" aria-hidden width={520} height={143} style={{
            position: 'absolute', right: -30, bottom: -20, width: 420, height: 'auto',
            opacity: 0.06, filter: 'invert(1)', userSelect: 'none', pointerEvents: 'none',
          }} />
        </section>

        {/* Fresh arrivals */}
        <section className="section" style={{ background: 'var(--surface)' }}>
          <div className="wrap">
            <SectionHeader eyebrow="Just in" title="Fresh arrivals" actionLabel="View all" actionHref="/shop?sort=new" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22 }}>
              {fresh.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 980px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-right { display: none; }
          .cat-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .product-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 720px) {
          .cat-grid { grid-template-columns: 1fr !important; }
          .product-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
