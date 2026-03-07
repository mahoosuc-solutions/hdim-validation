import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/validation",
  env: {
    NEXT_PUBLIC_BASE_PATH: "/validation",
  },
};

export default nextConfig;
