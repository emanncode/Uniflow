import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization: support Supabase Storage public URLs + common CDNs
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // Reduce header noise and enable some caching
  poweredByHeader: false,

  // Helpful headers for perf + security on static assets
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;