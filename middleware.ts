// Middleware to strictly enforce authentication BEFORE content loading
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Check if route is protected
  const protectedPaths = ["/dashboard"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (!isProtected) {
    return NextResponse.next();
  }

  // 2. Check for Token Existence
  const access = req.cookies.get("accessToken");
  const refresh = req.cookies.get("refreshToken");
  const trial = req.cookies.get("trialAccess");
  const hasTokens = access || refresh || trial;

  if (!hasTokens) {
    // No tokens -> Immediate Redirect
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 3. Strict Verification: Call Backend to check validity
  // This prevents "entering" with an expired cookie.
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    // Pass cookies to backend
    const cookieHeader = req.headers.get("cookie") || "";

    const res = await fetch(`${API_URL}/api/account/me`, {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
    });

    if (res.status === 401) {
      // Backend rejected the token -> Redirect to Login
      // This ensures invalid/expired tokens don't load the dashboard shell.
      const response = NextResponse.redirect(new URL("/login", req.url));

      // Optional: Clear invalid cookies so browser doesn't send them again immediately
      response.cookies.delete("accessToken");
      response.cookies.delete("refreshToken");

      return response;
    }

    // If API error (500, etc), we might choose to let it through to show an error page, 
    // or block. For "strict auth", usually block if we can't verify.
    // But safely, if accessing dashboard and backend is 500, user sees error page.

  } catch (error) {
    console.error("Middleware Auth Check Failed:", error);
    // FAIL CLOSED: If we cannot verify the token (e.g. backend down/network error), 
    // strictly redirect to login to prevent "entering" unauthenticated.
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

// Only run middleware on dashboard routes
export const config = {
  matcher: ["/dashboard/:path*"],
};
