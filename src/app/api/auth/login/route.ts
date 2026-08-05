import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// rate limiter 
type RateEntry = { count: number; firstAttempt: number; blockedUntil?: number };
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_ATTEMPTS = 5; // allowed attempts per window
const RATE_LIMIT_BLOCK_MS = 5 * 60_000; // 5 minutes block after exceeding
interface GlobalWithLoginRateLimit {
  __loginRateLimit?: Map<string, RateEntry>;
}
const _global = globalThis as unknown as GlobalWithLoginRateLimit;
if (!_global.__loginRateLimit) _global.__loginRateLimit = new Map<string, RateEntry>();
const loginRateLimit: Map<string, RateEntry> = _global.__loginRateLimit as Map<string, RateEntry>;

const getClientIp = (req: Request) => {
  // prefer forwarded header, else unknown
  const fwd = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
  if (fwd) return String(fwd).split(',')[0].trim();
  return 'unknown';
};

interface LoginUserRecord {
  id: string;
  username: string;
  password: string;
  role: string;
  jurisdiction_id: string | null;
  is_active?: boolean;
}

const ROLE_ROUTES = {
  CENTRAL_ADMIN: '/central/analytics',
  PROVINCE_ADMIN: '/province/dashboard',
  DISTRICT_ADMIN: '/district/dashboard',
  WARD_ADMIN: '/ward/dashboard',
  LOCAL_BODY_ADMIN: '/municipality/dashboard',
} as const;

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Rate limiting by client IP
    const clientIp = getClientIp(request);
    const now = Date.now();
    const entry = loginRateLimit.get(clientIp) || { count: 0, firstAttempt: now };

    // reset window if expired
    if (now - entry.firstAttempt > RATE_LIMIT_WINDOW_MS) {
      entry.count = 0;
      entry.firstAttempt = now;
      entry.blockedUntil = undefined;
    }

    if (entry.blockedUntil && entry.blockedUntil > now) {
      const retryAfter = Math.ceil((entry.blockedUntil - now) / 1000);
      return NextResponse.json(
        { success: false, error: 'Too many attempts. Try again later.' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }

    entry.count = (entry.count || 0) + 1;
    loginRateLimit.set(clientIp, entry);

    if (entry.count > RATE_LIMIT_MAX_ATTEMPTS) {
      entry.blockedUntil = now + RATE_LIMIT_BLOCK_MS;
      const retryAfter = Math.ceil(RATE_LIMIT_BLOCK_MS / 1000);
      return NextResponse.json(
        { success: false, error: 'Too many attempts. Try again later.' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }

    const filePath = path.join(process.cwd(), 'data', 'users.json');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: 'Database resource file not found on server.' },
        { status: 500 }
      );
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const parsedData = JSON.parse(fileContent);
    const users = Array.isArray(parsedData) ? parsedData : parsedData.users;

    if (!Array.isArray(users)) {
      return NextResponse.json(
        { success: false, error: 'Invalid database format.' },
        { status: 500 }
      );
    }

    const user = users.find(
      (u: LoginUserRecord) => u.username && u.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (!user || user.password !== password) {
      // on failed login, keep rate limiter state (already incremented)
      return NextResponse.json(
        { success: false, error: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    if (!user.is_active) {
      return NextResponse.json(
        { success: false, error: 'Account deactivated.' },
        { status: 403 }
      );
    }

    const userRole = user.role as keyof typeof ROLE_ROUTES;
    const redirectTo = ROLE_ROUTES[userRole] || '/unauthorized';

    // successful login - reset rate limiter for this IP
    try {
      const ip = getClientIp(request);
      loginRateLimit.delete(ip);
    } catch {
      // ignore
    }

    // Create a minimal session token (base64 payload). In production use a signed JWT.
    const tokenPayload = {
      id: user.id,
      role: user.role,
      username: user.username,
      jurisdiction_id: user.jurisdiction_id,
      createdAt: new Date().toISOString(),
    };
    const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

    const res = NextResponse.json({
      success: true,
      redirectTo,
      user: {
        id: user.id,
        role: user.role,
        username: user.username,
        jurisdiction_id: user.jurisdiction_id,
      },
    });

    // Set HttpOnly secure cookie so client-side JS cannot read the token
    try {
      res.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 8, // 8 hours
      });
    } catch {
      // Continue without cookie if runtime doesn't support res.cookies
    }

    return res;
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal database processing error.' },
      { status: 500 }
    );
  }
}