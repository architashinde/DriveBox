import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cloud.appwrite.io" },
      { protocol: "https", hostname: "fra.cloud.appwrite.io" },
      { protocol: "https", hostname: "nyc.cloud.appwrite.io" },
      { protocol: "https", hostname: "syd.cloud.appwrite.io" },
    ],
  },
};

export default nextConfig;