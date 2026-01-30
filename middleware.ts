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
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 3. Strict Verification
  try {
    // ⚠️ MIDDLEWARE REQUIRES ABSOLUTE URL (Cannot be relative "")
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

    // ✅ FIX: Create the Next response allows the navigation
    const response = NextResponse.next();

    // 🚨 CRITICAL: Forward new cookies (Refreshed Tokens) to the browser
    // If backend rotated tokens, we must pass that "Set-Cookie" header along
    const setCookieHeader = res.headers.get("set-cookie");
    
    if (setCookieHeader) {
      // Depending on the environment, set-cookie might be a comma-separated string
      // or specific headers. This simple split works for most standard auth setups.
      // Ideally, simple forwarding is best:
      response.headers.set("Set-Cookie", setCookieHeader);
    }

    return response;

  } catch (error) {
    console.error("Middleware Auth Check Failed:", error);
    // Safety Net: If backend is down, don't let them in.
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};