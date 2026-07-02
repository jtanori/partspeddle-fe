import type { NextConfig } from "next";
import { securityHeaderEntries } from "./src/lib/security-headers";

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        source: "/:path*",
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
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/listing",
        destination: "/search",
        permanent: true,
      },
      {
        source: "/detail/:id",
        destination: "/listing/:id",
        permanent: true,
      },
      {
        source: "/auth",
        destination: "/login",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
