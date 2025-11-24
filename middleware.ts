import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const access = req.cookies.get("accessToken");
  const refresh = req.cookies.get("refreshToken");

  const isLoggedIn = access || refresh;

  // Protected routes
  const protectedPaths = [
    "/dashboard",
  ];

  const { pathname } = req.nextUrl;
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  // If user tries to access protected page without cookies → redirect to login
  if (isProtected && !isLoggedIn) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Only run middleware on dashboard routes
export const config = {
  matcher: ["/dashboard/:path*"],
};
