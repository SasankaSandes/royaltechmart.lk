import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';
import { getProductById, getProductSuppliers, getAllSuppliers } from '@/lib/db';
import { money, itemCode, productUrl } from '@/lib/catalog';
import { saveProductAction, setProductSupplierAction, removeProductSupplierAction } from '@/app/admin/actions';
import AdminShell from '@/components/AdminShell';
import SpecsEditor from '@/components/SpecsEditor';
import { CATEGORIES } from '@/lib/catalog';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  const { id } = await params;
  const [product, productSuppliers, allSuppliers] = await Promise.all([
    getProductById(Number(id)),
    getProductSuppliers(Number(id)),
    getAllSuppliers(),
  ]);
  if (!product) redirect('/admin/products');

  const linkedSupplierIds = new Set(productSuppliers.map(s => s.supplierId));
  const unlinkedSuppliers = allSuppliers.filter(s => !linkedSupplierIds.has(s.id));

  return (
    <AdminShell session={session} active="/admin/products">
      <div style={{ padding: 32, maxWidth: 720 }}>
        <div style={{ marginBottom: 24 }}>
          <Link href="/admin/products" style={{ fontSize: 13, color: '#888', textDecoration: 'none' }}>← Products</Link>
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 700, color: '#111110' }}>
              {product.name}
            </h1>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: '#888' }}>{itemCode(product.id)}</span>
          </div>
          <a href={productUrl(product)} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 13, color: '#888', marginTop: 2, display: 'inline-block' }}>
            View on site ↗
          </a>
        </div>

        <form action={saveProductAction} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <input type="hidden" name="id" value={product.id} />

          <Card title="Basic info">
            <Field label="Product name *">
              <input name="name" required defaultValue={product.name} style={inp} />
            </Field>
            <Field label="Category *">
              <select name="category" defaultValue={product.category} style={{ ...inp, cursor: 'pointer' }}>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Short description *">
              <textarea name="short" required rows={3} defaultValue={product.short}
                style={{ ...inp, height: 'auto', paddingTop: 10, paddingBottom: 10, resize: 'vertical' }} />
            </Field>
          </Card>

          <Card title="Pricing">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Selling price (Rs.) *">
                <input name="price" type="number" required min={0} defaultValue={product.price} style={inp} />
              </Field>
              <Field label="Original price (Rs.) — shows crossed-out">
                <input name="old_price" type="number" min={0} defaultValue={product.oldPrice ?? ''} placeholder="Leave blank to hide" style={inp} />
              </Field>
            </div>
          </Card>

          <Card title="Status & badge">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Stock status *">
                <select name="stock" defaultValue={product.stock} style={{ ...inp, cursor: 'pointer' }}>
                  <option value="in">In stock</option>
                  <option value="low">Low stock</option>
                  <option value="out">Out of stock</option>
                </select>
              </Field>
              <Field label="Badge">
                <select name="badge" defaultValue={product.badge ?? ''} style={{ ...inp, cursor: 'pointer' }}>
                  <option value="">None</option>
                  <option value="Trending">Trending</option>
                  <option value="Featured">Featured</option>
                  <option value="New">New</option>
                </select>
              </Field>
            </div>
            <Field label="Warranty">
              <select name="warranty" defaultValue={product.warranty} style={{ ...inp, cursor: 'pointer' }}>
                <option>1 Year Warranty</option>
                <option>6 Months Warranty</option>
                <option>No Warranty</option>
              </select>
            </Field>
          </Card>

          <Card title="Product image">
            <Field label="Image path or URL">
              <input name="image" type="text" defaultValue={product.image ?? ''}
                placeholder="/products/1.jpg or https://..."
                style={inp} />
            </Field>
            {product.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.image} alt={product.name}
                style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e5e3' }} />
            )}
          </Card>

          <Card title="Card colours">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="From colour">
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input name="tone_from" type="color" defaultValue={product.tone[0]}
                    style={{ width: 40, height: 38, padding: 2, border: '1.5px solid #e5e5e3', borderRadius: 8, cursor: 'pointer' }} />
                  <input type="text" defaultValue={product.tone[0]}
                    placeholder="#FDEA0A" style={{ ...inp, flex: 1 }} readOnly />
                </div>
              </Field>
              <Field label="To colour">
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input name="tone_to" type="color" defaultValue={product.tone[1]}
                    style={{ width: 40, height: 38, padding: 2, border: '1.5px solid #e5e5e3', borderRadius: 8, cursor: 'pointer' }} />
                  <input type="text" defaultValue={product.tone[1]}
                    placeholder="#222222" style={{ ...inp, flex: 1 }} readOnly />
                </div>
              </Field>
            </div>
          </Card>

          <Card title="Specifications">
            <SpecsEditor initial={product.specs} />
          </Card>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" style={{
              flex: 1, height: 48, background: '#111110', color: '#fff',
              border: 'none', borderRadius: 10,
              fontWeight: 700, fontSize: 15, cursor: 'pointer',
            }}>
              Save changes
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

        {/* Suppliers & Cost — separate section outside the main product form */}
        <div style={{ marginTop: 20 }}>
          <Card title="Suppliers & cost">
            {productSuppliers.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f0f0ee' }}>
                    <th style={{ textAlign: 'left', padding: '6px 0', fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Supplier</th>
                    <th style={{ textAlign: 'left', padding: '6px 0', fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cost price</th>
                    <th style={{ textAlign: 'left', padding: '6px 0', fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Supplier code</th>
                    <th style={{ textAlign: 'left', padding: '6px 0', fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Last purchased</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {productSuppliers.map(s => (
                    <tr key={s.supplierId} style={{ borderBottom: '1px solid #f8f8f6' }}>
                      <td style={{ padding: '10px 0', fontWeight: 500 }}>{s.supplierName}</td>
                      <td style={{ padding: '10px 0', fontFamily: 'var(--mono)', fontSize: 13 }}>Rs. {money(s.costPrice)}</td>
                      <td style={{ padding: '10px 0', color: '#888', fontSize: 13 }}>{s.supplierProductCode ?? '—'}</td>
                      <td style={{ padding: '10px 0', color: '#888', fontSize: 13 }}>
                        {s.lastPurchaseDate ? s.lastPurchaseDate.toLocaleDateString('en-LK', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td style={{ padding: '10px 0', textAlign: 'right' }}>
                        <form action={removeProductSupplierAction} style={{ display: 'inline' }}>
                          <input type="hidden" name="product_id" value={product!.id} />
                          <input type="hidden" name="supplier_id" value={s.supplierId} />
                          <button type="submit" style={{ background: 'none', border: 'none', color: '#d00', fontSize: 13, cursor: 'pointer', padding: '4px 8px' }}>Remove</button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ fontSize: 13, color: '#aaa', margin: 0 }}>No suppliers linked yet.</p>
            )}

            {unlinkedSuppliers.length > 0 && (
              <form action={setProductSupplierAction} style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap', marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0ee' }}>
                <input type="hidden" name="product_id" value={product!.id} />
                <div style={{ flex: '1 1 160px' }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Supplier</label>
                  <select name="supplier_id" required style={{ ...inp, cursor: 'pointer' }}>
                    <option value="">Select supplier…</option>
                    {unlinkedSuppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: '0 1 140px' }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cost price (Rs.)</label>
                  <input name="cost_price" type="number" required min={0} placeholder="0" style={inp} />
                </div>
                <div style={{ flex: '0 1 140px' }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Supplier code</label>
                  <input name="supplier_product_code" type="text" placeholder="Optional" style={inp} />
                </div>
                <button type="submit" style={{
                  height: 44, padding: '0 20px', background: '#111110', color: '#fff',
                  border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}>
                  Add supplier
                </button>
              </form>
            )}
          </Card>
        </div>
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
