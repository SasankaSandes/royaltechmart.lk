import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
import { getAllProducts } from '@/lib/db';
import { money, itemCode } from '@/lib/catalog';
import AdminShell from '@/components/AdminShell';

const STOCK_LABEL = { in: 'In stock', low: 'Low stock', out: 'Out of stock' } as const;
const STOCK_COLOR = { in: '#1B8A4B', low: '#B4791B', out: '#B43B3B' } as const;
const STOCK_BG    = { in: '#d1fae5',  low: '#fef3c7',  out: '#fee2e2'  } as const;

export default async function ProductsPage() {
  const session = await requireAdmin();
  const products = await getAllProducts();

  return (
    <AdminShell session={session} active="/admin/products">
      <div style={{ padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 700, color: '#111110' }}>
              Products
            </h1>
            <p style={{ color: '#888', fontSize: 14, marginTop: 2 }}>{products.length} items in catalog</p>
          </div>
          <Link href="/admin/products/new" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#111110', color: '#fff', borderRadius: 10,
            padding: '10px 18px', fontSize: 14, fontWeight: 600, textDecoration: 'none',
          }}>
            + Add product
          </Link>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e5e3', borderRadius: 14, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e5e3', background: '#fafafa' }}>
                {['Code', 'Product', 'Category', 'Price', 'Stock', 'Badge', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#888', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f0f0ee' }}>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--mono)', fontSize: 12, color: '#888' }}>{itemCode(p.id)}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#111110' }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{p.short.slice(0, 55)}{p.short.length > 55 ? '…' : ''}</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#888', textTransform: 'capitalize' }}>{p.category}</td>
                  <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, color: '#111110', whiteSpace: 'nowrap' }}>
                    {money(p.price)}
                    {p.oldPrice && <span style={{ fontSize: 12, color: '#aaa', fontWeight: 400, marginLeft: 6, textDecoration: 'line-through' }}>{money(p.oldPrice)}</span>}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 999,
                      color: STOCK_COLOR[p.stock], background: STOCK_BG[p.stock],
                    }}>{STOCK_LABEL[p.stock]}</span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 12, color: '#888' }}>{p.badge ?? '—'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <Link href={`/admin/products/${p.id}`} style={{
                      fontSize: 13, fontWeight: 600, color: '#111110',
                      padding: '6px 14px', border: '1.5px solid #e5e5e3',
                      borderRadius: 8, display: 'inline-block', textDecoration: 'none',
                    }}>Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
