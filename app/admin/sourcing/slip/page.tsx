import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
import { getOrdersForSourcing, getProductSuppliers } from '@/lib/db';
import { money } from '@/lib/catalog';
import PrintButton from './PrintButton';

export default async function SourcingSlipPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  await requireAdmin();
  const { date: rawDate } = await searchParams;
  const today = new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const date = rawDate || today;

  const items = await getOrdersForSourcing(date);

  // Build backup supplier map: product_id → second cheapest supplier name + cost
  const backupMap = new Map<number, { name: string; cost: number }>();
  const uniqueProductIds = [...new Set(items.map(i => i.productId))];
  await Promise.all(uniqueProductIds.map(async pid => {
    const suppliers = await getProductSuppliers(pid);
    if (suppliers.length >= 2) {
      backupMap.set(pid, { name: suppliers[1].supplierName, cost: suppliers[1].costPrice });
    }
  }));

  // Group assigned items by supplier name (items with no supplier go to "Unassigned")
  const bySupplier = new Map<string, {
    whatsapp?: string;
    phone?: string;
    items: {
      orderRef: string;
      customerName: string;
      productName: string;
      qty: number;
      costPrice?: number;
      backup?: { name: string; cost: number };
    }[];
  }>();

  for (const item of items) {
    const assigned = item.suppliers.find(s => s.supplierId === item.currentSupplierId);
    const supplierName = assigned?.supplierName ?? 'Unassigned';
    if (!bySupplier.has(supplierName)) {
      bySupplier.set(supplierName, { items: [] });
    }
    bySupplier.get(supplierName)!.items.push({
      orderRef: item.orderRef,
      customerName: item.customerName,
      productName: item.productName,
      qty: item.qty,
      costPrice: assigned?.costPrice,
      backup: backupMap.get(item.productId),
    });
  }

  const printDate = new Date(date + 'T00:00:00').toLocaleDateString('en-LK', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .supplier-section { page-break-inside: avoid; }
        }
        body { font-family: system-ui, sans-serif; background: #F5F5F3; }
      `}</style>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: 32 }}>
        {/* Actions bar */}
        <div className="no-print" style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center' }}>
          <Link href={`/admin/sourcing?date=${date}`} style={{
            fontSize: 13, color: '#888', textDecoration: 'none',
            border: '1.5px solid #e5e5e3', borderRadius: 8, padding: '8px 16px', background: '#fff',
          }}>
            ← Back to builder
          </Link>
          <Link href={`/admin/sourcing/reconcile?date=${date}`} style={{
            height: 38, display: 'inline-flex', alignItems: 'center', padding: '0 18px',
            background: '#FDEA0A', color: '#111110', border: 'none', borderRadius: 8,
            fontSize: 13, fontWeight: 700, textDecoration: 'none',
          }}>
            Reconcile invoices →
          </Link>
          <PrintButton />
        </div>

        {/* Slip header */}
        <div style={{ background: '#fff', border: '1px solid #e5e5e3', borderRadius: 14, padding: '20px 24px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 20, color: '#111110', letterSpacing: '-0.5px' }}>
                Novatek — Sourcing Slip
              </div>
              <div style={{ fontSize: 14, color: '#888', marginTop: 4 }}>{printDate}</div>
            </div>
            <div style={{ fontSize: 13, color: '#888', textAlign: 'right' }}>
              {items.length} item{items.length !== 1 ? 's' : ''} · {bySupplier.size} supplier{bySupplier.size !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Per-supplier sections */}
        {Array.from(bySupplier.entries()).map(([supplierName, group]) => (
          <div key={supplierName} className="supplier-section" style={{
            background: '#fff', border: '1px solid #e5e5e3', borderRadius: 14,
            overflow: 'hidden', marginBottom: 16,
          }}>
            <div style={{
              padding: '14px 20px', borderBottom: '1px solid #f0f0ee', background: '#fafafa',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 15, color: '#111110' }}>{supplierName}</span>
                {group.whatsapp && (
                  <span style={{ fontSize: 13, color: '#888', marginLeft: 12 }}>WhatsApp: {group.whatsapp}</span>
                )}
                {!group.whatsapp && group.phone && (
                  <span style={{ fontSize: 13, color: '#888', marginLeft: 12 }}>{group.phone}</span>
                )}
              </div>
              <span style={{ fontSize: 13, color: '#888' }}>{group.items.length} item{group.items.length !== 1 ? 's' : ''}</span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f0f0ee' }}>
                  <th style={th}>Product</th>
                  <th style={{ ...th, width: 50, textAlign: 'center' }}>Qty</th>
                  <th style={{ ...th, width: 110 }}>Cost</th>
                  <th style={th}>Order</th>
                  <th style={th}>Backup supplier</th>
                </tr>
              </thead>
              <tbody>
                {group.items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f8f8f6' }}>
                    <td style={td}><strong>{item.productName}</strong></td>
                    <td style={{ ...td, textAlign: 'center', fontWeight: 700 }}>{item.qty}</td>
                    <td style={{ ...td, fontFamily: 'monospace', fontSize: 13 }}>
                      {item.costPrice != null ? `Rs. ${money(item.costPrice)}` : <span style={{ color: '#bbb' }}>—</span>}
                    </td>
                    <td style={{ ...td, fontSize: 13 }}>
                      <span style={{ fontFamily: 'monospace' }}>{item.orderRef}</span>
                      <span style={{ color: '#aaa', marginLeft: 8 }}>{item.customerName}</span>
                    </td>
                    <td style={{ ...td, fontSize: 12, color: '#888' }}>
                      {item.backup ? (
                        <span>
                          {item.backup.name}
                          <span style={{ color: '#aaa', marginLeft: 6 }}>Rs. {money(item.backup.cost)}</span>
                        </span>
                      ) : (
                        <span style={{ color: '#ddd' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {items.length === 0 && (
          <div style={{
            background: '#fff', border: '1px solid #e5e5e3', borderRadius: 14,
            padding: 40, textAlign: 'center', color: '#aaa', fontSize: 14,
          }}>
            No orders for {date}.
          </div>
        )}
      </div>
    </>
  );
}

const th: React.CSSProperties = {
  textAlign: 'left', padding: '9px 16px',
  fontSize: 11, fontWeight: 600, color: '#888',
  textTransform: 'uppercase', letterSpacing: '0.06em',
};

const td: React.CSSProperties = {
  padding: '11px 16px', verticalAlign: 'middle',
};
