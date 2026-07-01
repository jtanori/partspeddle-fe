import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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
