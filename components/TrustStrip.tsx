import { Icons } from './Icons';

const ITEMS = [
  { icon: Icons.check, title: '100% Genuine', sub: 'Sourced direct from brands' },
  { icon: Icons.truck, title: 'Island-wide Delivery', sub: 'Cash on delivery available' },
  { icon: Icons.shield, title: 'Warranty Backed', sub: 'Every product covered' },
  { icon: Icons.whatsapp, title: 'Order on WhatsApp', sub: 'Fast, easy, no app needed' },
];

export default function TrustStrip() {
  return (
    <section style={{ background: 'var(--ink)', color: '#fff', paddingBlock: 36 }}>
      <div className="wrap">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {ITEMS.map(item => (
            <div key={item.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <span style={{ color: 'var(--yellow)', flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{item.title}</p>
                <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 13 }}>{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 980px) {
          section .wrap > div { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          section .wrap > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
