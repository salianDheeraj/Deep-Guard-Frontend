import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Get tokens
  const access = req.cookies.get("accessToken");
  const refresh = req.cookies.get("refreshToken");
  const trial = req.cookies.get("trialAccess");
  const hasTokens = !!(access || refresh || trial);

  // 2. Define route matchers
  const protectedPaths = ["/dashboard"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  const authPaths = ["/login", "/signup"];
  const isAuthPath = authPaths.some((p) => pathname.startsWith(p));

  // 3. Handle root path redirect
  if (pathname === "/") {
    if (hasTokens) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 4. Redirect logged-in users away from auth pages to dashboard
  if (isAuthPath && hasTokens) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 5. Redirect unauthenticated users to login
  if (isProtected && !hasTokens) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 6. Strict Verification for Protected Paths
  if (isProtected && hasTokens) {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      // Construct headers manually to ensure cookie propagation
      const headers = new Headers();
      headers.append("Cookie", req.headers.get("cookie") || "");

      const res = await fetch(`${API_URL}/api/account/me`, {
        method: "GET",
        headers: headers,
      });

      if (res.status === 401) {
        const response = NextResponse.redirect(new URL("/login", req.url));
        response.cookies.delete("accessToken");
        response.cookies.delete("refreshToken");
        response.cookies.delete("trialAccess");
        return response;
      }

      const response = NextResponse.next();

      // Forward new cookies (rotated tokens) to the browser if set-cookie header exists
      const setCookieHeader = res.headers.get("set-cookie");
      if (setCookieHeader) {
        response.headers.set("Set-Cookie", setCookieHeader);
      }

      return response;
    } catch (error) {
      console.error("Middleware Auth Check Failed:", error);
      // Safety Net: If backend is down, don't let them in.
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/signup", "/try-without-account", "/dashboard/:path*"],
};