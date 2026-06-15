import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';
import { getOrderByRef } from '@/lib/db';
import { money, itemCode, PHONE, WHATSAPP } from '@/lib/catalog';
import PrintOnLoad from '@/components/PrintOnLoad';

export default async function SlipPage({
  params,
  searchParams,
}: {
  params: Promise<{ ref: string }>;
  searchParams: Promise<{ print?: string }>;
}) {
  await requireAdmin();
  const { ref } = await params;
  const { print } = await searchParams;
  const order = await getOrderByRef(ref);
  if (!order) notFound();

  const dateStr = order.createdAt.toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <>
      {/* Delivery slip sized for A5. */}
      <style>{`
        @page { size: A5; margin: 12mm; }
        html, body { margin: 0; padding: 0; background: #fff; }
        @media screen { body { background: #e5e5e3; padding: 24px 0; } }
        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      `}</style>

      <div style={{
        width: '148mm', maxWidth: 560, margin: '0 auto', padding: '18mm 16mm',
        background: '#fff', color: '#000', boxSizing: 'border-box',
        fontFamily: 'var(--font-body), sans-serif', fontSize: 13, lineHeight: 1.5,
      }}>
        {/* Header: sender / return address */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #000', paddingBottom: 10, marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-head), sans-serif', fontSize: 24, fontWeight: 800, letterSpacing: '0.03em' }}>NOVATEK</div>
            <div style={{ fontSize: 11, color: '#333' }}>Tech accessories · Sri Lanka</div>
            <div style={{ fontSize: 11, color: '#333' }}>Sender: {PHONE} · wa.me/{WHATSAPP}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Delivery Slip</div>
            <div style={{ fontFamily: 'var(--mono), monospace', fontSize: 18, fontWeight: 700 }}>{order.ref}</div>
            <div style={{ fontSize: 11, color: '#666' }}>{dateStr}</div>
          </div>
        </div>

        {/* Deliver to */}
        <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Deliver to</div>
        <div style={{ border: '1.5px solid #000', borderRadius: 8, padding: 14, marginBottom: 16 }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{order.customerName}</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2 }}>{order.customerPhone}</div>
          {order.address && <div style={{ fontSize: 14, marginTop: 8, whiteSpace: 'pre-wrap' }}>{order.address}</div>}
          {(order.city || order.postalCode) && (
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>
              {order.city}{order.postalCode ? `  ${order.postalCode}` : ''}
            </div>
          )}
          {(order.courierName || order.trackingNumber) && (
            <div style={{ fontSize: 12, color: '#444', marginTop: 8 }}>
              {order.courierName && <>Courier: {order.courierName}</>}
              {order.courierName && order.trackingNumber && ' · '}
              {order.trackingNumber && <>Tracking: <strong>{order.trackingNumber}</strong></>}
            </div>
          )}
        </div>

        {/* COD box */}
        {order.paymentType === 'cod' ? (
          <div style={{ border: '2px solid #000', borderRadius: 8, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Collect (COD)</span>
            <span style={{ fontFamily: 'var(--font-head), sans-serif', fontSize: 28, fontWeight: 800 }}>{money(order.total)}</span>
          </div>
        ) : (
          <div style={{ border: '1.5px solid #000', borderRadius: 8, padding: '10px 16px', marginBottom: 16, textAlign: 'center', fontWeight: 700, fontSize: 14 }}>
            PREPAID — do not collect cash
          </div>
        )}

        {/* Items summary */}
        <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Contents</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {order.items.map(it => (
              <tr key={it.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '6px 0', fontFamily: 'var(--mono), monospace', fontSize: 11, color: '#555', width: 80 }}>{itemCode(it.productId)}</td>
                <td style={{ padding: '6px 0', fontSize: 13 }}>{it.name}</td>
                <td style={{ padding: '6px 0', fontSize: 13, textAlign: 'right', width: 40 }}>×{it.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 20, fontSize: 11, color: '#666', textAlign: 'center' }}>
          Returns / issues: WhatsApp {PHONE} quoting {order.ref}
        </div>
      </div>

      {print === '1' && <PrintOnLoad />}
    </>
  );
}
