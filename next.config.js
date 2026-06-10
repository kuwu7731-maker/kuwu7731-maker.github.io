/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { fs: false, net: false, tls: false }
    
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 10000,
        maxSize: 5000000,
        cacheGroups: {
          default: false,
          vendors: false,
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
          },
          lib: {
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|hoist-non-react-statics)[\\/]/,
            name: 'vendors-react',
            chunks: 'all',
            priority: 40,
          },
          framer: {
            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            name: 'vendors-framer',
            chunks: 'all',
            priority: 30,
          },
          lucide: {
            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            name: 'vendors-lucide',
            chunks: 'all',
            priority: 30,
          },
          next: {
            test: /[\\/]node_modules[\\/]next[\\/]/,
            name: 'vendors-next',
            chunks: 'all',
            priority: 20,
          },
        },
      }
    }
    
    return config
  },
}

export default nextConfig