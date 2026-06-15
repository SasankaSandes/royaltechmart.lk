import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
import { getAllOrders, getOrderStats } from '@/lib/db';
import { money } from '@/lib/catalog';
import { updateOrderStatusAction } from '@/app/admin/actions';
import AdminShell from '@/components/AdminShell';
import StatusSelect from '@/components/StatusSelect';
import type { OrderStatus } from '@/lib/types';

const TABS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all',        label: 'All' },
  { value: 'pending',    label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped',    label: 'Shipped' },
  { value: 'delivered',  label: 'Delivered' },
  { value: 'returned',   label: 'Returned' },
];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const session = await requireAdmin();
  const { status: statusParam, q } = await searchParams;
  const status = (TABS.some(t => t.value === statusParam) && statusParam !== 'all')
    ? (statusParam as OrderStatus)
    : undefined;

  const [orders, stats] = await Promise.all([
    getAllOrders({ status, q }),
    getOrderStats(),
  ]);

  const tabCount = (v: OrderStatus | 'all') => {
    if (v === 'all') return stats.total;
    return (stats as Record<string, number>)[v] ?? undefined;
  };

  const tabHref = (v: OrderStatus | 'all') => {
    const params = new URLSearchParams();
    if (v !== 'all') params.set('status', v);
    if (q) params.set('q', q);
    const s = params.toString();
    return `/admin/orders${s ? `?${s}` : ''}`;
  };

  return (
    <AdminShell session={session} active="/admin/orders">
      <div style={{ padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 700, color: '#111110' }}>
              Orders
            </h1>
            <p style={{ color: '#888', fontSize: 14, marginTop: 2 }}>
              {stats.total} total
              {stats.codPendingValue > 0 && ` · ${money(stats.codPendingValue)} COD in transit`}
            </p>
          </div>
          <Link href="/admin/orders/new" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#111110', color: '#fff', borderRadius: 10,
            padding: '10px 18px', fontSize: 14, fontWeight: 600, textDecoration: 'none',
          }}>
            + Log order
          </Link>
        </div>

        {/* Tabs + search */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {TABS.map(t => {
              const active = (statusParam ?? 'all') === t.value || (!statusParam && t.value === 'all');
              const count = tabCount(t.value);
              return (
                <Link key={t.value} href={tabHref(t.value)} style={{
                  fontSize: 13, fontWeight: active ? 600 : 500,
                  padding: '7px 14px', borderRadius: 999, textDecoration: 'none',
                  background: active ? '#111110' : '#fff',
                  color: active ? '#fff' : '#555',
                  border: '1px solid #e5e5e3',
                }}>
                  {t.label}{count !== undefined && count > 0 ? ` (${count})` : ''}
                </Link>
              );
            })}
          </div>
          <form method="get" style={{ display: 'flex', gap: 8 }}>
            {status && <input type="hidden" name="status" value={status} />}
            <input name="q" defaultValue={q ?? ''} placeholder="Search name or phone…" style={{
              height: 38, padding: '0 12px', border: '1.5px solid #e5e5e3', borderRadius: 10,
              fontSize: 13, fontFamily: 'var(--font-body)', outline: 'none', background: '#fff', width: 220,
            }} />
            <button type="submit" style={{
              height: 38, padding: '0 16px', fontSize: 13, fontWeight: 600,
              border: '1.5px solid #e5e5e3', borderRadius: 10, background: '#fff', cursor: 'pointer',
            }}>Search</button>
          </form>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e5e3', borderRadius: 14, overflow: 'hidden' }}>
          {orders.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111110', marginBottom: 4 }}>No orders yet</div>
              <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
                {q || status ? 'No orders match this filter.' : 'Log your first WhatsApp order to get started.'}
              </p>
              <Link href="/admin/orders/new" style={{
                display: 'inline-block', background: '#111110', color: '#fff', borderRadius: 10,
                padding: '9px 18px', fontSize: 13, fontWeight: 600, textDecoration: 'none',
              }}>+ Log order</Link>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e5e3', background: '#fafafa' }}>
                  {['Ref', 'Date', 'Customer', 'Items', 'Total', 'Payment', 'Status', ''].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#888', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid #f0f0ee' }}>
                    <td style={{ padding: '14px 16px', fontFamily: 'var(--mono)', fontSize: 12, color: '#111110', whiteSpace: 'nowrap' }}>{o.ref}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#888', whiteSpace: 'nowrap' }}>
                      {o.createdAt.toLocaleDateString('en-LK', { day: 'numeric', month: 'short' })}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#111110' }}>{o.customerName}</div>
                      <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{o.customerPhone}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#888' }}>{o.itemCount}</td>
                    <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, color: '#111110', whiteSpace: 'nowrap' }}>{money(o.total)}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 999,
                        color: o.paymentType === 'cod' ? '#B4791B' : '#1B8A4B',
                        background: o.paymentType === 'cod' ? '#fef3c7' : '#d1fae5',
                      }}>{o.paymentType === 'cod' ? 'COD' : 'Paid'}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <form action={updateOrderStatusAction} style={{ display: 'inline' }}>
                        <input type="hidden" name="ref" value={o.ref} />
                        <input type="hidden" name="redirect_to" value="/admin/orders" />
                        <StatusSelect value={o.status} />
                      </form>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <Link href={`/admin/orders/${o.ref}`} style={{
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
