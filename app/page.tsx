import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TrustStrip from '@/components/TrustStrip';
import ProductCard from '@/components/ProductCard';
import WhatsAppFAB from '@/components/WhatsAppFAB';
import { CATEGORIES, waLink, FB_PAGE } from '@/lib/catalog';
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
              <h1 style={{ fontSize: 'clamp(40px,6vw,68px)', fontFamily: 'var(--font-head)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.02, marginBottom: 24 }}>
                Tech accessories,{' '}
                <span style={{ background: 'var(--yellow)', padding: '0 6px', borderRadius: 6 }}>delivered across Sri Lanka</span>
              </h1>
              <p style={{ fontSize: 17, color: 'var(--muted)', lineHeight: 1.65, marginBottom: 36, maxWidth: 480 }}>
                Pay on delivery, order on WhatsApp.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/shop" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'var(--ink)', color: '#fff',
                  padding: '13px 26px', borderRadius: 'var(--pill)', fontWeight: 700, fontSize: 15,
                }}>
                  Browse the shop {Icons.arrow}
                </Link>
                <a href={waLink()} target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'var(--wa)', color: '#fff',
                  padding: '13px 26px', borderRadius: 'var(--pill)', fontWeight: 700, fontSize: 15,
                }}>
                  {Icons.whatsapp} Chat to order
                </a>
              </div>
            </div>

            {/* Right — hero art */}
            <div style={{
              aspectRatio: '4/4.2', borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #FDEA0A 0%, #1b1b1b 100%)',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,.6)' }}>Novatek</span>
                <span style={{ fontFamily: 'var(--font-head)', fontSize: 48, fontWeight: 800, color: '#fff' }}>NVT</span>
              </div>
              <div style={{
                position: 'absolute', top: 24, right: 24,
                background: '#111110', borderRadius: 12, padding: '10px 16px',
                boxShadow: 'var(--shadow)', color: '#fff', display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ color: 'var(--yellow)' }}>{Icons.truck}</span>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700 }}>Island-wide</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,.55)' }}>COD available</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <TrustStrip />

        {/* Categories */}
        <section className="section" style={{ background: 'var(--surface)' }}>
          <div className="wrap">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <p className="eyebrow" style={{ marginBottom: 10 }}>What we carry</p>
                <h2 style={{ fontSize: 'clamp(28px,4vw,40px)' }}>Shop by category</h2>
              </div>
              <Link href="/shop" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: 'var(--ink-2)' }}>
                View all {Icons.arrow}
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
              {CATEGORIES.map((cat, i) => (
                <Link key={cat.id} href={`/shop?cat=${cat.id}`} className="cat-card"
                  style={{
                    background: '#fff', border: '1px solid var(--line)',
                    borderRadius: 'var(--radius)', padding: '24px 20px',
                    display: 'flex', flexDirection: 'column', gap: 12,
                  }}
                >
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em' }}>{CAT_NUMS[i]}</span>
                  <div>
                    <p style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{cat.label}</p>
                    <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{cat.blurb}</p>
                  </div>
                  <span style={{ color: 'var(--muted)', marginTop: 'auto', display: 'flex' }}>{Icons.arrow}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Trending */}
        <section className="section">
          <div className="wrap">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <p className="eyebrow" style={{ marginBottom: 10 }}>Hot right now</p>
                <h2 style={{ fontSize: 'clamp(28px,4vw,40px)' }}>Trending products</h2>
              </div>
              <Link href="/shop?sort=popular" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: 'var(--ink-2)' }}>
                View all {Icons.arrow}
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22 }}>
              {trending.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>

        {/* Facebook band */}
        <section style={{ paddingBlock: 84, background: 'var(--yellow)', position: 'relative', overflow: 'hidden' }}>
          <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ maxWidth: 680 }}>
              <p className="eyebrow" style={{ marginBottom: 16, color: 'var(--ink)' }}>How it works</p>
              <h2 style={{ fontSize: 'clamp(28px,4vw,40px)', marginBottom: 20 }}>
                See it on Facebook.<br />Order on WhatsApp.
              </h2>
              <p style={{ fontSize: 17, color: 'var(--ink-2)', lineHeight: 1.65, marginBottom: 36, maxWidth: 520 }}>
                We post every new arrival on our Facebook page. Click the link to see the full spec & price, then tap &ldquo;Order on WhatsApp&rdquo; to place your order in seconds — no account, no checkout, no hassle.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a href={FB_PAGE} target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'var(--ink)', color: '#fff',
                  padding: '13px 26px', borderRadius: 'var(--pill)', fontWeight: 700, fontSize: 15,
                }}>
                  {Icons.facebook} Follow on Facebook
                </a>
                <a href={waLink()} target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'transparent', color: 'var(--ink)',
                  padding: '13px 26px', borderRadius: 'var(--pill)', fontWeight: 700, fontSize: 15,
                  border: '2px solid var(--ink)',
                }}>
                  {Icons.whatsapp} Chat to order
                </a>
              </div>
            </div>
          </div>
          {/* Watermark */}
          <span style={{
            position: 'absolute', right: -20, top: -20, fontSize: 200, fontFamily: 'var(--font-head)',
            fontWeight: 800, color: 'rgba(17,17,16,.06)', lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
          }}>NVT</span>
        </section>

        {/* Fresh arrivals */}
        <section className="section" style={{ background: 'var(--surface)' }}>
          <div className="wrap">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <p className="eyebrow" style={{ marginBottom: 10 }}>Just in</p>
                <h2 style={{ fontSize: 'clamp(28px,4vw,40px)' }}>Fresh arrivals</h2>
              </div>
              <Link href="/shop?sort=new" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: 'var(--ink-2)' }}>
                View all {Icons.arrow}
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22 }}>
              {fresh.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFAB />

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
