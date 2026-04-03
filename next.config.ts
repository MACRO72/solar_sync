import type { NextConfig } from "next";
import path from "path";
const nextConfig: NextConfig = {
  devIndicators: false,

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
    ],
  },

  // 🔥 ADD THIS PART (CRITICAL FIX)
  webpack: (config: any) => {
    // Aliases for react/react-dom removed because they override Next.js's internal
    // server-side component dispatcher, causing "Cannot read properties of null (reading 'useRef')"
    return config;
  },
};

export default nextConfig;