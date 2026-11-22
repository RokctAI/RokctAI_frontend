/** @type {import('next').NextConfig} */
const nextConfig = {
  // The division hider reads divisions/*.json at request time (agent_sdk
  // 1.29.0): ship the folder with every server function.
  outputFileTracingIncludes: { "/*": ["./divisions/**/*"] },
  experimental: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "cdn.getmerlin.in",
      },
    ],
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  async rewrites() {
    return [
      {
        source: "/favicon.ico",
        destination: "/images/logo.svg",
      },
    ];
  },
};

export default nextConfig;
