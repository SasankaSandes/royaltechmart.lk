import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAllProducts } from '@/lib/db';
import { money, itemCode } from '@/lib/catalog';
import { loginAction } from './actions';

const STOCK_LABEL = { in: 'In stock', low: 'Low stock', out: 'Out of stock' } as const;
const STOCK_COLOR = { in: '#1B8A4B', low: '#B4791B', out: '#B43B3B' } as const;

export default async function AdminPage() {
  const jar = await cookies();
  const authed = jar.get('admin_auth')?.value === process.env.ADMIN_PASSWORD;

  if (!authed) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--surface)', fontFamily: 'var(--font-body)',
      }}>
        <div style={{
          background: '#fff', border: '1px solid var(--line)',
          borderRadius: 'var(--radius)', padding: 40, width: 360,
          boxShadow: 'var(--shadow)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <span style={{
              background: '#111110', borderRadius: 8, width: 36, height: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-head)', fontWeight: 800, color: '#FDEA0A', fontSize: 14,
            }}>N</span>
            <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 16 }}>Novatek Admin</span>
          </div>
          <form action={loginAction}>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Password</label>
            <input name="password" type="password" autoFocus required
              style={{
                width: '100%', height: 44, padding: '0 14px',
                border: '1.5px solid var(--line)', borderRadius: 'var(--radius-sm)',
                fontSize: 15, fontFamily: 'var(--font-body)', marginBottom: 16, outline: 'none',
              }} />
            <button type="submit" style={{
              width: '100%', height: 44, background: '#111110', color: '#fff',
              border: 'none', borderRadius: 'var(--radius-sm)',
              fontWeight: 700, fontSize: 15, cursor: 'pointer',
            }}>Sign in</button>
          </form>
        </div>
      </div>
    );
  }

  const products = await getAllProducts();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', fontFamily: 'var(--font-body)' }}>
      {/* Admin header */}
      <header style={{
        background: '#111110', color: '#fff', height: 60,
        display: 'flex', alignItems: 'center', paddingInline: 28,
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            fontFamily: 'var(--font-head)', fontWeight: 800,
            color: '#FDEA0A', fontSize: 16,
          }}>Novatek Admin</span>
          <span style={{ color: 'rgba(255,255,255,.3)', fontSize: 13 }}>Product Catalog</span>
        </div>
        <Link href="/" style={{ color: 'rgba(255,255,255,.5)', fontSize: 13 }}>← Back to site</Link>
      </header>

      <div style={{ maxWidth: 1100, marginInline: 'auto', padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 700 }}>
            Products <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 16 }}>({products.length})</span>
          </h1>
        </div>

        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--surface)' }}>
                {['Code', 'Product', 'Category', 'Price', 'Stock', 'Badge', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>{itemCode(p.id)}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{p.short.slice(0, 60)}…</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--muted)', textTransform: 'capitalize' }}>{p.category}</td>
                  <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap' }}>{money(p.price)}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 'var(--pill)',
                      color: STOCK_COLOR[p.stock],
                      background: p.stock === 'in' ? '#d1fae5' : p.stock === 'low' ? '#fef3c7' : '#fee2e2',
                    }}>{STOCK_LABEL[p.stock]}</span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--muted)' }}>{p.badge ?? '—'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <Link href={`/admin/${p.id}`} style={{
                      fontSize: 13, fontWeight: 600, color: '#111110',
                      padding: '6px 14px', border: '1.5px solid var(--line)',
                      borderRadius: 'var(--radius-sm)', display: 'inline-block',
                    }}>Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
