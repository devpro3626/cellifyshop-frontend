import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  async redirects() {
    return [
      { source: "/shop", destination: "/products", permanent: true },
      { source: "/shop/:category", destination: "/products/:category", permanent: true },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90],
    // Optimised images are cached for 30 days; product photos rarely change at the same URL.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Product and category images can be any https link added in the admin portal.
    // Narrow this to your image hosts (e.g. a CDN) once they are settled.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
