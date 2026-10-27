import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "standalone",
  // Preview dev server (.larika/preview.json) dibuka lewat domain larika.id.
  allowedDevOrigins: ["*.larika.id"],
  experimental: {
    serverActions: {
      bodySizeLimit: "500mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "is3.cloudhost.id",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
