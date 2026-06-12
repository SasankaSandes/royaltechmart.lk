'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import WhatsAppFAB from '@/components/WhatsAppFAB';
import type { Category, SortKey, Product } from '@/lib/types';
import type { CategoryInfo } from '@/lib/types';
import { Icons } from '@/components/Icons';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'popular', label: 'Most popular' },
  { value: 'new', label: 'Newest first' },
  { value: 'rating', label: 'Top rated' },
  { value: 'low', label: 'Price: low to high' },
  { value: 'high', label: 'Price: high to low' },
];

const BADGE_RANK: Record<string, number> = { Trending: 3, Featured: 2, New: 1 };

function sortProducts(products: Product[], sort: SortKey): Product[] {
  const copy = [...products];
  switch (sort) {
    case 'low':    return copy.sort((a, b) => a.price - b.price);
    case 'high':   return copy.sort((a, b) => b.price - a.price);
    case 'rating': return copy.sort((a, b) => b.rating - a.rating);
    case 'new':    return copy.sort((a, b) => {
      if ((b.badge === 'New') !== (a.badge === 'New')) return a.badge === 'New' ? -1 : 1;
      return b.id - a.id;
    });
    default:
      return copy.sort((a, b) => {
        const ra = BADGE_RANK[a.badge ?? ''] ?? 0;
        const rb = BADGE_RANK[b.badge ?? ''] ?? 0;
        return rb - ra || b.reviews - a.reviews;
      });
  }
}

function ShopContent({ products, categories }: { products: Product[]; categories: CategoryInfo[] }) {
  const params = useSearchParams();
  const router = useRouter();

  const [cat, setCat] = useState<Category | 'all'>('all');
  const [sort, setSort] = useState<SortKey>('popular');
  const [q, setQ] = useState('');

  useEffect(() => {
    const c = params.get('cat') as Category | null;
    const s = params.get('sort') as SortKey | null;
    if (c && categories.find(x => x.id === c)) setCat(c);
    if (s) setSort(s);
  }, [params, categories]);

  function handleCat(val: Category | 'all') {
    setCat(val);
    const url = new URLSearchParams();
    if (val !== 'all') url.set('cat', val);
    if (sort !== 'popular') url.set('sort', sort);
    router.replace('/shop' + (url.toString() ? '?' + url.toString() : ''), { scroll: false });
  }

  const filtered = products.filter(p => {
    const matchCat = cat === 'all' || p.category === cat;
    const term = q.toLowerCase();
    const matchQ = !q || p.name.toLowerCase().includes(term) || p.short.toLowerCase().includes(term) || p.category.includes(term);
    return matchCat && matchQ;
  });

  const sorted = sortProducts(filtered, sort);

  return (
    <>
      <Header />
      <main>
        <section style={{ background: 'var(--surface)', paddingBlock: 48, borderBottom: '1px solid var(--line)' }}>
          <div className="wrap">
            <p className="eyebrow" style={{ marginBottom: 12 }}>Catalogue</p>
            <h1 style={{ fontSize: 'clamp(28px,4vw,40px)', marginBottom: 20 }}>Shop all products</h1>
            <div style={{ position: 'relative', maxWidth: 480 }}>
              <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', display: 'flex' }}>
                {Icons.search}
              </span>
              <input type="search" placeholder="Search products…" value={q} onChange={e => setQ(e.target.value)}
                style={{
                  width: '100%', height: 48, paddingLeft: 48, paddingRight: 20,
                  border: '1.5px solid var(--line)', borderRadius: 'var(--pill)',
                  fontSize: 15, fontFamily: 'var(--font-body)', background: '#fff', outline: 'none',
                }} />
            </div>
          </div>
        </section>

        <section className="section--tight">
          <div className="wrap">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {([{ id: 'all' as const, label: 'All' }, ...categories]).map(c => (
                  <button key={c.id} onClick={() => handleCat(c.id as Category | 'all')}
                    style={{
                      padding: '7px 16px', borderRadius: 'var(--pill)', fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', border: 'none',
                      background: cat === c.id ? 'var(--ink)' : 'var(--surface)',
                      color: cat === c.id ? '#fff' : 'var(--ink-2)',
                      transition: 'background .15s, color .15s',
                    }}>
                    {c.label}
                  </button>
                ))}
              </div>
              <select value={sort} onChange={e => setSort(e.target.value as SortKey)}
                style={{
                  padding: '8px 14px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--line)',
                  fontSize: 13, fontFamily: 'var(--font-body)', background: '#fff', cursor: 'pointer',
                }}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
              {sorted.length} {sorted.length === 1 ? 'product' : 'products'}
              {cat !== 'all' ? ` in ${categories.find(c => c.id === cat)?.label}` : ''}
              {q && ` matching "${q}"`}
            </p>

            {sorted.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(248px, 1fr))', gap: 22 }}>
                {sorted.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--muted)' }}>
                <p style={{ fontSize: 48, marginBottom: 16 }}>🔍</p>
                <p style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 700, marginBottom: 8, color: 'var(--ink)' }}>No products found</p>
                <p>Try a different search term or category.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFAB />
    </>
  );
}

export default function ShopClient({ products, categories }: { products: Product[]; categories: CategoryInfo[] }) {
  return (
    <Suspense>
      <ShopContent products={products} categories={categories} />
    </Suspense>
  );
}
