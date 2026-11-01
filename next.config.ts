import type { NextConfig } from "next";

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  // 1. Stable Turbopack
  turbopack: {},

  // 2. Remove logs in production (Keep this, it's good!)
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" 
      ? { exclude: ["error"] } 
      : false,
  },

  // 3. 🚨 REWRITES: The Magic Bridge 🚨
  // /api routes are handled by src/app/api/[...path]/route.ts with 300s configurable timeout.
  // /auth routes are rewritten directly.
  async rewrites() {
    return [
      {
        source: "/auth/:path*",
        destination: `${BACKEND_URL}/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
