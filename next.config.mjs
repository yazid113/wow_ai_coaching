/** @type {import('next').NextConfig} */
const nextConfig = {
  httpAgentOptions: {
    keepAlive: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    proxyTimeout: 120000,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wow.zamimg.com',
        pathname: '/images/**',
      },
    ],
  },
};

export default nextConfig;
