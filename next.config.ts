import type { NextConfig } from "next";

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
  // This tells Next.js: "If you see /api/..., send it to the backend URL"
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
      {
        source: "/auth/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;