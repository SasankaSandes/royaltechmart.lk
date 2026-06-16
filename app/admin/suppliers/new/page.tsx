import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
import { createSupplierAction } from '@/app/admin/actions';
import AdminShell from '@/components/AdminShell';

export default async function NewSupplierPage() {
  const session = await requireAdmin('owner');

  return (
    <AdminShell session={session} active="/admin/suppliers">
      <div style={{ padding: 32, maxWidth: 640 }}>
        <div style={{ marginBottom: 24 }}>
          <Link href="/admin/suppliers" style={{ fontSize: 13, color: '#888', textDecoration: 'none' }}>← Suppliers</Link>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 700, color: '#111110', marginTop: 8 }}>Add supplier</h1>
        </div>

        <form action={createSupplierAction} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card title="Contact">
            <Field label="Name *"><input name="name" required placeholder="e.g. Pettah Imports" style={inp} /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Phone"><input name="phone" placeholder="07X XXX XXXX" style={inp} /></Field>
              <Field label="WhatsApp"><input name="whatsapp" placeholder="07X XXX XXXX" style={inp} /></Field>
            </div>
            <Field label="Email"><input name="email" type="email" placeholder="supplier@example.com" style={inp} /></Field>
            <Field label="Address">
              <textarea name="address" rows={2} placeholder="Shop / warehouse address"
                style={{ ...inp, height: 'auto', paddingTop: 10, paddingBottom: 10, resize: 'vertical' }} />
            </Field>
            <Field label="Notes">
              <textarea name="notes" rows={2} placeholder="Anything to remember about this supplier"
                style={{ ...inp, height: 'auto', paddingTop: 10, paddingBottom: 10, resize: 'vertical' }} />
            </Field>
          </Card>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" style={{
              flex: 1, height: 48, background: '#111110', color: '#fff',
              border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer',
            }}>Add supplier</button>
            <Link href="/admin/suppliers" style={{
              height: 48, display: 'flex', alignItems: 'center', padding: '0 24px',
              border: '1.5px solid #e5e5e3', borderRadius: 10,
              fontSize: 14, fontWeight: 500, color: '#555', textDecoration: 'none',
            }}>Cancel</Link>
          </div>
        </form>
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
      <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
      {children}
    </div>
  );
}
