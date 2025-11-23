// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // We configure webpack's minimizer below to remove console.* calls in production.
  // Note: do not set `swcMinify` here — newer Next versions may reject it.

  webpack: (config, { dev, isServer }) => {
    // Only modify client production bundle
    if (!dev && !isServer) {
      try {
        // require inside function to avoid loader issues
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const TerserPlugin = require('terser-webpack-plugin');

        // Ensure config.optimization exists
        config.optimization = config.optimization || {};

        const existingMinimizers = (config.optimization.minimizer as any[]) || [];

        // Replace existing TerserPlugin instances to enable drop_console
        const replaced = existingMinimizers.map((m) => {
          if (m && m.constructor && m.constructor.name === 'TerserPlugin') {
            return new TerserPlugin({
              terserOptions: {
                compress: {
                  drop_console: true,
                  drop_debugger: true,
                },
              },
              extractComments: false,
            });
          }
          return m;
        });

        // If no TerserPlugin was present, add one
        const hasTerser = replaced.some((m) => m && m.constructor && m.constructor.name === 'TerserPlugin');
        if (!hasTerser) {
          replaced.push(new TerserPlugin({
            terserOptions: {
              compress: {
                drop_console: true,
                drop_debugger: true,
              },
            },
            extractComments: false,
          }));
        }

        config.optimization.minimizer = replaced;
      } catch (err) {
        // If terser is not available or something fails, fail gracefully
        // eslint-disable-next-line no-console
        console.warn('[next.config] Failed to configure Terser drop_console:', err);
      }
    }

    return config;
  },
};

export default nextConfig;
