/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Enable modern image formats
    formats: ['image/avif', 'image/webp'],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    // Image sizes for srcset generation
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Remote patterns for external images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/**',
      },
    ],
    // Minimum cache lifetime (seconds)
    minimumCacheTTL: 60,
  },
  // Experimental features for performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  // Compiler optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  distDir: './.next',
  turbopack: {
    root: './',
  },
}

module.exports = nextConfig
