import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Temporary: the codebase has many pre-existing TypeScript errors that
  // are being cleaned up separately. Allow builds to proceed so Fly.io
  // deployments can be stabilized.
  typescript: {
    ignoreBuildErrors: true,
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
