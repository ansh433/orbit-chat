/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React.StrictMode for production
  reactStrictMode: process.env.NODE_ENV === 'production',
  
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lxy.blr1.digitaloceanspaces.com',
        port: '',
        pathname: '/generated-images/**',
      },
      {
        protocol: 'https',
        hostname: 'lxy.blr1.digitaloceanspaces.com',
        port: '',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'lxy.blr1.cdn.digitaloceanspaces.com',
        port: '',
        pathname: '/generated-images/**',
      },
      {
        protocol: 'https',
        hostname: 'lxy.blr1.cdn.digitaloceanspaces.com',
        port: '',
        pathname: '/uploads/**',
      },
      // Allow any DigitalOcean Spaces domain for flexibility
      {
        protocol: 'https',
        hostname: '*.digitaloceanspaces.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // Production optimizations
  poweredByHeader: false,
  compress: true,
  
  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
