import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';
import { getSupplierById, getAllProducts, getProductCostMap } from '@/lib/db';
import { money, itemCode } from '@/lib/catalog';
import {
  updateSupplierAction, deleteSupplierAction, removeSupplierProductAction, createPurchaseAction,
} from '@/app/admin/actions';
import AdminShell from '@/components/AdminShell';
import SupplierProductAdder from '@/components/SupplierProductAdder';
import PurchaseItemsEditor from '@/components/PurchaseItemsEditor';

type Tab = 'contact' | 'products' | 'purchases';

export default async function SupplierDetailPage({
  params, searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await requireAdmin('owner');
  const { id } = await params;
  const { tab: tabParam } = await searchParams;
  const tab: Tab = (['contact', 'products', 'purchases'].includes(tabParam ?? '') ? tabParam : 'contact') as Tab;

  const supplier = await getSupplierById(Number(id));
  if (!supplier) notFound();

  const [products, costById] = await Promise.all([getAllProducts(), getProductCostMap()]);
  const pickerProducts = products.map(p => ({ id: p.id, name: p.name, code: itemCode(p.id) }));
  const linkedIds = new Set(supplier.products.map(p => p.productId));
  const unlinked = pickerProducts.filter(p => !linkedIds.has(p.id));

  const today = new Date().toISOString().slice(0, 10);

  return (
    <AdminShell session={session} active="/admin/suppliers">
      <div style={{ padding: 32, maxWidth: 860 }}>
        <div style={{ marginBottom: 16 }}>
          <Link href="/admin/suppliers" style={{ fontSize: 13, color: '#888', textDecoration: 'none' }}>← Suppliers</Link>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 700, color: '#111110', marginTop: 8 }}>{supplier.name}</h1>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, borderBottom: '1px solid #e5e5e3' }}>
          {([['contact', 'Contact'], ['products', `Products (${supplier.products.length})`], ['purchases', `Purchases (${supplier.purchases.length})`]] as const).map(([key, label]) => {
            const active = tab === key;
            return (
              <Link key={key} href={`/admin/suppliers/${supplier.id}?tab=${key}`} style={{
                padding: '10px 16px', fontSize: 14, fontWeight: active ? 600 : 500, textDecoration: 'none',
                color: active ? '#111110' : '#888',
                borderBottom: active ? '2px solid #111110' : '2px solid transparent', marginBottom: -1,
              }}>{label}</Link>
            );
          })}
        </div>

        {tab === 'contact' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <form action={updateSupplierAction} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <input type="hidden" name="id" value={supplier.id} />
              <Card title="Contact">
                <Field label="Name *"><input name="name" required defaultValue={supplier.name} style={inp} /></Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="Phone"><input name="phone" defaultValue={supplier.phone ?? ''} style={inp} /></Field>
                  <Field label="WhatsApp"><input name="whatsapp" defaultValue={supplier.whatsapp ?? ''} style={inp} /></Field>
                </div>
                <Field label="Email"><input name="email" type="email" defaultValue={supplier.email ?? ''} style={inp} /></Field>
                <Field label="Address">
                  <textarea name="address" rows={2} defaultValue={supplier.address ?? ''}
                    style={{ ...inp, height: 'auto', paddingTop: 10, paddingBottom: 10, resize: 'vertical' }} />
                </Field>
                <Field label="Notes">
                  <textarea name="notes" rows={2} defaultValue={supplier.notes ?? ''}
                    style={{ ...inp, height: 'auto', paddingTop: 10, paddingBottom: 10, resize: 'vertical' }} />
                </Field>
              </Card>
              <div>
                <button type="submit" style={primaryBtn}>Save changes</button>
              </div>
            </form>

            <form action={deleteSupplierAction}>
              <input type="hidden" name="id" value={supplier.id} />
              <button type="submit" style={{
                height: 40, padding: '0 16px', background: '#fff', color: '#B43B3B',
                border: '1.5px solid #f0c5c5', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>Delete supplier</button>
            </form>
          </div>
        )}

        {tab === 'products' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card title="Add product cost">
              <SupplierProductAdder supplierId={supplier.id} products={unlinked} />
            </Card>
            <div style={{ background: '#fff', border: '1px solid #e5e5e3', borderRadius: 14, overflow: 'hidden' }}>
              {supplier.products.length === 0 ? (
                <div style={{ padding: '32px 20px', textAlign: 'center', fontSize: 13, color: '#888' }}>
                  No products linked yet. Add one above to record its cost price.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e5e3', background: '#fafafa' }}>
                      {['Code', 'Product', 'Supplier code', 'Cost', ''].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {supplier.products.map(sp => (
                      <tr key={sp.productId} style={{ borderBottom: '1px solid #f0f0ee' }}>
                        <td style={{ padding: '12px 16px', fontFamily: 'var(--mono)', fontSize: 12, color: '#888' }}>{itemCode(sp.productId)}</td>
                        <td style={{ padding: '12px 16px', fontSize: 14, color: '#111110' }}>{sp.name}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#888' }}>{sp.supplierProductCode || '—'}</td>
                        <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, color: '#111110' }}>{money(sp.costPrice)}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <form action={removeSupplierProductAction} style={{ display: 'inline' }}>
                            <input type="hidden" name="supplier_id" value={supplier.id} />
                            <input type="hidden" name="product_id" value={sp.productId} />
                            <button type="submit" style={{
                              fontSize: 13, color: '#B43B3B', background: 'transparent',
                              border: '1.5px solid #f0c5c5', borderRadius: 8, padding: '5px 12px', cursor: 'pointer',
                            }}>Remove</button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {tab === 'purchases' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card title="Log purchase">
              <form action={createPurchaseAction} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <input type="hidden" name="supplier_id" value={supplier.id} />
                <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 12 }}>
                  <Field label="Date"><input name="date" type="date" defaultValue={today} style={inp} /></Field>
                </div>
                <PurchaseItemsEditor products={pickerProducts} costById={costById} />
                <Field label="Notes">
                  <textarea name="notes" rows={2} placeholder="Optional"
                    style={{ ...inp, height: 'auto', paddingTop: 10, paddingBottom: 10, resize: 'vertical' }} />
                </Field>
                <div><button type="submit" style={primaryBtn}>Save purchase</button></div>
              </form>
            </Card>

            <div style={{ background: '#fff', border: '1px solid #e5e5e3', borderRadius: 14, overflow: 'hidden' }}>
              {supplier.purchases.length === 0 ? (
                <div style={{ padding: '32px 20px', textAlign: 'center', fontSize: 13, color: '#888' }}>No purchases logged yet.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e5e3', background: '#fafafa' }}>
                      {['Date', 'Items', 'Total', 'Notes'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {supplier.purchases.map(pu => (
                      <tr key={pu.id} style={{ borderBottom: '1px solid #f0f0ee', verticalAlign: 'top' }}>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#888', whiteSpace: 'nowrap' }}>
                          {pu.date.toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#555' }}>
                          {pu.items.map(it => (
                            <div key={it.id}>{it.qty} × {it.name} @ {money(it.unitCost)}</div>
                          ))}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, color: '#111110', whiteSpace: 'nowrap' }}>{money(pu.total)}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#888' }}>{pu.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

const inp: React.CSSProperties = {
  width: '100%', height: 44, padding: '0 12px',
  border: '1.5px solid #e5e5e3', borderRadius: 10,
  fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none',
  background: '#fff', boxSizing: 'border-box',
};
const primaryBtn: React.CSSProperties = {
  height: 48, padding: '0 28px', background: '#111110', color: '#fff',
  border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer',
};

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e5e3', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0ee', background: '#fafafa' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#111110' }}>{title}</span>
      </div>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
      {children}
    </div>
  );
}
