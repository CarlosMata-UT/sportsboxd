import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'a.espncdn.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'www.basketball-reference.com' },
      { protocol: 'https', hostname: 'ak-static.cms.nba.com' },
      { protocol: 'https', hostname: 'cdn.nba.com' },
    ],
  },
};

export default nextConfig;
