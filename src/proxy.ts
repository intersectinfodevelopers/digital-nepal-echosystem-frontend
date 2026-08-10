import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Exact Route Protection Matrix Configuration
const ROLE_ROUTES = {
  CENTRAL_ADMIN: '/central/analytics',
  PROVINCE_ADMIN: '/province/dashboard',
  DISTRICT_ADMIN: '/district/dashboard',
  LOCAL_BODY_ADMIN: '/municipality/dashboard',
} as const;

type TokenPayload = {
  id: string;
  role: string;
  username: string;
  jurisdiction_id: string | null;
};

export function proxy(request: NextRequest) {
  const { nextUrl } = request;
  const tokenCookie = request.cookies.get('auth_token');

  // Check which administrative tier route is being targeted.
  // NOTE: /ward routes are protected client-side by the ward auth guard using
  // the localStorage mock session (ward-admins.json) and are intentionally left
  // out of the cookie-based matrix below.
  const isTargetingAdminRoute =
    nextUrl.pathname.startsWith('/central') ||
    nextUrl.pathname.startsWith('/province') ||
    nextUrl.pathname.startsWith('/district') ||
    nextUrl.pathname.startsWith('/municipality');

  // Rule 0: Root path must never expose a dashboard directly. Always require
  // a login first; the /login rule below will forward authenticated users to
  // their own dashboard.
  if (nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Rule 1: No Token? Redirect straight back to /login
  if (isTargetingAdminRoute && !tokenCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Rule 2: If token exists, parse it and enforce access controls
  if (tokenCookie) {
    try {
      // Decode the Base64 token payload safely on the server side
      const tokenData = JSON.parse(atob(tokenCookie.value)) as TokenPayload;
      const userRole = tokenData.role as keyof typeof ROLE_ROUTES;
      const assignedDashboard = ROLE_ROUTES[userRole];

      // Ward admins authenticate client-side via the mock session
      // (data/ward-admins.json + localStorage) and have no cookie dashboard,
      // so they must never be bounced to /undefined. Just let /login render
      // and the login page will forward them to their own dashboard.
      if (!assignedDashboard) {
        if (nextUrl.pathname === '/login') {
          return NextResponse.next();
        }
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // If they are already logged in and try to visit /login, bypass to their dashboard
      if (nextUrl.pathname === '/login') {
        return NextResponse.redirect(new URL(assignedDashboard, request.url));
      }

      // --- ROUTE PROTECTION MATRIX TIERS ---

      // If unauthorized tier attempts access, redirect them to their OWN dashboard
      if (nextUrl.pathname.startsWith('/central') && userRole !== 'CENTRAL_ADMIN') {
        return NextResponse.redirect(new URL(assignedDashboard, request.url));
      }
      if (nextUrl.pathname.startsWith('/province') && userRole !== 'PROVINCE_ADMIN') {
        return NextResponse.redirect(new URL(assignedDashboard, request.url));
      }
      if (nextUrl.pathname.startsWith('/district') && userRole !== 'DISTRICT_ADMIN') {
        return NextResponse.redirect(new URL(assignedDashboard, request.url));
      }
      if (nextUrl.pathname.startsWith('/municipality') && userRole !== 'LOCAL_BODY_ADMIN') {
        return NextResponse.redirect(new URL(assignedDashboard, request.url));
      }

    } catch {
      // If the cookie is corrupted or modified, delete it and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }
  }

  return NextResponse.next();
}

// Optimization matcher configuration
export const config = {
  matcher: [
    '/',
    '/login',
    '/central/:path*',
    '/province/:path*',
    '/district/:path*',
    '/municipality/:path*',
  ],
};