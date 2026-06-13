import { requireAdmin } from '@/lib/admin-auth';
import AdminShell from '@/components/AdminShell';
import { changePasswordAction } from '@/app/admin/actions';

const ERRORS: Record<string, string> = {
  missing: 'Please fill in all fields.',
  short: 'New password must be at least 8 characters.',
  mismatch: "New passwords don't match.",
  current: 'Current password is incorrect.',
};

const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: '#555', display: 'block',
  marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em',
};
const inputStyle: React.CSSProperties = {
  width: '100%', height: 44, padding: '0 14px',
  border: '1.5px solid #e5e5e3', borderRadius: 10,
  fontSize: 15, fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box',
};

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const session = await requireAdmin();
  const { error, ok } = await searchParams;

  return (
    <AdminShell session={session} active="/admin/account">
      <div style={{ padding: 32 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 700, color: '#111110' }}>Account</h1>
          <p style={{ color: '#888', fontSize: 14, marginTop: 2 }}>
            Signed in as <strong>{session.name}</strong> ({session.role})
          </p>
        </div>

        <div style={{ background: '#fff', borderRadius: 14, padding: 28, maxWidth: 460, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 17, fontWeight: 700, color: '#111110', marginBottom: 4 }}>Change password</h2>
          <p style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>Use at least 8 characters.</p>

          {error && (
            <div style={{ background: '#fee2e2', color: '#B43B3B', fontSize: 13, fontWeight: 500, padding: '10px 14px', borderRadius: 8, marginBottom: 18 }}>
              {ERRORS[error] ?? 'Something went wrong.'}
            </div>
          )}
          {ok && (
            <div style={{ background: '#d1fae5', color: '#1B8A4B', fontSize: 13, fontWeight: 500, padding: '10px 14px', borderRadius: 8, marginBottom: 18 }}>
              Password updated.
            </div>
          )}

          <form action={changePasswordAction} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Current password</label>
              <input name="current" type="password" required autoComplete="current-password" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>New password</label>
              <input name="next" type="password" required minLength={8} autoComplete="new-password" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Confirm new password</label>
              <input name="confirm" type="password" required minLength={8} autoComplete="new-password" style={inputStyle} />
            </div>
            <button type="submit" style={{
              height: 46, background: '#111110', color: '#fff', border: 'none', borderRadius: 10,
              fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 4,
            }}>
              Update password
            </button>
          </form>
        </div>
      </div>
    </AdminShell>
  );
}
