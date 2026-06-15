import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';
import { getOrderByRef } from '@/lib/db';
import { money, itemCode } from '@/lib/catalog';
import { updateOrderStatusAction, updateOrderDeliveryAction } from '@/app/admin/actions';
import { STATUS_LABEL, STATUS_COLOR, STATUS_BG, STATUS_ORDER } from '@/lib/orders-ui';
import AdminShell from '@/components/AdminShell';

export default async function OrderDetailPage({ params }: { params: Promise<{ ref: string }> }) {
  const session = await requireAdmin();
  const { ref } = await params;
  const order = await getOrderByRef(ref);
  if (!order) notFound();

  const dateStr = order.createdAt.toLocaleString('en-LK', {
    day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });

  return (
    <AdminShell session={session} active="/admin/orders">
      <div style={{ padding: 32, maxWidth: 820 }}>
        <div style={{ marginBottom: 20 }}>
          <Link href="/admin/orders" style={{ fontSize: 13, color: '#888', textDecoration: 'none' }}>← Orders</Link>
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 700, color: '#111110' }}>
              {order.ref}
            </h1>
            <span style={{
              fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 999,
              color: STATUS_COLOR[order.status], background: STATUS_BG[order.status],
            }}>{STATUS_LABEL[order.status]}</span>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999,
              color: order.paymentType === 'cod' ? '#B4791B' : '#1B8A4B',
              background: order.paymentType === 'cod' ? '#fef3c7' : '#d1fae5',
            }}>{order.paymentType === 'cod' ? 'COD' : 'Paid'}</span>
          </div>
          <p style={{ color: '#888', fontSize: 13, marginTop: 6 }}>Logged {dateStr}</p>
        </div>

        {/* Action bar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <form action={updateOrderStatusAction} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="hidden" name="ref" value={order.ref} />
            <input type="hidden" name="redirect_to" value={`/admin/orders/${order.ref}`} />
            <select name="status" defaultValue={order.status} style={{
              height: 40, padding: '0 12px', border: '1.5px solid #e5e5e3', borderRadius: 10,
              fontSize: 14, fontFamily: 'var(--font-body)', background: '#fff', cursor: 'pointer',
            }}>
              {STATUS_ORDER.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
            <button type="submit" style={{
              height: 40, padding: '0 18px', background: '#111110', color: '#fff',
              border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>Update status</button>
          </form>
          <div style={{ flex: 1 }} />
          <a href={`/admin/orders/${order.ref}/receipt?print=1`} target="_blank" rel="noopener noreferrer" style={printBtn}>
            🧾 Print receipt
          </a>
          <a href={`/admin/orders/${order.ref}/slip?print=1`} target="_blank" rel="noopener noreferrer" style={printBtn}>
            📦 Print delivery slip
          </a>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <Card title="Customer">
            <Row label="Name" value={order.customerName} />
            <Row label="Phone" value={order.customerPhone} />
          </Card>
          <Card title="Delivery">
            <Row label="Method" value={order.deliveryMethod === 'courier' ? 'Courier' : 'Self pickup'} />
            {order.deliveryMethod === 'courier' && <Row label="Courier" value={order.courierName || '—'} />}
            {order.deliveryMethod === 'courier' && <Row label="Tracking" value={order.trackingNumber || '—'} />}
            {order.deliveryMethod === 'courier' && <Row label="Address" value={order.address || '—'} />}
            {order.deliveryMethod === 'courier' && <Row label="City" value={order.city ? `${order.city}${order.postalCode ? ` ${order.postalCode}` : ''}` : '—'} />}
            <Row label="Payment" value={order.paymentType === 'cod' ? 'Cash on delivery' : 'Paid'} />
          </Card>
        </div>

        {order.deliveryMethod === 'courier' && (
          <div style={{ marginBottom: 16 }}>
            <Card title="Courier & tracking">
              <form action={updateOrderDeliveryAction} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <input type="hidden" name="ref" value={order.ref} />
                <div style={{ flex: '1 1 180px' }}>
                  <label style={fieldLabel}>Courier name</label>
                  <input name="courier_name" defaultValue={order.courierName ?? ''} placeholder="e.g. Pronto" style={editInp} />
                </div>
                <div style={{ flex: '1 1 180px' }}>
                  <label style={fieldLabel}>Tracking number</label>
                  <input name="tracking_number" defaultValue={order.trackingNumber ?? ''} placeholder="AWB / tracking no." style={editInp} />
                </div>
                <button type="submit" style={{
                  height: 44, padding: '0 18px', background: '#111110', color: '#fff',
                  border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}>Save</button>
              </form>
            </Card>
          </div>
        )}

        <Card title="Items">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f0f0ee' }}>
                {['Code', 'Product', 'Qty', 'Unit', 'Total'].map((h, i) => (
                  <th key={h} style={{ padding: '0 0 10px', textAlign: i >= 2 ? 'right' : 'left', fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {order.items.map(it => (
                <tr key={it.id} style={{ borderBottom: '1px solid #f5f5f3' }}>
                  <td style={{ padding: '12px 0', fontFamily: 'var(--mono)', fontSize: 12, color: '#888' }}>{itemCode(it.productId)}</td>
                  <td style={{ padding: '12px 0', fontSize: 14, color: '#111110', fontWeight: 500 }}>{it.name}</td>
                  <td style={{ padding: '12px 0', fontSize: 14, color: '#555', textAlign: 'right' }}>{it.qty}</td>
                  <td style={{ padding: '12px 0', fontSize: 14, color: '#555', textAlign: 'right' }}>{money(it.unitPrice)}</td>
                  <td style={{ padding: '12px 0', fontSize: 14, fontWeight: 600, color: '#111110', textAlign: 'right' }}>{money(it.qty * it.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} style={{ padding: '14px 0 0', textAlign: 'right', fontSize: 14, color: '#888' }}>Total</td>
                <td style={{ padding: '14px 0 0', textAlign: 'right', fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-head)', color: '#111110' }}>{money(order.total)}</td>
              </tr>
            </tfoot>
          </table>
        </Card>

        {order.notes && (
          <div style={{ marginTop: 16 }}>
            <Card title="Notes">
              <p style={{ fontSize: 14, color: '#555', whiteSpace: 'pre-wrap', margin: 0 }}>{order.notes}</p>
            </Card>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

const fieldLabel: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: '#666', display: 'block',
  marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em',
};
const editInp: React.CSSProperties = {
  width: '100%', height: 44, padding: '0 12px',
  border: '1.5px solid #e5e5e3', borderRadius: 10,
  fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none',
  background: '#fff', boxSizing: 'border-box',
};

const printBtn: React.CSSProperties = {
  height: 40, display: 'inline-flex', alignItems: 'center', padding: '0 16px',
  border: '1.5px solid #e5e5e3', borderRadius: 10, background: '#fff',
  fontSize: 14, fontWeight: 600, color: '#111110', textDecoration: 'none',
};

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e5e3', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0ee', background: '#fafafa' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#111110' }}>{title}</span>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '5px 0' }}>
      <span style={{ fontSize: 13, color: '#888', width: 70, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 14, color: '#111110', fontWeight: 500 }}>{value}</span>
    </div>
  );
}
