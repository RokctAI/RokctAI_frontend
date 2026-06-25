/** @type {import('next').NextConfig} */
const nextConfig = {
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
