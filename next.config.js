/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  turbopack: {},
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  webpack: (config, { isServer }) => {
    config.resolve.fallback = { fs: false, net: false, tls: false }
    
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 10000,
        maxSize: 4500000,
        cacheGroups: {
          default: false,
          vendors: false,
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react-vendor',
            chunks: 'all',
            priority: 50,
          },
          framer: {
            test: /[\\/]node_modules[\\/](framer-motion|framer-motion-dom)[\\/]/,
            name: 'framer-vendor',
            chunks: 'all',
            priority: 40,
          },
          lucide: {
            test: /[\\/]node_modules[\\/](lucide-react)[\\/]/,
            name: 'lucide-vendor',
            chunks: 'all',
            priority: 40,
          },
          prisma: {
            test: /[\\/]node_modules[\\/]@prisma[\\/]/,
            name: 'prisma-vendor',
            chunks: 'all',
            priority: 30,
          },
          next: {
            test: /[\\/]node_modules[\\/](next|@next)[\\/]/,
            name: 'next-vendor',
            chunks: 'all',
            priority: 20,
          },
          other: {
            test: /[\\/]node_modules[\\/]/,
            name: 'other-vendor',
            chunks: 'all',
            priority: 10,
          },
        },
      }
    }
    
    return config
  },
}

export default nextConfig