import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
import { getProductCount, getStockCounts, getAllBanners, getOrderStats } from '@/lib/db';
import { money } from '@/lib/catalog';
import AdminShell from '@/components/AdminShell';

export default async function AdminDashboard() {
  const session = await requireAdmin();
  const [total, stock, banners, orderStats] = await Promise.all([
    getProductCount(),
    getStockCounts(),
    getAllBanners(),
    getOrderStats(),
  ]);
  const activeBanners = banners.filter(b => b.active).length;

  return (
    <AdminShell session={session} active="/admin">
      <div style={{ padding: 32 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 700, color: '#111110' }}>
            Welcome back, {session.name.split(' ')[0]}
          </h1>
          <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>Here&apos;s what&apos;s happening with your store.</p>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          <StatCard label="Total products" value={total} sub="in catalog" color="#111110" />
          <StatCard label="In stock" value={stock.in} sub="products available" color="#1B8A4B" />
          <StatCard label="Low stock" value={stock.low} sub={stock.low > 0 ? 'reorder soon' : 'all good'} color={stock.low > 0 ? '#B4791B' : '#888'} />
          <StatCard label="Out of stock" value={stock.out} sub={stock.out > 0 ? 'needs attention' : 'all good'} color={stock.out > 0 ? '#B43B3B' : '#888'} />
        </div>

        {/* Alerts */}
        {(stock.out > 0 || stock.low > 0) && (
          <div style={{
            background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12,
            padding: '14px 18px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <div>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#92400e' }}>
                {stock.out > 0 && `${stock.out} product${stock.out > 1 ? 's' : ''} out of stock`}
                {stock.out > 0 && stock.low > 0 && ' · '}
                {stock.low > 0 && `${stock.low} product${stock.low > 1 ? 's' : ''} low on stock`}
              </span>
              <p style={{ fontSize: 13, color: '#92400e', marginTop: 2, opacity: 0.8 }}>Update stock status in Products.</p>
            </div>
            <Link href="/admin/products" style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 600, color: '#92400e', textDecoration: 'none' }}>
              View products →
            </Link>
          </div>
        )}

        {/* Orders */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 600, color: '#111110' }}>
            Orders
          </h2>
          <Link href="/admin/orders" style={{ fontSize: 13, fontWeight: 600, color: '#888', textDecoration: 'none' }}>
            View all →
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          <StatCard label="Pending" value={orderStats.pending} sub={orderStats.pending > 0 ? 'need confirming' : 'all clear'} color={orderStats.pending > 0 ? '#B4791B' : '#888'} />
          <StatCard label="Processing" value={orderStats.processing} sub="being packed" color="#7A4FB4" />
          <StatCard label="Shipped" value={orderStats.shipped} sub="in transit" color="#1B6FB4" />
          <StatCardText label="COD in transit" value={money(orderStats.codPendingValue)} sub="to be collected" color="#1B8A4B" />
        </div>

        {/* Quick actions */}
        <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 600, marginBottom: 14, color: '#111110' }}>
          Quick actions
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <QuickLink href="/admin/orders/new" label="Log order" sub="Record a WhatsApp order" icon="🧾" />
          <QuickLink href="/admin/products/new" label="Add new product" sub="Add to the catalog" icon="+" />
          <QuickLink href="/admin/products" label="Manage products" sub={`${total} products · ${stock.out} out of stock`} icon="≡" />
          <QuickLink href="/admin/banners" label="Edit banners" sub={`${activeBanners} of ${banners.length} active`} icon="🖼" />
        </div>

        {session.role === 'owner' && (
          <>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 600, marginTop: 32, marginBottom: 14, color: '#111110' }}>
              Owner tools
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <QuickLink href="/admin/sales" label="Sales dashboard" sub="Revenue, margin & exports" icon="📊" />
              <QuickLink href="/admin/suppliers" label="Suppliers" sub="Costs & purchases" icon="🚚" />
              <QuickLink href="/admin/suppliers/new" label="Add supplier" sub="Onboard a new supplier" icon="+" />
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
}

function StatCardText({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e5e3', borderRadius: 12, padding: '18px 20px' }}>
      <div style={{ fontSize: 12, color: '#888', fontWeight: 500, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 22, fontFamily: 'var(--font-head)', fontWeight: 700, color, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#aaa', marginTop: 6 }}>{sub}</div>
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: number; sub: string; color: string }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e5e3', borderRadius: 12, padding: '18px 20px',
    }}>
      <div style={{ fontSize: 12, color: '#888', fontWeight: 500, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 32, fontFamily: 'var(--font-head)', fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#aaa', marginTop: 6 }}>{sub}</div>
    </div>
  );
}

function QuickLink({ href, label, sub, icon }: { href: string; label: string; sub: string; icon: string }) {
  return (
    <Link href={href} style={{
      display: 'block', background: '#fff', border: '1px solid #e5e5e3',
      borderRadius: 12, padding: '16px 18px', textDecoration: 'none',
    }}>
      <div style={{ fontSize: 20, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#111110', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 12, color: '#888' }}>{sub}</div>
    </Link>
  );
}
