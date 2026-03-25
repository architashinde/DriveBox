import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images:{
    remotePatterns:[{
      protocol: "https",
      hostname: "cdn.pixabay.com",
      
    },{
      protocol: "https",
      hostname: 'cloud.appwrite.io',
    },{
      protocol: "https",
      hostname: "img.freepik.com",
    }
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy : "default-src 'self'; script-src 'none'; sandbox;",
  }
};

export default nextConfig;
