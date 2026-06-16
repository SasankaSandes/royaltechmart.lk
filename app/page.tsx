import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TrustStrip from '@/components/TrustStrip';
import ProductCard from '@/components/ProductCard';
import HeroBanner from '@/components/HeroBanner';
import { CATEGORIES, FB_PAGE, INSTAGRAM } from '@/lib/catalog';
import { getAllProducts, getActiveBanners } from '@/lib/db';
import { Icons } from '@/components/Icons';
import type { Product } from '@/lib/types';

export const revalidate = 3600;

const CAT_NUMS = ['01', '02', '03', '04', '05'];

export default async function Home() {
  const [allProducts, banners] = await Promise.all([getAllProducts(), getActiveBanners()]);
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
        {/* 1 — Hero banner */}
        <HeroBanner banners={banners} />

        {/* 2 — Trending products */}
        <section className="section" style={{ background: 'var(--surface)' }}>
          <div className="wrap">
            <SectionHeader eyebrow="Hot right now" title="Trending products" actionLabel="View all" actionHref="/shop?sort=popular" />
            <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22 }}>
              {trending.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>

        {/* 3 — Offerings strip */}
        <TrustStrip />

        {/* 4 — Shop by category */}
        <section className="section" style={{ background: 'var(--surface)' }}>
          <div className="wrap">
            <SectionHeader eyebrow="What we carry" title="Shop by category" actionLabel="View all" actionHref="/shop" />
            <div className="cat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
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

        {/* 5 — Social media strip */}
        <section style={{ paddingBlock: 84, background: 'var(--surface-ink)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ maxWidth: 680 }}>
              <p className="eyebrow" style={{ marginBottom: 16, color: 'rgba(255,255,255,.5)' }}>How it works</p>
              <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', marginBottom: 20, color: '#fff' }}>
                See it on FB or Insta.<br />Order on WhatsApp.
              </h2>
              <p style={{ fontSize: 19, color: 'rgba(255,255,255,.72)', lineHeight: 1.45, marginBottom: 36, maxWidth: 520 }}>
                Follow our Facebook and Instagram page and be the first to know about new arrivals and exclusive offers. Message us on WhatsApp to place your order directly through our social media channels.</p>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <Button href={FB_PAGE} variant="secondary" icon={Icons.facebook} iconPosition="left"
                  style={{ background: 'var(--surface-card)', color: 'var(--text-strong)', border: 'none' }}>
                   Facebook
                </Button>
                <Button href={INSTAGRAM} variant="secondary" icon={Icons.instagram} iconPosition="left"
                  style={{ background: 'var(--surface-card)', color: 'var(--text-strong)', border: 'none' }}>
                  Instagram
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

        {/* 6 — Fresh arrivals */}
        <section className="section" style={{ background: 'var(--surface)' }}>
          <div className="wrap">
            <SectionHeader eyebrow="Just in" title="Fresh arrivals" actionLabel="View all" actionHref="/shop?sort=new" />
            <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22 }}>
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
          .product-grid {
            display: flex !important; overflow-x: auto; scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch; scrollbar-width: none; gap: 14px; padding-bottom: 4px;
          }
          .product-grid > * { flex: 0 0 calc(50% - 16px) !important; scroll-snap-align: start; }
          .cat-grid {
            display: flex !important; overflow-x: auto; scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch; scrollbar-width: none; gap: 14px; padding-bottom: 4px;
          }
          .cat-grid > * { flex: 0 0 calc(33% - 10px) !important; scroll-snap-align: start; }
        }
        @media (max-width: 720px) {
          .product-grid > * { flex: 0 0 72vw !important; }
          .cat-grid > * { flex: 0 0 62vw !important; }
        }
      `}</style>
    </>
  );
}
