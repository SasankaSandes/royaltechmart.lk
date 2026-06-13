import { loginAction } from '../actions';

export default function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#111110', fontFamily: 'var(--font-body)',
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: 40, width: 360,
        boxShadow: '0 20px 60px rgba(0,0,0,.4)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <span style={{
            background: '#FDEA0A', borderRadius: 10, width: 40, height: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-head)', fontWeight: 800, color: '#111110', fontSize: 16,
          }}>N</span>
          <div>
            <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 16 }}>Novatek Admin</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 1 }}>Sign in to continue</div>
          </div>
        </div>

        <form action={loginAction} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Username
            </label>
            <input name="username" type="text" autoFocus required autoComplete="username"
              style={{
                width: '100%', height: 44, padding: '0 14px',
                border: '1.5px solid #e5e5e3', borderRadius: 10,
                fontSize: 15, fontFamily: 'var(--font-body)', outline: 'none',
                boxSizing: 'border-box',
              }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Password
            </label>
            <input name="password" type="password" required autoComplete="current-password"
              style={{
                width: '100%', height: 44, padding: '0 14px',
                border: '1.5px solid #e5e5e3', borderRadius: 10,
                fontSize: 15, fontFamily: 'var(--font-body)', outline: 'none',
                boxSizing: 'border-box',
              }} />
          </div>

          <button type="submit" style={{
            width: '100%', height: 46, background: '#111110', color: '#fff',
            border: 'none', borderRadius: 10,
            fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 4,
          }}>
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
