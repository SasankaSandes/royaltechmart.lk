import { requireAdmin } from '@/lib/admin-auth';
import AdminShell from '@/components/AdminShell';
import { getAllSiteSettings } from '@/lib/db';
import { updateSiteSettingsAction } from '@/app/admin/actions';
import React from 'react';

const inp: React.CSSProperties = {
  width: '100%', height: 44, padding: '0 12px',
  border: '1.5px solid #e5e5e3', borderRadius: 10,
  fontSize: 13, fontFamily: 'var(--font-body)', outline: 'none',
  background: '#fff', boxSizing: 'border-box',
};

const ta: React.CSSProperties = {
  width: '100%', padding: '10px 12px',
  border: '1.5px solid #e5e5e3', borderRadius: 10,
  fontSize: 13, fontFamily: 'var(--font-body)', outline: 'none',
  background: '#fff', boxSizing: 'border-box', resize: 'vertical',
};

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e5e3', borderRadius: 14, marginBottom: 20 }}>
      <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f0f0ee' }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111110', margin: 0 }}>{title}</h2>
        {description && <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{description}</p>}
      </div>
      <div style={{ padding: '20px 24px' }}>{children}</div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>{children}</div>;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      {children}
      {hint && <p style={{ fontSize: 11, color: '#aaa', marginTop: 5 }}>{hint}</p>}
    </div>
  );
}

export default async function SettingsPage() {
  const session = await requireAdmin('owner');
  const raw = await getAllSiteSettings();

  const s = {
    whatsapp_number: raw.whatsapp_number ?? '94764834970',
    fb_page:         raw.fb_page ?? '',
    instagram:       raw.instagram ?? '',
    tiktok:          raw.tiktok ?? '',
    phone:           raw.phone ?? '',
    email:           raw.email ?? '',
    delivery_price:  raw.delivery_price ?? '',
    delivery_sla:    raw.delivery_sla ?? '',
    order_message:   raw.order_message ?? 'Hi Novatek 👋\n\nI\'d like to order:\n• {name}\n• Price: {price}\n• Item code: {code}\n\nPlease share availability & delivery details.',
  };

  return (
    <AdminShell session={session} active="/admin/settings">
      <div style={{ padding: 32, maxWidth: 820 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 700, color: '#111110', margin: 0 }}>
            Site Settings
          </h1>
          <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>
            Configure WhatsApp, social links, contact info, and delivery details shown across the storefront.
          </p>
        </div>

        <form action={updateSiteSettingsAction}>
          {/* WhatsApp & Ordering */}
          <Card title="WhatsApp & Ordering" description="Controls the checkout experience for every product page.">
            <Field label="WhatsApp Number" hint="Digits only, including country code — e.g. 94764834970">
              <input name="whatsapp_number" style={inp} defaultValue={s.whatsapp_number} placeholder="94764834970" />
            </Field>
            <div style={{ marginTop: 14 }}>
              <Field label="Order Message Template" hint="Use {name}, {price}, {code} as placeholders for product details.">
                <textarea name="order_message" style={{ ...ta, minHeight: 130 }} defaultValue={s.order_message} />
              </Field>
            </div>
          </Card>

          {/* Social Links */}
          <Card title="Social Links" description="Shown in the site header, footer, and home page.">
            <Row>
              <Field label="Facebook Page URL">
                <input name="fb_page" style={inp} defaultValue={s.fb_page} placeholder="https://facebook.com/yourpage" />
              </Field>
              <Field label="Instagram URL">
                <input name="instagram" style={inp} defaultValue={s.instagram} placeholder="https://instagram.com/yourhandle" />
              </Field>
            </Row>
            <Field label="TikTok URL" hint="Leave blank to hide the TikTok link.">
              <input name="tiktok" style={inp} defaultValue={s.tiktok} placeholder="https://tiktok.com/@yourhandle" />
            </Field>
          </Card>

          {/* Contact Info */}
          <Card title="Contact Info" description="Displayed on the About page and in the footer.">
            <Row>
              <Field label="Phone Number">
                <input name="phone" style={inp} defaultValue={s.phone} placeholder="+94 76 483 4970" />
              </Field>
              <Field label="Email Address">
                <input name="email" style={inp} defaultValue={s.email} placeholder="hello@novatek.lk" />
              </Field>
            </Row>
          </Card>

          {/* Delivery */}
          <Card title="Delivery" description="Shown to customers on the storefront. Leave blank to hide.">
            <Row>
              <Field label="Delivery Price" hint='e.g. "Free" or "Rs. 250"'>
                <input name="delivery_price" style={inp} defaultValue={s.delivery_price} placeholder="Free" />
              </Field>
              <Field label="Delivery Time (SLA)" hint='e.g. "1–3 business days"'>
                <input name="delivery_sla" style={inp} defaultValue={s.delivery_sla} placeholder="1–3 business days" />
              </Field>
            </Row>
          </Card>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" style={{
              height: 44, padding: '0 28px',
              background: '#111110', color: '#fff',
              border: 'none', borderRadius: 10,
              fontWeight: 600, fontSize: 14, cursor: 'pointer',
            }}>
              Save settings
            </button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
