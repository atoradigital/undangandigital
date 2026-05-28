import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dzlzthllnldchrufzrme.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        // Link tamu: /r/[slug]?to=... → diarahkan ke template /v/[slug]
        source:      '/r/:clientSlug',
        destination: '/v/:clientSlug',
      },
    ];
  },
};

export default nextConfig;