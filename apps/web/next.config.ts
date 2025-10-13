import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  transpilePackages: ["@asksync/shared"],
};

export default nextConfig;
