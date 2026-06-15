import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';
import { getOrderByRef } from '@/lib/db';
import { money, itemCode, PHONE, WHATSAPP } from '@/lib/catalog';
import PrintOnLoad from '@/components/PrintOnLoad';

export default async function ReceiptPage({
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

  const dateStr = order.createdAt.toLocaleString('en-LK', {
    day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });

  return (
    <>
      {/* Receipt is sized for an 80mm thermal printer. */}
      <style>{`
        @page { size: 80mm auto; margin: 0; }
        html, body { margin: 0; padding: 0; background: #fff; }
        @media screen { body { background: #e5e5e3; } }
        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      `}</style>

      <div style={{
        width: '80mm', maxWidth: 302, margin: '0 auto', padding: '10px 12px',
        background: '#fff', color: '#000',
        fontFamily: 'var(--mono), ui-monospace, monospace', fontSize: 12, lineHeight: 1.5,
        boxSizing: 'border-box',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div style={{ fontFamily: 'var(--font-head), sans-serif', fontSize: 20, fontWeight: 800, letterSpacing: '0.04em' }}>NOVATEK</div>
          <div style={{ fontSize: 10, marginTop: 2 }}>Tech accessories · Sri Lanka</div>
          <div style={{ fontSize: 10 }}>{PHONE} · wa.me/{WHATSAPP}</div>
        </div>

        <Divider />

        <Line k="Receipt" v={order.ref} />
        <Line k="Date" v={dateStr} />
        <Line k="Customer" v={order.customerName} />
        <Line k="Phone" v={order.customerPhone} />

        <Divider />

        {order.items.map(it => (
          <div key={it.id} style={{ marginBottom: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <span>{it.name}</span>
              <span style={{ whiteSpace: 'nowrap' }}>{money(it.qty * it.unitPrice)}</span>
            </div>
            <div style={{ fontSize: 10, color: '#444' }}>{itemCode(it.productId)} · {it.qty} × {money(it.unitPrice)}</div>
          </div>
        ))}

        <Divider />

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 800 }}>
          <span>TOTAL</span>
          <span>{money(order.total)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span>Payment</span>
          <span style={{ fontWeight: 700 }}>{order.paymentType === 'cod' ? 'CASH ON DELIVERY' : 'PAID'}</span>
        </div>
        {order.paymentType === 'cod' && (
          <div style={{ textAlign: 'center', marginTop: 8, border: '1px dashed #000', padding: '6px 4px', fontWeight: 800, fontSize: 13 }}>
            COLLECT {money(order.total)}
          </div>
        )}

        <Divider />

        <div style={{ textAlign: 'center', fontSize: 11, marginTop: 4 }}>
          Thank you for shopping with Novatek!<br />
          Questions? WhatsApp {PHONE}
        </div>
      </div>

      {print === '1' && <PrintOnLoad />}
    </>
  );
}

function Line({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
      <span style={{ color: '#444' }}>{k}</span>
      <span style={{ textAlign: 'right', fontWeight: 600 }}>{v}</span>
    </div>
  );
}

function Divider() {
  return <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />;
}
