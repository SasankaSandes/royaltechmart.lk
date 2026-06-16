import { requireAdmin } from '@/lib/admin-auth';
import { getSalesStats, getRevenueByWeek, getTopProducts, getSalesOrders } from '@/lib/db';
import { money } from '@/lib/catalog';
import { STATUS_LABEL, STATUS_COLOR, STATUS_BG } from '@/lib/orders-ui';
import AdminShell from '@/components/AdminShell';
import RevenueChart from '@/components/RevenueChart';

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const session = await requireAdmin('owner');
  const { from, to } = await searchParams;

  const [stats, weekly, top, orders] = await Promise.all([
    getSalesStats(),
    getRevenueByWeek(8),
    getTopProducts(5),
    getSalesOrders({ from, to }),
  ]);

  const exportHref = `/admin/sales/export${from || to ? `?${new URLSearchParams({ ...(from ? { from } : {}), ...(to ? { to } : {}) })}` : ''}`;
  const maxUnits = Math.max(1, ...top.map(t => t.units));

  return (
    <AdminShell session={session} active="/admin/sales">
      <div style={{ padding: 32 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 700, color: '#111110' }}>Sales</h1>
          <p style={{ color: '#888', fontSize: 14, marginTop: 2 }}>Revenue &amp; profit from delivered orders.</p>
        </div>

        {/* Metric cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
          <Stat label="Revenue (MTD)" value={money(stats.revenueMtd)} color="#111110" />
          <Stat label="Revenue (all-time)" value={money(stats.revenueAll)} color="#111110" />
          <Stat label="Units sold" value={String(stats.unitsSold)} color="#1B6FB4" />
          <Stat label="Gross margin" value={money(stats.margin)} sub={`cost ${money(stats.cost)}`} color="#1B8A4B" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          <Stat label="COD in transit" value={money(stats.codPending)} sub="to be collected" color="#B4791B" />
          <Stat label="Returns" value={String(stats.returnsCount)} sub={money(stats.returnsValue)} color={stats.returnsCount > 0 ? '#B43B3B' : '#888'} />
          <div style={{ gridColumn: 'span 2' }} />
        </div>

        {/* Revenue chart */}
        <div style={{ background: '#fff', border: '1px solid #e5e5e3', borderRadius: 14, padding: 20, marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 600, color: '#111110', marginBottom: 12 }}>Revenue — last 8 weeks</h2>
          <RevenueChart data={weekly} />
        </div>

        {/* Top products */}
        <div style={{ background: '#fff', border: '1px solid #e5e5e3', borderRadius: 14, padding: 20, marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 600, color: '#111110', marginBottom: 12 }}>Top products</h2>
          {top.length === 0 ? (
            <p style={{ fontSize: 13, color: '#888' }}>No delivered sales yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {top.map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 180, fontSize: 14, color: '#111110', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</div>
                  <div style={{ flex: 1, background: '#f5f5f3', borderRadius: 999, height: 10, overflow: 'hidden' }}>
                    <div style={{ width: `${(t.units / maxUnits) * 100}%`, background: '#FDEA0A', height: '100%', borderRadius: 999 }} />
                  </div>
                  <div style={{ width: 70, textAlign: 'right', fontSize: 13, fontWeight: 600, color: '#111110' }}>{t.units} units</div>
                  <div style={{ width: 110, textAlign: 'right', fontSize: 13, color: '#888' }}>{money(t.revenue)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Orders table */}
        <div style={{ background: '#fff', border: '1px solid #e5e5e3', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0ee', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 600, color: '#111110' }}>Orders</h2>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <form method="get" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input name="from" type="date" defaultValue={from ?? ''} style={smallInp} />
                <span style={{ color: '#aaa', fontSize: 13 }}>→</span>
                <input name="to" type="date" defaultValue={to ?? ''} style={smallInp} />
                <button type="submit" style={{ height: 38, padding: '0 14px', fontSize: 13, fontWeight: 600, border: '1.5px solid #e5e5e3', borderRadius: 10, background: '#fff', cursor: 'pointer' }}>Filter</button>
              </form>
              <a href={exportHref} style={{ height: 38, display: 'inline-flex', alignItems: 'center', padding: '0 14px', fontSize: 13, fontWeight: 600, border: '1.5px solid #e5e5e3', borderRadius: 10, background: '#fff', color: '#111110', textDecoration: 'none' }}>⬇ Export CSV</a>
            </div>
          </div>
          {orders.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', fontSize: 13, color: '#888' }}>No orders in this range.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e5e3', background: '#fafafa' }}>
                  {['Ref', 'Date', 'Customer', 'Status', 'Revenue', 'Cost', 'Margin'].map((h, i) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: i >= 4 ? 'right' : 'left', fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.ref} style={{ borderBottom: '1px solid #f0f0ee' }}>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--mono)', fontSize: 12, color: '#111110', whiteSpace: 'nowrap' }}>{o.ref}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#888', whiteSpace: 'nowrap' }}>{o.date.toLocaleDateString('en-LK', { day: 'numeric', month: 'short' })}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#111110' }}>{o.customer}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 999, color: STATUS_COLOR[o.status], background: STATUS_BG[o.status] }}>{STATUS_LABEL[o.status]}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, color: '#111110', textAlign: 'right', whiteSpace: 'nowrap' }}>{money(o.revenue)}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#888', textAlign: 'right', whiteSpace: 'nowrap' }}>{o.cost > 0 ? money(o.cost) : '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, color: o.cost > 0 ? '#1B8A4B' : '#aaa', textAlign: 'right', whiteSpace: 'nowrap' }}>{o.cost > 0 ? money(o.margin) : '—'}</td>
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

const smallInp: React.CSSProperties = {
  height: 38, padding: '0 10px', border: '1.5px solid #e5e5e3', borderRadius: 10,
  fontSize: 13, fontFamily: 'var(--font-body)', outline: 'none', background: '#fff',
};

function Stat({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e5e3', borderRadius: 12, padding: '18px 20px' }}>
      <div style={{ fontSize: 12, color: '#888', fontWeight: 500, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 22, fontFamily: 'var(--font-head)', fontWeight: 700, color, lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#aaa', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}
