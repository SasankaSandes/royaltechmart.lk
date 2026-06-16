import Link from 'next/link';
import { logoutAction } from '@/app/admin/actions';
import type { AdminSession } from '@/lib/admin-auth';

// ── Icons — declared as functions so they hoist above NAV ─────────────────────
function icon(path: string) {
  return function Icon({ active }: { active: boolean }) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#111110' : 'rgba(255,255,255,.6)'}
        strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d={path} />
      </svg>
    );
  };
}

function GridIcon({ active }: { active: boolean })  { return icon('M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z')({ active }); }
function BoxIcon({ active }: { active: boolean })   { return icon('M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16zM12 22V12M3.27 6.96L12 12.01l8.73-5.05M12 2.04V12')({ active }); }
function ImageIcon({ active }: { active: boolean }) { return icon('M21 15a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10zM8.5 9.5a1 1 0 100-2 1 1 0 000 2zM21 15l-5-5L5 21')({ active }); }
function ListIcon({ active }: { active: boolean })  { return icon('M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h6M9 16h4')({ active }); }
function TruckIcon({ active }: { active: boolean }) { return icon('M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM18.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3z')({ active }); }
function ChartIcon({ active }: { active: boolean }) { return icon('M18 20V10M12 20V4M6 20v-6')({ active }); }
function UserIcon({ active }: { active: boolean })  { return icon('M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z')({ active }); }

const NAV = [
  { href: '/admin',           label: 'Dashboard',  icon: GridIcon,   phase: 1 },
  { href: '/admin/products',  label: 'Products',   icon: BoxIcon,    phase: 1 },
  { href: '/admin/banners',   label: 'Banners',    icon: ImageIcon,  phase: 1 },
  { href: '/admin/account',   label: 'Account',    icon: UserIcon,   phase: 1 },
  { href: '/admin/orders',    label: 'Orders',     icon: ListIcon,   phase: 2 },
  { href: '/admin/suppliers', label: 'Suppliers',  icon: TruckIcon,  phase: 3 },
  { href: '/admin/sales',     label: 'Sales',      icon: ChartIcon,  phase: 3 },
];

export default function AdminShell({
  session,
  active,
  children,
}: {
  session: AdminSession;
  active: string; // href of the active nav item
  children: React.ReactNode;
}) {
  // Sprint 1 + 2 live for everyone; Sprint 3 (Suppliers/Sales) is owner-only.
  const phaseAvailable = (phase: number) => phase <= 2 || (phase === 3 && session.role === 'owner');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'var(--font-body)' }}>
      {/* ── Sidebar ───────────────────────────────────────── */}
      <aside style={{
        width: 220, flexShrink: 0,
        background: '#111110', color: '#fff',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <span style={{
              background: '#FDEA0A', borderRadius: 8, width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-head)', fontWeight: 800, color: '#111110', fontSize: 14,
            }}>N</span>
            <div>
              <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 14, color: '#fff' }}>Novatek</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 1 }}>Admin</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px' }}>
          {NAV.map(({ href, label, icon: Icon, phase }) => {
            const available = phaseAvailable(phase);
            const isActive = active === href;
            return (
              <div key={href}>
                {available ? (
                  <Link href={href} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px', borderRadius: 8, marginBottom: 2,
                    textDecoration: 'none', fontSize: 14, fontWeight: isActive ? 600 : 400,
                    background: isActive ? '#FDEA0A' : 'transparent',
                    color: isActive ? '#111110' : 'rgba(255,255,255,.75)',
                    transition: 'background .15s, color .15s',
                  }}>
                    <Icon active={isActive} />
                    {label}
                  </Link>
                ) : (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px', borderRadius: 8, marginBottom: 2,
                    fontSize: 14, color: 'rgba(255,255,255,.25)', cursor: 'not-allowed',
                  }}>
                    <Icon active={false} />
                    {label}
                    <span style={{
                      marginLeft: 'auto', fontSize: 10, fontFamily: 'var(--mono)',
                      background: 'rgba(255,255,255,.08)', borderRadius: 4, padding: '2px 6px',
                    }}>soon</span>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ padding: '8px 12px', marginBottom: 6 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{session.name}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', textTransform: 'capitalize', marginTop: 2 }}>{session.role}</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <Link href="/" target="_blank" style={{
              flex: 1, padding: '7px 10px', fontSize: 12, textAlign: 'center',
              color: 'rgba(255,255,255,.5)', border: '1px solid rgba(255,255,255,.12)',
              borderRadius: 6, textDecoration: 'none',
            }}>View site ↗</Link>
            <form action={logoutAction} style={{ flex: 1 }}>
              <button type="submit" style={{
                width: '100%', padding: '7px 10px', fontSize: 12,
                color: 'rgba(255,255,255,.5)', background: 'transparent',
                border: '1px solid rgba(255,255,255,.12)', borderRadius: 6, cursor: 'pointer',
              }}>Log out</button>
            </form>
          </div>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────── */}
      <main style={{ flex: 1, background: '#F5F5F3', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}

