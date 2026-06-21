import { requireAdmin } from '@/lib/admin-auth';
import { getOrdersForSourcing } from '@/lib/db';
import { assignSourcingAction } from '@/app/admin/actions';
import AdminShell from '@/components/AdminShell';
import { money } from '@/lib/catalog';

export default async function SourcingPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const session = await requireAdmin();
  const { date: rawDate } = await searchParams;

  // Default to today in Sri Lanka time (UTC+5:30)
  const today = new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const date = rawDate || today;

  const items = await getOrdersForSourcing(date);

  // Group by order ref for display
  const byOrder = new Map<string, { customerName: string; items: typeof items }>();
  for (const item of items) {
    if (!byOrder.has(item.orderRef)) {
      byOrder.set(item.orderRef, { customerName: item.customerName, items: [] });
    }
    byOrder.get(item.orderRef)!.items.push(item);
  }

  return (
    <AdminShell session={session} active="/admin/sourcing">
      <div style={{ padding: 32, maxWidth: 900 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 700, color: '#111110' }}>
            Sourcing
          </h1>
          <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
            Assign suppliers to today&apos;s pending orders, then generate a pick slip.
          </p>
        </div>

        {/* Date picker */}
        <form method="get" action="/admin/sourcing" style={{ marginBottom: 24, display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            type="date"
            name="date"
            defaultValue={date}
            style={{
              height: 40, padding: '0 12px', border: '1.5px solid #e5e5e3', borderRadius: 10,
              fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none', background: '#fff',
            }}
          />
          <button type="submit" style={{
            height: 40, padding: '0 16px', background: '#111110', color: '#fff',
            border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            Load
          </button>
        </form>

        {items.length === 0 ? (
          <div style={{
            background: '#fff', border: '1px solid #e5e5e3', borderRadius: 14,
            padding: 40, textAlign: 'center', color: '#aaa', fontSize: 14,
          }}>
            No pending or confirmed orders found for {date}.
          </div>
        ) : (
          <form action={assignSourcingAction}>
            <input type="hidden" name="date" value={date} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {Array.from(byOrder.entries()).map(([ref, order]) => (
                <div key={ref} style={{ background: '#fff', border: '1px solid #e5e5e3', borderRadius: 14, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 20px', borderBottom: '1px solid #f0f0ee', background: '#fafafa', display: 'flex', gap: 16, alignItems: 'baseline' }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: '#111110' }}>{ref}</span>
                    <span style={{ fontSize: 13, color: '#888' }}>{order.customerName}</span>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #f0f0ee' }}>
                        <th style={th}>Product</th>
                        <th style={{ ...th, width: 60 }}>Qty</th>
                        <th style={th}>Supplier (select to assign)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map(item => {
                        const preselect = item.currentSupplierId ?? item.recommendedSupplierId ?? '';
                        return (
                          <tr key={item.orderItemId} style={{ borderBottom: '1px solid #f8f8f6' }}>
                            <td style={td}>{item.productName}</td>
                            <td style={{ ...td, color: '#888' }}>× {item.qty}</td>
                            <td style={td}>
                              {item.suppliers.length === 0 ? (
                                <span style={{ color: '#f97316', fontSize: 13 }}>No suppliers linked</span>
                              ) : (
                                <select
                                  name={`item_${item.orderItemId}`}
                                  defaultValue={String(preselect)}
                                  style={{
                                    height: 36, padding: '0 10px', border: '1.5px solid #e5e5e3',
                                    borderRadius: 8, fontSize: 13, fontFamily: 'var(--font-body)',
                                    background: '#fff', outline: 'none', minWidth: 260, cursor: 'pointer',
                                  }}
                                >
                                  <option value="">— No supplier —</option>
                                  {item.suppliers.map(s => (
                                    <option key={s.supplierId} value={s.supplierId}>
                                      {s.supplierName} — Rs.{money(s.costPrice)}
                                      {s.lastPurchaseDate
                                        ? ` (last: ${s.lastPurchaseDate.toLocaleDateString('en-LK', { day: '2-digit', month: 'short', year: 'numeric' })})`
                                        : ' (never purchased)'}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
              <button type="submit" style={{
                height: 48, padding: '0 32px', background: '#111110', color: '#fff',
                border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer',
              }}>
                Save assignments &amp; generate slip →
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminShell>
  );
}

const th: React.CSSProperties = {
  textAlign: 'left', padding: '10px 16px',
  fontSize: 11, fontWeight: 600, color: '#888',
  textTransform: 'uppercase', letterSpacing: '0.06em',
};

const td: React.CSSProperties = {
  padding: '12px 16px', verticalAlign: 'middle',
};
