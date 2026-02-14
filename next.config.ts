import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Reduce file locking issues on Windows (Next.js 16 EBUSY)
  experimental: {
    webpackBuildWorker: false,
  },
  serverExternalPackages: ['unpdf'],
};

export default nextConfig;
