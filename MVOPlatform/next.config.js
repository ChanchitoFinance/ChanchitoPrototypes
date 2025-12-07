/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  webpack: (config, { isServer }) => {
    // Exclude fengari and related Node.js modules from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        module: false,
      }
      
      // Exclude fengari from client bundle
      config.externals = config.externals || []
      config.externals.push({
        fengari: 'commonjs fengari',
        '../lib/env-validation/javascript_adapter.js': 'commonjs ../lib/env-validation/javascript_adapter.js',
      })
      
      // Suppress webpack warnings about dynamic requires in fengari
      config.ignoreWarnings = [
        { module: /node_modules\/fengari/ },
        { message: /Critical dependency: the request of a dependency is an expression/ },
      ]
    }
    
    return config
  },
}

module.exports = nextConfig
