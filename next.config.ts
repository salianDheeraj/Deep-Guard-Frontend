import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Move turbopack to the top level (Stable in v16)
  // An empty object {} is enough to acknowledge you are using it.
  turbopack: {},

  // 2. Use the built-in compiler options to remove console logs
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" 
      ? { exclude: ["error"] } 
      : false,
  },

  // 3. Remove the 'experimental' block entirely if it's empty
};

export default nextConfig;