import type { NextConfig } from "next";

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
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
  // Reads process.env.NEXT_PUBLIC_API_URL dynamically
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
      {
        source: "/auth/:path*",
        destination: `${BACKEND_URL}/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;