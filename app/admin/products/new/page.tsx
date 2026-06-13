import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
import { addProductAction } from '@/app/admin/actions';
import AdminShell from '@/components/AdminShell';
import SpecsEditor from '@/components/SpecsEditor';
import { CATEGORIES } from '@/lib/catalog';

export default async function NewProductPage() {
  const session = await requireAdmin();

  return (
    <AdminShell session={session} active="/admin/products">
      <div style={{ padding: 32, maxWidth: 720 }}>
        <div style={{ marginBottom: 24 }}>
          <Link href="/admin/products" style={{ fontSize: 13, color: '#888', textDecoration: 'none' }}>← Products</Link>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 700, color: '#111110', marginTop: 8 }}>
            Add new product
          </h1>
        </div>

        <form action={addProductAction} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card title="Basic info">
            <Field label="Product name *">
              <input name="name" required placeholder="e.g. Redmi Buds 5 Pro" style={inp} />
            </Field>
            <Field label="Category *">
              <select name="category" required style={{ ...inp, cursor: 'pointer' }}>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Short description *">
              <textarea name="short" required rows={3} placeholder="One or two sentences shown on the product card and page."
                style={{ ...inp, height: 'auto', paddingTop: 10, paddingBottom: 10, resize: 'vertical' }} />
            </Field>
          </Card>

          <Card title="Pricing">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Selling price (Rs.) *">
                <input name="price" type="number" required min={0} placeholder="4500" style={inp} />
              </Field>
              <Field label="Original price (Rs.) — shows crossed-out">
                <input name="old_price" type="number" min={0} placeholder="Leave blank to hide" style={inp} />
              </Field>
            </div>
          </Card>

          <Card title="Status & badge">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Stock status *">
                <select name="stock" defaultValue="in" style={{ ...inp, cursor: 'pointer' }}>
                  <option value="in">In stock</option>
                  <option value="low">Low stock</option>
                  <option value="out">Out of stock</option>
                </select>
              </Field>
              <Field label="Badge">
                <select name="badge" defaultValue="" style={{ ...inp, cursor: 'pointer' }}>
                  <option value="">None</option>
                  <option value="Trending">Trending</option>
                  <option value="Featured">Featured</option>
                  <option value="New">New</option>
                </select>
              </Field>
            </div>
            <Field label="Warranty">
              <select name="warranty" defaultValue="1 Year Warranty" style={{ ...inp, cursor: 'pointer' }}>
                <option>1 Year Warranty</option>
                <option>6 Months Warranty</option>
                <option>No Warranty</option>
              </select>
            </Field>
          </Card>

          <Card title="Product image">
            <Field label="Image URL">
              <input name="image" type="url" placeholder="https://... (paste image URL; download to /public/products/ for production)"
                style={inp} />
            </Field>
            <p style={{ fontSize: 12, color: '#aaa', marginTop: 6 }}>
              For production: download the image and place it at <code style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>/public/products/&lt;id&gt;.jpg</code>. Then update the image field to <code style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>/products/&lt;id&gt;.jpg</code>.
            </p>
          </Card>

          <Card title="Card colours">
            <p style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>The two-tone gradient on the product card background.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="From colour">
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input name="tone_from" type="color" defaultValue="#FDEA0A"
                    style={{ width: 40, height: 38, padding: 2, border: '1.5px solid #e5e5e3', borderRadius: 8, cursor: 'pointer' }} />
                  <input name="tone_from_text" type="text" defaultValue="#FDEA0A"
                    placeholder="#FDEA0A" style={{ ...inp, flex: 1 }} />
                </div>
              </Field>
              <Field label="To colour">
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input name="tone_to" type="color" defaultValue="#222222"
                    style={{ width: 40, height: 38, padding: 2, border: '1.5px solid #e5e5e3', borderRadius: 8, cursor: 'pointer' }} />
                  <input name="tone_to_text" type="text" defaultValue="#222222"
                    placeholder="#222222" style={{ ...inp, flex: 1 }} />
                </div>
              </Field>
            </div>
          </Card>

          <Card title="Specifications">
            <p style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>Key-value pairs shown in the spec table on the product page.</p>
            <SpecsEditor initial={[]} />
          </Card>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" style={{
              flex: 1, height: 48, background: '#111110', color: '#fff',
              border: 'none', borderRadius: 10,
              fontWeight: 700, fontSize: 15, cursor: 'pointer',
            }}>
              Add product
            </button>
            <Link href="/admin/products" style={{
              height: 48, display: 'flex', alignItems: 'center', padding: '0 24px',
              border: '1.5px solid #e5e5e3', borderRadius: 10,
              fontSize: 14, fontWeight: 500, color: '#555', textDecoration: 'none',
            }}>
              Cancel
            </Link>
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
      <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      {children}
    </div>
  );
}
