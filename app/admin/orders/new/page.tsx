import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
import { getAllProducts, getProductCostMap } from '@/lib/db';
import { itemCode } from '@/lib/catalog';
import { createOrderAction } from '@/app/admin/actions';
import AdminShell from '@/components/AdminShell';
import OrderItemsEditor from '@/components/OrderItemsEditor';
import OrderDeliveryFields from '@/components/OrderDeliveryFields';

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await requireAdmin();
  const { error } = await searchParams;
  const [products, costById] = await Promise.all([getAllProducts(), getProductCostMap()]);
  const pickerProducts = products.map(p => ({ id: p.id, name: p.name, price: p.price, code: itemCode(p.id) }));

  return (
    <AdminShell session={session} active="/admin/orders">
      <div style={{ padding: 32, maxWidth: 760 }}>
        <div style={{ marginBottom: 24 }}>
          <Link href="/admin/orders" style={{ fontSize: 13, color: '#888', textDecoration: 'none' }}>← Orders</Link>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 700, color: '#111110', marginTop: 8 }}>
            Log order
          </h1>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#991b1b' }}>
            Please add a customer name, phone, and at least one item.
          </div>
        )}

        {products.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #e5e5e3', borderRadius: 14, padding: 24, fontSize: 14, color: '#888' }}>
            You need at least one product in the catalog before logging an order.{' '}
            <Link href="/admin/products/new" style={{ color: '#111110', fontWeight: 600 }}>Add a product →</Link>
          </div>
        ) : (
          <form action={createOrderAction} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Card title="Customer">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Name *">
                  <input name="customer_name" required placeholder="e.g. Nimal Perera" style={inp} />
                </Field>
                <Field label="Phone *">
                  <input name="customer_phone" required placeholder="07X XXX XXXX" style={inp} />
                </Field>
              </div>
            </Card>

            <Card title="Delivery & payment">
              <OrderDeliveryFields />
            </Card>

            <Card title="Items">
              <OrderItemsEditor products={pickerProducts} costById={costById} />
            </Card>

            <Card title="Notes">
              <Field label="Internal notes (optional)">
                <textarea name="notes" rows={3} placeholder="Anything to remember for this order…"
                  style={{ ...inp, height: 'auto', paddingTop: 10, paddingBottom: 10, resize: 'vertical' }} />
              </Field>
            </Card>

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" style={{
                flex: 1, height: 48, background: '#111110', color: '#fff',
                border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer',
              }}>
                Log order
              </button>
              <Link href="/admin/orders" style={{
                height: 48, display: 'flex', alignItems: 'center', padding: '0 24px',
                border: '1.5px solid #e5e5e3', borderRadius: 10,
                fontSize: 14, fontWeight: 500, color: '#555', textDecoration: 'none',
              }}>
                Cancel
              </Link>
            </div>
          </form>
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
      <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      {children}
    </div>
  );
}
