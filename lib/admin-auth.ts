import 'server-only';
import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export type AdminRole = 'owner' | 'staff';

export interface AdminSession {
  userId: number;
  name: string;
  role: AdminRole;
}

export const SESSION_COOKIE = 'admin_session';
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

// Keying material for signing. Prefer a dedicated SESSION_SECRET; fall back to
// DATABASE_URL (always set) so prod never breaks before the secret is added.
function secret(): string {
  const s = process.env.SESSION_SECRET || process.env.DATABASE_URL;
  if (!s) throw new Error('SESSION_SECRET (or DATABASE_URL) must be set to sign admin sessions');
  return s;
}

const b64url = (buf: Buffer) => buf.toString('base64url');

function sign(payload: string): string {
  return b64url(createHmac('sha256', secret()).update(payload).digest());
}

/** Produce a tamper-proof cookie value: <base64url(json)>.<base64url(hmac)> */
export function serializeSession(session: AdminSession): string {
  const payload = b64url(Buffer.from(JSON.stringify(session)));
  return `${payload}.${sign(payload)}`;
}

function parseSession(raw: string): AdminSession | null {
  const dot = raw.lastIndexOf('.');
  if (dot < 0) return null;
  const payload = raw.slice(0, dot);
  const providedSig = raw.slice(dot + 1);
  const expectedSig = sign(payload);
  // Constant-time compare; bail if lengths differ.
  if (providedSig.length !== expectedSig.length) return null;
  if (!timingSafeEqual(Buffer.from(providedSig), Buffer.from(expectedSig))) return null;
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString()) as AdminSession;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  return parseSession(raw);
}

/** Redirect to login if not authenticated. Redirect to /admin if insufficient role. */
export async function requireAdmin(role?: AdminRole): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');
  if (role === 'owner' && session.role !== 'owner') redirect('/admin');
  return session;
}
