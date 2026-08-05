import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Exact Route Protection Matrix Configuration
const ROLE_ROUTES = {
  CENTRAL_ADMIN: '/central/analytics',
  PROVINCE_ADMIN: '/province/dashboard',
  DISTRICT_ADMIN: '/district/dashboard',
  WARD_ADMIN: '/ward/dashboard',
  LOCAL_BODY_ADMIN: '/municipality/dashboard',
} as const;

export function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const tokenCookie = request.cookies.get('auth_token');

  // Check which administrative tier route is being targeted
  const isTargetingAdminRoute = 
    nextUrl.pathname.startsWith('/central') ||
    nextUrl.pathname.startsWith('/province') ||
    nextUrl.pathname.startsWith('/district') ||
    nextUrl.pathname.startsWith('/ward') ||
    nextUrl.pathname.startsWith('/municipality');

  // Rule 1: No Token? Redirect straight back to /auth/login
  if (isTargetingAdminRoute && !tokenCookie) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Rule 2: If token exists, parse it and enforce access controls
  if (tokenCookie) {
    try {
      // Decode the Base64 token payload safely on the server side
      const tokenData = JSON.parse(atob(tokenCookie.value));
      const userRole = tokenData.role as keyof typeof ROLE_ROUTES;
      const assignedDashboard = ROLE_ROUTES[userRole];

      // If they are already logged in and try to visit /auth/login, bypass to their dashboard
      if (nextUrl.pathname === '/auth/login') {
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
      if (nextUrl.pathname.startsWith('/ward') && userRole !== 'WARD_ADMIN') {
        return NextResponse.redirect(new URL(assignedDashboard, request.url));
      }
      if (nextUrl.pathname.startsWith('/municipality') && userRole !== 'LOCAL_BODY_ADMIN') {
        return NextResponse.redirect(new URL(assignedDashboard, request.url));
      }

    } catch {
      // If the cookie is corrupted or modified, delete it and redirect to login
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }
  }

  return NextResponse.next();
}

// Optimization matcher configuration
export const config = {
  matcher: [
    '/auth/login',
    '/central/:path*',
    '/province/:path*',
    '/district/:path*',
    '/ward/:path*',
    '/municipality/:path*',
  ],
};