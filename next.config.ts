import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['@libsql/client'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
    ],
  },
}

export default nextConfig
