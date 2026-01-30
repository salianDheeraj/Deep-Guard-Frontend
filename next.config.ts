import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
  // Add this section:
  async rewrites() {
    return [
      {
        // This matches any request starting with /api (or whatever your pattern is)
        // and sends it to your actual backend.
        source: '/api/:path*', 
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/:path*`,
      },
      {
        // Handle your auth paths specifically if they don't start with /api
        source: '/auth/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;