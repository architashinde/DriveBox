import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images:{
    dangerouslyAllowSVG: true,
    contentSecurityPolicy : "default-src 'self'; script-src 'none'; sandbox;",
  }
};

export default nextConfig;
