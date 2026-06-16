import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
import { getAllSuppliers } from '@/lib/db';
import AdminShell from '@/components/AdminShell';

export default async function SuppliersPage() {
  const session = await requireAdmin('owner');
  const suppliers = await getAllSuppliers();

  return (
    <AdminShell session={session} active="/admin/suppliers">
      <div style={{ padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 700, color: '#111110' }}>Suppliers</h1>
            <p style={{ color: '#888', fontSize: 14, marginTop: 2 }}>{suppliers.length} supplier{suppliers.length === 1 ? '' : 's'}</p>
          </div>
          <Link href="/admin/suppliers/new" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#111110', color: '#fff', borderRadius: 10,
            padding: '10px 18px', fontSize: 14, fontWeight: 600, textDecoration: 'none',
          }}>+ Add supplier</Link>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e5e3', borderRadius: 14, overflow: 'hidden' }}>
          {suppliers.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111110', marginBottom: 4 }}>No suppliers yet</div>
              <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>Add your first supplier to track costs and purchases.</p>
              <Link href="/admin/suppliers/new" style={{
                display: 'inline-block', background: '#111110', color: '#fff', borderRadius: 10,
                padding: '9px 18px', fontSize: 13, fontWeight: 600, textDecoration: 'none',
              }}>+ Add supplier</Link>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e5e3', background: '#fafafa' }}>
                  {['Name', 'Phone', 'WhatsApp', 'Products', ''].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#888', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {suppliers.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #f0f0ee' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600, fontSize: 14, color: '#111110' }}>{s.name}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#888' }}>{s.phone || '—'}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#888' }}>{s.whatsapp || '—'}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#888' }}>{s.productCount}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <Link href={`/admin/suppliers/${s.id}`} style={{
                        fontSize: 13, fontWeight: 600, color: '#111110',
                        padding: '6px 14px', border: '1.5px solid #e5e5e3',
                        borderRadius: 8, display: 'inline-block', textDecoration: 'none',
                      }}>View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
