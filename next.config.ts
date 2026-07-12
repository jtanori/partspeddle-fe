import type { NextConfig } from 'next';
import { securityHeaderEntries } from './src/lib/security-headers';

const nextConfig: NextConfig = {
  output: 'standalone',
  api: {
    bodyParser: {
      sizeLimit: '2mb',
    },
  },
  async headers() {
    // Content-Security-Policy is intentionally omitted here. It is set with a
    // per-request nonce by src/proxy.ts so Next.js App Router can hydrate
    // safely without allowing 'unsafe-inline' scripts globally.
    return [
      {
        source: '/:path*',
        headers: securityHeaderEntries().map(({ key, value }) => ({
          key,
          value,
        })),
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/listing',
        destination: '/search',
        permanent: true,
      },
      {
        source: '/detail/:id',
        destination: '/listing/:id',
        permanent: true,
      },
      {
        source: '/auth',
        destination: '/login',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
