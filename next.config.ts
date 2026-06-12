import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // All product images are stored locally in /public/products — no remote domains needed.
    // Add domains here only if we ever hotlink external images.
    remotePatterns: [],
  },
};

export default nextConfig;
