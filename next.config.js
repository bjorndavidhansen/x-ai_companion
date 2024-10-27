// === next.config.js ===
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  
  eslint: {
    dirs: ['app', 'components', 'lib', 'types'],
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
  
  images: {
    domains: ['pbs.twimg.com'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  
  typescript: {
    ignoreBuildErrors: false,
  },
  
  experimental: {
    serverActions: true,
    instrumentationHook: true,
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;