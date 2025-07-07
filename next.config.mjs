/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false, // Habilitar optimización
    domains: [
      'api-v3.findify.io',
      'www.bandmerch.com',
      'bandmerch.com',
      'cdn.findify.io',
      'rockabilia.com',
      'www.rockabilia.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.findify.io',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '**.bandmerch.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '**.rockabilia.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'http',
        hostname: '**.findify.io',
        port: '',
        pathname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
}

export default nextConfig
