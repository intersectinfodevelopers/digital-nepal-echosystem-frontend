import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROLE_HOME_ROUTE: Record<string, string> = {
  CENTRAL_ADMIN: "/central/dashboard",
  PROVINCE_ADMIN: "/province/dashboard",
  LOCAL_BODY_ADMIN: "/municipality/dashboard",
  WARD_ADMIN: "/ward/dashboard",
};

function parseAuthToken(token?: string | null) {
  if (!token) return null;
  try {
    const raw = typeof atob !== "undefined" ? atob(token) : Buffer.from(token, "base64").toString("utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;
  const token = request.cookies.get("auth_token")?.value ?? null;
  const payload = parseAuthToken(token);

  // allow public landing page, login page, and API routes
  if (pathname === "/" || pathname === "/login" || pathname.startsWith("/api/")) {
    if (payload && payload.role && (pathname === "/login" || pathname === "/")) {
      const home = ROLE_HOME_ROUTE[payload.role] ?? "/login";
      return NextResponse.redirect(new URL(home, request.url));
    }
    return NextResponse.next();
  }

  // protect role sections
  const isProtected = ["/central", "/province", "/municipality", "/ward"].some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  if (!payload || !payload.role) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const role = payload.role as string;
  const assigned = ROLE_HOME_ROUTE[role] ?? "/login";

  // if user tries to visit a section that doesn't match their role, redirect them
  if (pathname.startsWith("/central") && role !== "CENTRAL_ADMIN") return NextResponse.redirect(new URL(assigned, request.url));
  if (pathname.startsWith("/province") && role !== "PROVINCE_ADMIN") return NextResponse.redirect(new URL(assigned, request.url));
  if (pathname.startsWith("/municipality") && role !== "LOCAL_BODY_ADMIN") return NextResponse.redirect(new URL(assigned, request.url));
  if (pathname.startsWith("/ward") && role !== "WARD_ADMIN") return NextResponse.redirect(new URL(assigned, request.url));

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/central/:path*",
    "/province/:path*",
    "/municipality/:path*",
    "/ward/:path*",
  ],
};
