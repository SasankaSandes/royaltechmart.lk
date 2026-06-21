import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
import { getOrdersForSourcing, getAllProducts } from '@/lib/db';
import { reconcileInvoiceAction } from '@/app/admin/actions';
import AdminShell from '@/components/AdminShell';
import { money } from '@/lib/catalog';

export default async function ReconcilePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; saved?: string }>;
}) {
  const session = await requireAdmin();
  const { date: rawDate, saved } = await searchParams;
  const today = new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const date = rawDate || today;

  const [items, allProducts] = await Promise.all([
    getOrdersForSourcing(date),
    getAllProducts(),
  ]);

  // Group by assigned supplier (id + name)
  type SupplierGroup = {
    supplierId: number;
    supplierName: string;
    items: typeof items;
  };
  const bySupplier = new Map<number, SupplierGroup>();
  const unassigned: typeof items = [];

  for (const item of items) {
    if (!item.currentSupplierId) {
      unassigned.push(item);
      continue;
    }
    const sup = item.suppliers.find(s => s.supplierId === item.currentSupplierId);
    if (!sup) { unassigned.push(item); continue; }
    if (!bySupplier.has(item.currentSupplierId)) {
      bySupplier.set(item.currentSupplierId, {
        supplierId: item.currentSupplierId,
        supplierName: sup.supplierName,
        items: [],
      });
    }
    bySupplier.get(item.currentSupplierId)!.items.push(item);
  }

  const savedSupplier = saved ? decodeURIComponent(saved) : null;

  return (
    <AdminShell session={session} active="/admin/sourcing">
      <div style={{ padding: 32, maxWidth: 900 }}>
        <div style={{ marginBottom: 8 }}>
          <Link href={`/admin/sourcing/slip?date=${date}`} style={{ fontSize: 13, color: '#888', textDecoration: 'none' }}>
            ← Back to slip
          </Link>
        </div>
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 700, color: '#111110' }}>
            Reconcile Invoices
          </h1>
          <span style={{ fontSize: 13, color: '#888' }}>{date}</span>
        </div>

        {items.length === 0 && (
          <div style={{
            background: '#fff', border: '1px solid #e5e5e3', borderRadius: 14,
            padding: 40, textAlign: 'center', color: '#aaa', fontSize: 14,
          }}>
            No sourced orders found for {date}.{' '}
            <Link href={`/admin/sourcing?date=${date}`} style={{ color: '#888' }}>Open sourcing builder →</Link>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {Array.from(bySupplier.values()).map(group => {
            const isSaved = savedSupplier === group.supplierName;
            return (
              <form key={group.supplierId} action={reconcileInvoiceAction}>
                <input type="hidden" name="supplier_id" value={group.supplierId} />
                <input type="hidden" name="supplier_name" value={group.supplierName} />
                <input type="hidden" name="redirect_date" value={date} />

                <div style={{ background: '#fff', border: `1px solid ${isSaved ? '#22c55e' : '#e5e5e3'}`, borderRadius: 14, overflow: 'hidden' }}>
                  {/* Card header */}
                  <div style={{
                    padding: '14px 20px', borderBottom: '1px solid #f0f0ee', background: '#fafafa',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: '#111110' }}>{group.supplierName}</span>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: '#888' }}>{group.items.length} item{group.items.length !== 1 ? 's' : ''}</span>
                      {isSaved && (
                        <span style={{
                          fontSize: 12, fontWeight: 700, color: '#16a34a',
                          background: '#dcfce7', borderRadius: 6, padding: '3px 10px',
                        }}>✓ Invoice saved</span>
                      )}
                    </div>
                  </div>

                  <div style={{ padding: 20 }}>
                    {/* Invoice fields */}
                    <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                      <div style={{ flex: '1 1 200px' }}>
                        <label style={lbl}>Invoice ref / number</label>
                        <input name="invoice_ref" placeholder="e.g. INV-2026-0042" style={inp} />
                      </div>
                      <div style={{ flex: '0 1 160px' }}>
                        <label style={lbl}>Invoice date</label>
                        <input name="invoice_date" type="date" defaultValue={date} style={inp} />
                      </div>
                    </div>

                    {/* Sourced items */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, marginBottom: 20 }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #f0f0ee' }}>
                          <th style={th}>Product</th>
                          <th style={{ ...th, width: 60, textAlign: 'center' }}>Qty</th>
                          <th style={{ ...th, width: 160 }}>Actual cost (Rs.)</th>
                          <th style={th}>Order</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.items.map((item, idx) => {
                          const sup = item.suppliers.find(s => s.supplierId === item.currentSupplierId);
                          return (
                            <tr key={item.orderItemId} style={{ borderBottom: '1px solid #f8f8f6' }}>
                              <td style={td}>
                                <input type="hidden" name={`item_${idx}_order_item_id`} value={item.orderItemId} />
                                <input type="hidden" name={`item_${idx}_product_id`} value={item.productId} />
                                <input type="hidden" name={`item_${idx}_qty`} value={item.qty} />
                                <strong>{item.productName}</strong>
                              </td>
                              <td style={{ ...td, textAlign: 'center', color: '#888' }}>× {item.qty}</td>
                              <td style={td}>
                                <input
                                  name={`item_${idx}_unit_cost`}
                                  type="number"
                                  min={0}
                                  required
                                  defaultValue={sup?.costPrice ?? item.suppliers[0]?.costPrice ?? ''}
                                  placeholder="0"
                                  style={{ ...inp, width: 130, marginBottom: 0 }}
                                />
                              </td>
                              <td style={{ ...td, fontSize: 13, color: '#888' }}>
                                <span style={{ fontFamily: 'var(--mono)' }}>{item.orderRef}</span>
                                <span style={{ marginLeft: 8 }}>{item.customerName}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Extra items */}
                    <div style={{ borderTop: '1px solid #f0f0ee', paddingTop: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                        Extra items (not from this slip)
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {[0, 1, 2].map(j => (
                          <div key={j} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <select name={`extra_${j}_product_id`} style={{ ...inp, flex: '1 1 200px', cursor: 'pointer', marginBottom: 0 }}>
                              <option value="">— Select product —</option>
                              {allProducts.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                            <input name={`extra_${j}_qty`} type="number" min={1} placeholder="Qty" defaultValue={1} style={{ ...inp, width: 70, marginBottom: 0 }} />
                            <input name={`extra_${j}_unit_cost`} type="number" min={0} placeholder="Cost" style={{ ...inp, width: 110, marginBottom: 0 }} />
                          </div>
                        ))}
                      </div>
                    </div>

                    <button type="submit" style={{
                      marginTop: 20, height: 44, padding: '0 24px',
                      background: '#111110', color: '#fff',
                      border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    }}>
                      Save {group.supplierName} invoice
                    </button>
                  </div>
                </div>
              </form>
            );
          })}

          {/* Unassigned items */}
          {unassigned.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #e5e5e3', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0ee', background: '#fffbeb' }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: '#92400e' }}>Unassigned — {unassigned.length} item{unassigned.length !== 1 ? 's' : ''}</span>
              </div>
              <div style={{ padding: '14px 20px', fontSize: 13, color: '#888' }}>
                These items have no supplier assigned.{' '}
                <Link href={`/admin/sourcing?date=${date}`} style={{ color: '#111110', fontWeight: 600 }}>
                  Go back to sourcing builder to assign suppliers →
                </Link>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <tbody>
                  {unassigned.map(item => (
                    <tr key={item.orderItemId} style={{ borderBottom: '1px solid #f8f8f6' }}>
                      <td style={td}>{item.productName}</td>
                      <td style={{ ...td, color: '#888' }}>× {item.qty}</td>
                      <td style={{ ...td, fontSize: 13, color: '#aaa' }}>{item.orderRef}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}

const lbl: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: '#666',
  display: 'block', marginBottom: 6,
  textTransform: 'uppercase', letterSpacing: '0.06em',
};
const inp: React.CSSProperties = {
  width: '100%', height: 40, padding: '0 12px',
  border: '1.5px solid #e5e5e3', borderRadius: 10,
  fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none',
  background: '#fff', boxSizing: 'border-box', marginBottom: 0,
};
const th: React.CSSProperties = {
  textAlign: 'left', padding: '9px 12px',
  fontSize: 11, fontWeight: 600, color: '#888',
  textTransform: 'uppercase', letterSpacing: '0.06em',
};
const td: React.CSSProperties = { padding: '11px 12px', verticalAlign: 'middle' };
