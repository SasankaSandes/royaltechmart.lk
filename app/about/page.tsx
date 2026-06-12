import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TrustStrip from '@/components/TrustStrip';
import WhatsAppFAB from '@/components/WhatsAppFAB';
import { waLink, FB_PAGE, EMAIL, PHONE } from '@/lib/catalog';
import { Icons } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'About — Royal Tech Mart',
  description: 'Sri Lanka\'s trusted mobile accessories store. Learn about Royal Tech Mart and how to reach us.',
};

const WHY = [
  { icon: Icons.check, title: '100% Genuine Products', body: 'Every item is sourced direct from authorised distributors. No fakes, no refurbs — just the real thing.' },
  { icon: Icons.truck, title: 'Island-wide Delivery', body: 'We deliver to all 25 districts. Cash on delivery available — pay when your order arrives.' },
  { icon: Icons.shield, title: 'Warranty Backed', body: 'All products carry manufacturer warranty. We handle claims so you don\'t have to.' },
  { icon: Icons.bolt, title: 'Fast WhatsApp Ordering', body: 'No accounts, no checkout forms. See something you like — one tap and your order is placed.' },
];

const FAQS = [
  { q: 'How do I place an order?', a: 'Click the "Order on WhatsApp" button on any product page. It opens WhatsApp with the product details pre-filled. Just send the message and we\'ll confirm your order.' },
  { q: 'Do you accept cash on delivery?', a: 'Yes! COD is available island-wide. Pay when your order arrives — no upfront payment needed.' },
  { q: 'How long does delivery take?', a: 'Orders typically arrive within 1–3 business days depending on your location. We\'ll keep you updated via WhatsApp.' },
  { q: 'What is your return policy?', a: 'We accept returns within 7 days of delivery for unused products in original packaging. Contact us on WhatsApp to initiate a return.' },
  { q: 'Are the products genuine?', a: 'Absolutely. We only source products from authorised distributors. Every item carries manufacturer warranty.' },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="section" style={{ background: 'var(--surface)' }}>
          <div className="wrap" style={{ maxWidth: 720 }}>
            <p className="eyebrow" style={{ marginBottom: 16 }}>Our story</p>
            <h1 style={{ fontSize: 'clamp(36px,5vw,56px)', marginBottom: 20, fontFamily: 'var(--font-head)' }}>
              Genuine mobile tech, royally priced.
            </h1>
            <p style={{ fontSize: 17, color: 'var(--ink-2)', lineHeight: 1.7 }}>
              Royal Tech Mart was built for Sri Lankan customers who want quality mobile accessories without the hassle. No overpriced stores, no fake products — just genuine tech, fair prices, and the simplest ordering experience possible.
            </p>
          </div>
        </section>

        {/* Why RTM + Contact */}
        <section className="section">
          <div className="wrap" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
            {/* Why RTM */}
            <div>
              <h2 style={{ fontSize: 'clamp(24px,3vw,34px)', marginBottom: 32 }}>Why Royal Tech Mart?</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                {WHY.map(item => (
                  <div key={item.title} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <span style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {item.icon}
                    </span>
                    <div>
                      <p style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{item.title}</p>
                      <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.65 }}>{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact card */}
            <div style={{ background: 'var(--ink)', color: '#fff', borderRadius: 'var(--radius-lg)', padding: 36 }}>
              <p style={{ fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,.4)', marginBottom: 20 }}>Get in touch</p>
              <h2 style={{ fontSize: 28, marginBottom: 8, color: '#fff' }}>We&apos;re always here</h2>
              <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 14, lineHeight: 1.65, marginBottom: 28 }}>
                The fastest way to reach us is WhatsApp — we typically reply within minutes during business hours.
              </p>

              <a href={waLink()} target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  background: 'var(--wa)', color: '#fff', fontWeight: 700, fontSize: 15,
                  padding: '14px 24px', borderRadius: 'var(--radius-sm)', marginBottom: 20,
                }}>
                {Icons.whatsapp} Chat on WhatsApp
              </a>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  [Icons.phone, PHONE, `tel:${PHONE}`],
                  [Icons.mail, EMAIL, `mailto:${EMAIL}`],
                  [Icons.facebook, 'facebook.com/royaltechmart', FB_PAGE],
                  [Icons.clock, 'Mon–Sat · 9am – 7pm', null],
                  [Icons.pin, 'Island-wide delivery · Sri Lanka', null],
                ].map(([icon, text, href], i) => (
                  href
                    ? <a key={i} href={href as string} target={(href as string).startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,.75)', fontSize: 14 }}>
                        <span style={{ flexShrink: 0, color: 'var(--yellow)' }}>{icon as React.ReactNode}</span>
                        {text as string}
                      </a>
                    : <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,.55)', fontSize: 14 }}>
                        <span style={{ flexShrink: 0 }}>{icon as React.ReactNode}</span>
                        {text as string}
                      </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <TrustStrip />

        {/* FAQ */}
        <section className="section">
          <div className="wrap" style={{ maxWidth: 720 }}>
            <p className="eyebrow" style={{ marginBottom: 16 }}>Questions</p>
            <h2 style={{ fontSize: 'clamp(24px,3vw,36px)', marginBottom: 40 }}>Frequently asked</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {FAQS.map((faq, i) => (
                <details key={i} style={{ borderTop: '1px solid var(--line)', paddingBlock: 20 }} open={i === 0}>
                  <summary style={{
                    fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 16,
                    cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    {faq.q}
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 20, color: 'var(--muted)', flexShrink: 0, marginLeft: 16 }}>+</span>
                  </summary>
                  <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.7, marginTop: 12 }}>{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section style={{ background: 'var(--yellow)', paddingBlock: 72 }}>
          <div className="wrap" style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', marginBottom: 16 }}>Ready to order?</h2>
            <p style={{ fontSize: 17, color: 'var(--ink-2)', marginBottom: 36, maxWidth: 480, marginInline: 'auto' }}>
              Browse the catalogue or chat directly on WhatsApp — we&apos;ll get you sorted.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/shop" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'var(--ink)', color: '#fff',
                padding: '13px 28px', borderRadius: 'var(--pill)', fontWeight: 700, fontSize: 15,
              }}>
                Browse the shop {Icons.arrow}
              </Link>
              <a href={waLink()} target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'transparent', color: 'var(--ink)',
                padding: '13px 28px', borderRadius: 'var(--pill)', fontWeight: 700, fontSize: 15,
                border: '2px solid var(--ink)',
              }}>
                {Icons.whatsapp} Chat to order
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFAB />
    </>
  );
}
