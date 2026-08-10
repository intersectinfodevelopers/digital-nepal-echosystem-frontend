import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


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

  
  const isTargetingAdminRoute =
    nextUrl.pathname.startsWith('/central') ||
    nextUrl.pathname.startsWith('/province') ||
    nextUrl.pathname.startsWith('/district') ||
    nextUrl.pathname.startsWith('/municipality');

  
  if (nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  
  if (isTargetingAdminRoute && !tokenCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

 
  if (tokenCookie) {
    try {
      // Decode the Base64 token payload safely on the server side
      const tokenData = JSON.parse(atob(tokenCookie.value)) as TokenPayload;
      const userRole = tokenData.role as keyof typeof ROLE_ROUTES;
      const assignedDashboard = ROLE_ROUTES[userRole];

      
      if (!assignedDashboard) {
        if (nextUrl.pathname === '/login') {
          return NextResponse.next();
        }
        return NextResponse.redirect(new URL('/login', request.url));
      }

     
      if (nextUrl.pathname === '/login') {
        return NextResponse.redirect(new URL(assignedDashboard, request.url));
      }
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
      
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }
  }
  return NextResponse.next();
}


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