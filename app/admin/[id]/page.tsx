import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getProductById } from '@/lib/db';
import { money, itemCode, productUrl } from '@/lib/catalog';
import { saveProductAction } from '../actions';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const jar = await cookies();
  if (jar.get('admin_auth')?.value !== process.env.ADMIN_PASSWORD) redirect('/admin');

  const { id } = await params;
  const product = await getProductById(Number(id));
  if (!product) redirect('/admin');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', fontFamily: 'var(--font-body)' }}>
      <header style={{
        background: '#111110', color: '#fff', height: 60,
        display: 'flex', alignItems: 'center', paddingInline: 28, gap: 16,
      }}>
        <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, color: '#FDEA0A', fontSize: 16 }}>Novatek Admin</span>
        <span style={{ color: 'rgba(255,255,255,.3)' }}>›</span>
        <span style={{ color: 'rgba(255,255,255,.7)', fontSize: 14 }}>Edit product</span>
        <div style={{ flex: 1 }} />
        <Link href="/admin" style={{ color: 'rgba(255,255,255,.5)', fontSize: 13 }}>← All products</Link>
      </header>

      <div style={{ maxWidth: 680, marginInline: 'auto', padding: 32 }}>
        {/* Product header */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 6 }}>
            {itemCode(product.id)} · {product.category}
          </p>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 700 }}>{product.name}</h1>
          <a href={productUrl(product)} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4, display: 'inline-block' }}>
            View on site ↗
          </a>
        </div>

        <form action={saveProductAction} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <input type="hidden" name="id" value={product.id} />

          <div style={{
            background: '#fff', border: '1px solid var(--line)',
            borderRadius: 'var(--radius)', overflow: 'hidden',
          }}>
            {/* Name */}
            <Field label="Product name">
              <input name="name" defaultValue={product.name} required style={inputStyle} />
            </Field>

            {/* Price */}
            <Field label="Price (Rs.)">
              <input name="price" type="number" defaultValue={product.price} required min={0} style={inputStyle} />
            </Field>

            {/* Old price */}
            <Field label="Original price (Rs.) — leave blank to hide discount">
              <input name="old_price" type="number" defaultValue={product.oldPrice ?? ''} min={0} style={inputStyle}
                placeholder="e.g. 8000" />
            </Field>

            {/* Stock */}
            <Field label="Stock status">
              <select name="stock" defaultValue={product.stock} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="in">In stock</option>
                <option value="low">Low stock</option>
                <option value="out">Out of stock</option>
              </select>
            </Field>

            {/* Badge */}
            <Field label="Badge">
              <select name="badge" defaultValue={product.badge ?? ''} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">None</option>
                <option value="Trending">Trending</option>
                <option value="Featured">Featured</option>
                <option value="New">New</option>
              </select>
            </Field>

            {/* Short description */}
            <Field label="Short description">
              <textarea name="short" defaultValue={product.short} required rows={3}
                style={{ ...inputStyle, height: 'auto', paddingTop: 10, resize: 'vertical' }} />
            </Field>

            {/* Warranty */}
            <Field label="Warranty">
              <select name="warranty" defaultValue={product.warranty} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option>1 Year Warranty</option>
                <option>6 Months Warranty</option>
                <option>No Warranty</option>
              </select>
            </Field>
          </div>

          {/* Read-only specs preview */}
          {product.specs.length > 0 && (
            <div style={{ marginTop: 20, background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--muted)' }}>
                Specs (edit via import script or DB)
              </p>
              {product.specs.map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 16, fontSize: 13, paddingBlock: 6, borderBottom: '1px solid var(--line)' }}>
                  <span style={{ color: 'var(--muted)', width: 160, flexShrink: 0 }}>{k}</span>
                  <span style={{ fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button type="submit" style={{
              flex: 1, height: 48, background: '#111110', color: '#fff',
              border: 'none', borderRadius: 'var(--radius-sm)',
              fontWeight: 700, fontSize: 15, cursor: 'pointer',
            }}>
              Save changes
            </button>
            <Link href="/admin" style={{
              height: 48, display: 'flex', alignItems: 'center', padding: '0 24px',
              border: '1.5px solid var(--line)', borderRadius: 'var(--radius-sm)',
              fontSize: 14, fontWeight: 500, color: 'var(--ink-2)',
            }}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', height: 44, padding: '0 14px',
  border: 'none', borderBottom: '1px solid var(--line)',
  fontSize: 15, fontFamily: 'var(--font-body)',
  outline: 'none', background: 'transparent',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)' }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}
