import {createHmac, timingSafeEqual} from 'crypto';

// Static admin login: credentials come from ADMIN_USERNAME / ADMIN_PASSWORD (set in Vercel).
// A successful login sets an httpOnly cookie holding a signed, expiring token.
export const SESSION_COOKIE = 'akh_admin';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export const credentialsConfigured = () => !!(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD);

// Changing ADMIN_PASSWORD (or ADMIN_SESSION_SECRET) invalidates every existing session.
function secret() {
  return process.env.ADMIN_SESSION_SECRET || `${process.env.ADMIN_USERNAME}:${process.env.ADMIN_PASSWORD}:akh-session`;
}

function sign(payload: string) {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function checkCredentials(username: string, password: string) {
  if (!credentialsConfigured()) return false;
  // Evaluate both comparisons so timing doesn't reveal which one failed.
  const u = safeEqual(username.trim(), process.env.ADMIN_USERNAME!);
  const p = safeEqual(password, process.env.ADMIN_PASSWORD!);
  return u && p;
}

export function createSessionToken() {
  const payload = Buffer.from(JSON.stringify({u: process.env.ADMIN_USERNAME, exp: Date.now() + SESSION_MAX_AGE * 1000})).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined | null) {
  if (!token || !credentialsConfigured()) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig || !safeEqual(sig, sign(payload))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (typeof data.exp !== 'number' || data.exp < Date.now() || data.u !== process.env.ADMIN_USERNAME) return null;
    return {username: String(data.u)};
  } catch {
    return null;
  }
}

export function readCookie(req: Request, name: string) {
  const raw = req.headers.get('cookie') || '';
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i > -1 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}

export function sessionFromRequest(req: Request) {
  return verifySessionToken(readCookie(req, SESSION_COOKIE));
}

export function sessionCookieOptions(maxAge = SESSION_MAX_AGE) {
  return {httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/', maxAge};
}
