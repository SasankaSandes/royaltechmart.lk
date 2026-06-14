import { requireAdmin } from '@/lib/admin-auth';
import { getAllBanners } from '@/lib/db';
import AdminShell from '@/components/AdminShell';
import ConfirmButton from '@/components/ConfirmButton';
import {
  addBannerAction, editBannerAction, toggleBannerAction,
  deleteBannerAction, moveBannerAction,
} from '@/app/admin/actions';

export default async function BannersPage() {
  const session = await requireAdmin();
  const banners = await getAllBanners();

  return (
    <AdminShell session={session} active="/admin/banners">
      <div style={{ padding: 32 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 700, color: '#111110' }}>
            Banners
          </h1>
          <p style={{ color: '#888', fontSize: 14, marginTop: 2 }}>Homepage hero carousel — drag to reorder, toggle to show/hide.</p>
        </div>

        {/* Existing banners */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
          {banners.map((b, idx) => (
            <details key={b.id} style={{ background: '#fff', border: '1px solid #e5e5e3', borderRadius: 14, overflow: 'hidden' }}>
              <summary style={{
                padding: '14px 20px', cursor: 'pointer', listStyle: 'none',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                {/* Colour swatch */}
                <div style={{
                  width: 48, height: 32, borderRadius: 8, flexShrink: 0,
                  background: `linear-gradient(120deg, ${b.bgFrom}, ${b.bgTo})`,
                  border: '1px solid rgba(0,0,0,.08)',
                }} />
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#111110', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {b.title}
                  </div>
                  {b.eyebrow && <div style={{ fontSize: 12, color: '#aaa', marginTop: 1 }}>{b.eyebrow}</div>}
                </div>
                {/* Active badge */}
                <span style={{
                  fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 999, flexShrink: 0,
                  color: b.active ? '#1B8A4B' : '#888',
                  background: b.active ? '#d1fae5' : '#f0f0ee',
                }}>{b.active ? 'Active' : 'Hidden'}</span>
                {/* CTA */}
                <span style={{ fontSize: 13, color: '#888', whiteSpace: 'nowrap' }}>{b.ctaText} →</span>
                {/* Reorder */}
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  {idx > 0 && (
                    <form action={moveBannerAction}>
                      <input type="hidden" name="id" value={b.id} />
                      <input type="hidden" name="direction" value="up" />
                      <button type="submit" title="Move up" style={smallBtn}>↑</button>
                    </form>
                  )}
                  {idx < banners.length - 1 && (
                    <form action={moveBannerAction}>
                      <input type="hidden" name="id" value={b.id} />
                      <input type="hidden" name="direction" value="down" />
                      <button type="submit" title="Move down" style={smallBtn}>↓</button>
                    </form>
                  )}
                </div>
                <span style={{ color: '#aaa', fontSize: 18, flexShrink: 0 }}>›</span>
              </summary>

              {/* Edit form inside details */}
              <form action={editBannerAction} style={{ padding: '0 20px 20px', borderTop: '1px solid #f0f0ee', paddingTop: 16 }}>
                <input type="hidden" name="id" value={b.id} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <Row>
                    <Field label="Eyebrow text">
                      <input name="eyebrow" defaultValue={b.eyebrow ?? ''} placeholder="e.g. Sri Lanka's tech accessories store" style={inp} />
                    </Field>
                    <Field label="CTA text">
                      <input name="cta_text" defaultValue={b.ctaText} required style={inp} />
                    </Field>
                  </Row>
                  <Field label="Headline *">
                    <input name="title" defaultValue={b.title} required style={inp} />
                  </Field>
                  <Field label="Subtitle">
                    <input name="subtitle" defaultValue={b.subtitle ?? ''} placeholder="e.g. Pay on delivery · Island-wide" style={inp} />
                  </Field>
                  <Row>
                    <Field label="CTA link">
                      <input name="cta_url" defaultValue={b.ctaUrl} required style={inp} />
                    </Field>
                  </Row>
                  <Row>
                    <Field label="Background from">
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input name="bg_from" type="color" defaultValue={b.bgFrom}
                          style={{ width: 44, height: 40, border: '1.5px solid #e5e5e3', borderRadius: 8, padding: 2, cursor: 'pointer' }} />
                        <input type="text" defaultValue={b.bgFrom} readOnly style={{ ...inp, flex: 1 }} />
                      </div>
                    </Field>
                    <Field label="Background to">
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input name="bg_to" type="color" defaultValue={b.bgTo}
                          style={{ width: 44, height: 40, border: '1.5px solid #e5e5e3', borderRadius: 8, padding: 2, cursor: 'pointer' }} />
                        <input type="text" defaultValue={b.bgTo} readOnly style={{ ...inp, flex: 1 }} />
                      </div>
                    </Field>
                  </Row>
                  {/* Toggle uses this current-state value; edit ignores it */}
                  <input type="hidden" name="active" value={String(b.active)} />
                  <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    <button type="submit" style={{
                      height: 40, padding: '0 20px', background: '#111110', color: '#fff',
                      border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer',
                    }}>Save changes</button>
                    <button type="submit" formAction={toggleBannerAction} formNoValidate style={{
                      height: 40, padding: '0 20px', background: '#fff',
                      border: '1.5px solid #e5e5e3', borderRadius: 8,
                      fontWeight: 600, fontSize: 13, cursor: 'pointer', color: '#555',
                    }}>{b.active ? 'Hide banner' : 'Show banner'}</button>
                    <ConfirmButton message="Delete this banner?" formAction={deleteBannerAction} style={{
                      height: 40, padding: '0 16px', background: '#fff',
                      border: '1.5px solid #fee2e2', borderRadius: 8,
                      fontWeight: 600, fontSize: 13, cursor: 'pointer', color: '#B43B3B',
                    }}>Delete</ConfirmButton>
                  </div>
                </div>
              </form>
            </details>
          ))}
        </div>

        {/* Add new banner */}
        <div style={{ background: '#fff', border: '1px solid #e5e5e3', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0ee', background: '#fafafa' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#111110' }}>Add new banner</span>
          </div>
          <form action={addBannerAction} style={{ padding: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Row>
                <Field label="Eyebrow text">
                  <input name="eyebrow" placeholder="e.g. Just in" style={inp} />
                </Field>
                <Field label="CTA text">
                  <input name="cta_text" defaultValue="Shop Now" required style={inp} />
                </Field>
              </Row>
              <Field label="Headline *">
                <input name="title" required placeholder="e.g. New arrivals, every week" style={inp} />
              </Field>
              <Field label="Subtitle">
                <input name="subtitle" placeholder="e.g. Pay on delivery · Island-wide" style={inp} />
              </Field>
              <Field label="CTA link">
                <input name="cta_url" defaultValue="/shop" required style={inp} />
              </Field>
              <Row>
                <Field label="Background from">
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input name="bg_from" type="color" defaultValue="#19191a"
                      style={{ width: 44, height: 40, border: '1.5px solid #e5e5e3', borderRadius: 8, padding: 2, cursor: 'pointer' }} />
                  </div>
                </Field>
                <Field label="Background to">
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input name="bg_to" type="color" defaultValue="#2d2e2f"
                      style={{ width: 44, height: 40, border: '1.5px solid #e5e5e3', borderRadius: 8, padding: 2, cursor: 'pointer' }} />
                  </div>
                </Field>
              </Row>
              <div>
                <button type="submit" style={{
                  height: 42, padding: '0 22px', background: '#111110', color: '#fff',
                  border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer',
                }}>Add banner</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdminShell>
  );
}

const inp: React.CSSProperties = {
  width: '100%', height: 40, padding: '0 12px',
  border: '1.5px solid #e5e5e3', borderRadius: 8,
  fontSize: 13, fontFamily: 'var(--font-body)', outline: 'none',
  background: '#fff', boxSizing: 'border-box',
};

const smallBtn: React.CSSProperties = {
  width: 28, height: 28, border: '1.5px solid #e5e5e3', borderRadius: 6,
  background: '#fff', cursor: 'pointer', fontSize: 13, color: '#555',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      {children}
    </div>
  );
}
