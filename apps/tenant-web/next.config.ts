import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // rewrites removed in favor of manual API proxy
  serverExternalPackages: [],
  experimental: {
    // next-intl usa isso
  },
  allowedDevOrigins: ['127.0.0.1', 'localhost', '::1'],
};

export default nextConfig;
